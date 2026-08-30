// cloudfunctions/getworkmessage/index.js
const cloud = require('wx-server-sdk');
const axios = require('axios');
const cheerio = require('cheerio');

cloud.init({
    env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();
const queueCollection = db.collection('work_queue');
const ssCollection = db.collection('ss');
const DEFAULT_SCHOOL_ID = 'tjarts';

async function isAdmin(openid) {
    if (!openid) return false;
    const userResult = await db.collection('users').where({ _openid: openid }).limit(1).get();
    const user = userResult.data[0];
    if (!user) return false;
    const systemResult = await db.collection('system').doc('system01').get();
    const ids = systemResult.data && systemResult.data.system && systemResult.data.system.glids;
    return Array.isArray(ids) && ids.includes(user._id);
}

exports.main = async (event = {}, context) => {
    const adminAction = ['deleteQueue', 'approvePost', 'deletePost'].includes(event.action);
    const manualInvocation = Boolean(event.url || event.articleId || adminAction);
    if (manualInvocation && !await isAdmin(cloud.getWXContext().OPENID)) {
        return { success: false, errCode: 'PERMISSION_DENIED', msg: 'Admin required.' };
    }
    if (adminAction) {
        if (typeof event.id !== 'string' || !event.id) {
            return { success: false, errCode: 'INVALID_ARGUMENT' };
        }
        if (event.action === 'deleteQueue') await queueCollection.doc(event.id).remove();
        if (event.action === 'approvePost') {
            await ssCollection.doc(event.id).update({ data: { 'ss_xx.sstype': false } });
        }
        if (event.action === 'deletePost') await ssCollection.doc(event.id).remove();
        return { success: true, action: event.action };
    }
    // 1. Fetch batch of tasks from Queue
    // Limit to 2 per run for stability
    const BATCH_SIZE = 2;

    // Support direct invocation (for manual single processing)
    let manualTask = null;
    if (event.url) {
        manualTask = {
            url: event.url,
            title: '',
            source_name: 'Manual',
            userphoto: '', // Default placeholder if needed
            title: 'Manual Task'
        };
    } else if (event.articleId) {
        // Support picking a specific task from queue by ID
        const res = await queueCollection.doc(event.articleId).get();
        manualTask = res.data;
    }

    let tasks = [];
    if (manualTask) {
        tasks = [manualTask];
    } else {
        const res = await queueCollection.limit(BATCH_SIZE).get();
        tasks = res.data;
    }

    if (tasks.length === 0) {
        return { success: true, msg: 'Queue is empty.' };
    }

    let stats = {
        total: tasks.length,
        success: 0,
        filtered: 0,
        errors: 0
    };

    // 2. Process Batch (Merge Logic)
    console.log(`Fetched ${tasks.length} tasks to merge.`);

    // A. Parallel Fetch Content
    const contentList = await Promise.all(tasks.map(async (task) => {
        try {
            console.log(`Fetching: ${task.title}`);
            const response = await axios.get(task.url, {
                timeout: 10000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
                    'Accept-Language': 'zh-CN,zh;q=0.9',
                    'Referer': 'https://mp.weixin.qq.com/'
                }
            });
            const $ = cheerio.load(response.data);
            if ($('.weui-msg__title.warn').text().includes('参数错误')) throw new Error('WeChat Blocked (Param Error)');

            // Try multiple selectors
            let text = $('#js_content').text().trim() || $('.rich_media_content').text().trim() || $('#img-content').text().trim();

            if (!text || text.length < 10) {
                throw new Error(`Content too short or empty (len=${text ? text.length : 0})`);
            }

            text = text.replace(/\s+/g, ' ').substring(0, 10000);
            return { success: true, task: task, content: text };
        } catch (e) {
            console.error(`Fetch failed for ${task.title}: ${e.message}`);
            return { success: false, task: task, error: e.message }; // Return error detail
        }
    }));

    // Filter successful valid contents
    const validItems = contentList.filter(item => item.success && item.content);

    // Remove failed/empty items from queue (optional: or keep them? assuming hard fail for now to clear queue)
    const failedItems = contentList.filter(item => !item.success || !item.content);
    for (const item of failedItems) {
        stats.errors++;
    }

    if (validItems.length === 0) {
        // Collect errors for debugging
        const errorDetails = contentList.map(i => i.error || 'Unknown').join('; ');
        return { success: false, msg: `Fetch Failed: ${errorDetails}` };
    }

    // B. Prepare Merged Data
    // Combine Titles (Dedup)
    const uniqueTitles = [...new Set(validItems.map(i => i.task.title))];
    const combinedTitle = uniqueTitles.join(' & ');

    // Combine Content for AI
    let mergedContentPrompt = "";
    validItems.forEach((item, index) => {
        mergedContentPrompt += `\n\n=== 文章 ${index + 1} ===\n标题：${item.task.title}\n内容：${item.content}`;
    });

    // C. AI Analysis (One Call)
    let aiResult = '';
    for (let i = 0; i < 3; i++) {
        try {
            const aiResponse = await axios.post('https://api.deepseek.com/chat/completions', {
                model: "deepseek-chat",
                messages: [
                    {
                        role: 'user',
                        content: `1、请阅读以下 ${validItems.length} 篇文章的内容，判断它们是否包含招聘、工作机会、艺术驻留、展览招募、征稿启事等信息？
2、如果不包含任何相关信息，请返回 "CANCEL"。
3、如果包含，请将所有文章里的有效信息**合并整理**为一个清单。请忽略重复的信息。
4、格式要求：【纯文本】，使用emoji和换行分段，清晰列出。包含字段：标题、岗位、地点、联系方式、简介(简要概括)。
\n${mergedContentPrompt}
\n5、绝对不要出现 #, *, -, _ 等Markdown符号。`
                    }
                ],
                stream: false,
                temperature: 1.0
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY || ''}`
                },
                timeout: 30000
            });
            aiResult = aiResponse.data.choices?.[0]?.message?.content || '';
            break;
        } catch (e) {
            console.error('AI Call failed, retrying...', e.message);
            if (i === 2) {
                stats.errors++;
                // prevent save
            }
            await new Promise(r => setTimeout(r, 1000));
        }
    }

    // D. Save & Cleanup
    if (aiResult.trim().includes('CANCEL')) {
        console.log('Merged content filtered by AI.');
        stats.filtered += validItems.length;
        // Delete all processed items
        for (const item of validItems) {
            if (item.task._id) await queueCollection.doc(item.task._id).remove();
        }
    } else if (aiResult) {
        // Save Combined Result
        await ssCollection.add({
            data: {
                schoolId: DEFAULT_SCHOOL_ID,
                ss_xx: {
                    title: combinedTitle, // Combined Title
                    choosetitle: "💰工作",
                    firsttime: new Date().getTime(),
                    username: validItems[0].task.source_name || '聚合来源', // Use first source or generic
                    zhuanye: ["信息聚合", "艺术岗位"],
                    gender: "",
                    userphoto: validItems[0].task.userphoto || '', // Use first photo
                    nr: aiResult,
                    orderdetail: { takeorder: false, takeorderid: "", takeordername: "", takeorderphone: "", openlocationtitle: "" },
                    tp: [], huifunr: [], huifunb: 0, dianzanid: [], Mazhu: [], dianzannb: 0, jubao: [[], 0], look: 0, lzid: '1111112222233334444', sstype: false
                },
                time: new Date().getTime(),
                _openid: 'CLOUD_FUNCTION_AUTO',
            }
        });
        console.log('Saved merged result to SS.');
        stats.success++;

        // Delete all processed items from Queue
        for (const item of validItems) {
            if (item.task._id) await queueCollection.doc(item.task._id).remove();
        }
    }

    return {
        success: true,
        stats: stats
    };
};
