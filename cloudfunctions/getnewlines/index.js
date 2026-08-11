// cloudfunctions/getnewlines/index.js
const cloud = require('wx-server-sdk');
const axios = require('axios');

cloud.init({
    env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();
const queueCollection = db.collection('work_queue');
const stateCollection = db.collection('fetch_states');

const TOKEN = process.env.WECHAT_ARTICLE_TOKEN || '';
const BASE_URL = 'http://47.117.133.51:30015';

// Configuration for monitoring targets
const TARGETS = [
    {
        name: '艺术招聘',
        userphoto: 'cloud://tafaheishi-1gs4bxsvcf864035.7461-tafaheishi-1gs4bxsvcf864035-1316611774/userphoto/1690816568133.png',
        wxid: 'gh_561f3e6b2964'
    }, {
        name: '艺术就业',
        userphoto: 'cloud://tafaheishi-1gs4bxsvcf864035.7461-tafaheishi-1gs4bxsvcf864035-1316611774/userphoto/1668149995424.png',
        wxid: 'zpeveryart'
    }
];

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function formatTime(timestamp) {
    const date = new Date(timestamp * 1000);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}`;
}

async function fetchFromJustOne(target) {
    const url = `${BASE_URL}/api/weixin/get-user-post/v1?token=${TOKEN}&wxid=${target.wxid}`;

    for (let i = 0; i < 10; i++) {
        try {
            console.log(`Fetching from ${target.name} (Attempt ${i + 1})...`);
            const response = await axios.get(url);

            if (response.data && response.data.code === 0 && response.data.data) {
                const responsePayload = response.data.data;
                const list = responsePayload.list || responsePayload.data || [];
                if (list.length === 0) {
                    console.log(`${target.name}: Received Code 0 but empty list.`);
                }
                return list;
            } else if (response.data && response.data.code === 301) {
                console.log(`${target.name}: Code 301 (Processing), waiting 3s...`);
                await sleep(3000);
            } else {
                throw new Error(`API Error ${response.data.code}: ${response.data.message}`);
            }
        } catch (err) {
            console.error(`Error fetching ${target.name}:`, err.message);
            await sleep(1000);
        }
    }
    throw new Error(`${target.name}: Max retries exceeded`);
}

exports.main = async (event, context) => {
    // 0. Pre-check: Only fetch if queue is empty
    try {
        const queueCount = await queueCollection.count();
        if (queueCount.total > 0) {
            console.log(`Queue has ${queueCount.total} pending items. Skipping fetch.`);
            return { success: true, msg: `Queue not empty (${queueCount.total} pending). Skipped.`, stats: { skipped: true } };
        }
    } catch (e) {
        console.error('Queue count failed:', e);
    }

    let stats = {
        totalFetched: 0,
        added: 0,
        errors: []
    };

    try {
        for (const target of TARGETS) {
            try {
                // 1. Get Last State (Checkpoint)
                let lastTime = 0;
                let stateId = null;

                const stateRes = await stateCollection.where({
                    source_name: target.name
                }).get();

                if (stateRes.data.length > 0) {
                    lastTime = stateRes.data[0].last_time;
                    stateId = stateRes.data[0]._id;
                    console.log(`${target.name}: Checkpoint is ${lastTime} (${formatTime(lastTime)})`);
                } else {
                    console.log(`${target.name}: No checkpoint found, starting from 0.`);
                }

                // 2. Fetch API
                const pushList = await fetchFromJustOne(target);

                let maxTimeInBatch = lastTime;
                let newItems = [];

                // 3. Flatten and Filter
                for (const push of pushList) {
                    const postTime = push.time;

                    // Core Logic: Only accept articles NEWER than checkpoint
                    if (postTime <= lastTime) {
                        continue;
                    }

                    // Track maximum time to update checkpoint later
                    if (postTime > maxTimeInBatch) {
                        maxTimeInBatch = postTime;
                    }

                    const postTimeStr = formatTime(postTime);

                    if (push.articles && Array.isArray(push.articles)) {
                        for (const article of push.articles) {
                            // URL Cleaning
                            let cleanUrl = article.url;
                            if (cleanUrl.indexOf('&scene=') > -1) {
                                cleanUrl = cleanUrl.split('&scene=')[0];
                            }

                            newItems.push({
                                title: article.title,
                                url: cleanUrl,
                                post_time: postTime,
                                post_time_str: postTimeStr,
                                source_name: target.name,
                                userphoto: target.userphoto,
                                created_at: db.serverDate()
                            });
                        }
                    }
                }

                stats.totalFetched += newItems.length;

                // 4. Batch Add to Queue
                // In-memory dedup (just in case API sends dupes in same batch)
                const uniqueItems = [];
                const seenUrls = new Set();
                for (const item of newItems) {
                    if (!seenUrls.has(item.url)) {
                        seenUrls.add(item.url);
                        uniqueItems.push(item);
                    }
                }

                console.log(`${target.name}: Found ${uniqueItems.length} new articles to enqueue.`);

                for (const item of uniqueItems) {
                    try {
                        // Double check uniqueness in DB before add
                        // Although unique index on URL in work_queue should handle this,
                        // a manual check saves error logs.
                        const count = await queueCollection.where({ url: item.url }).count();
                        if (count.total === 0) {
                            // Debug logging to verify item structure before add
                            if (!item.url || item.url.trim() === '') {
                                console.warn("Skipping item with empty/null URL:", item);
                                continue;
                            }
                            console.log(`Adding item to queue: ${item.title}, URL: ${item.url}`);
                            await queueCollection.add({ data: item });
                            stats.added++;
                        }
                    } catch (e) {
                        console.error('Queue add error:', e.message);
                    }
                }

                // 5. Update Checkpoint
                // Only update if we actually moved forward in time
                if (maxTimeInBatch > lastTime) {
                    if (stateId) {
                        await stateCollection.doc(stateId).update({
                            data: { last_time: maxTimeInBatch }
                        });
                    } else {
                        await stateCollection.add({
                            data: {
                                source_name: target.name,
                                last_time: maxTimeInBatch
                            }
                        });
                    }
                    console.log(`${target.name}: Checkpoint updated to ${maxTimeInBatch} (${formatTime(maxTimeInBatch)})`);
                }

            } catch (err) {
                console.error(`Failed to process ${target.name}:`, err.message);
                stats.errors.push(`${target.name}: ${err.message}`);
            }
        }

        return { success: true, stats };
    } catch (err) {
        return { success: false, error: err.message };
    }
};
