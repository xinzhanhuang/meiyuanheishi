const axios = require('axios');
const cheerio = require('cheerio');
const cloud = require('wx-server-sdk');
cloud.init();
const db = cloud.database();
const collection = db.collection('ssss');

const urls = [
  {
    name: '展览讯息',
    url: 'https://www.tjarts.edu.cn/index/zlxx.htm',
    base: 'https://www.tjarts.edu.cn',
    selector: 'div.notice-fl',
    dateSelector: 'div.fr.notice-fr',
    type: 'list'
  },
  {
    name: '通知公告',
    url: 'https://www.tjarts.edu.cn/index/tzgg.htm',
    base: 'https://www.tjarts.edu.cn',
    selector: 'div.notice-fl',
    dateSelector: 'div.fr.notice-fr',
    type: 'list'
  },
  {
    name: '校园新闻',
    url: 'https://www.tjarts.edu.cn/xyxw.jsp?urltype=tree.TreeTempUrl&wbtreeid=1155',
    base: 'https://www.tjarts.edu.cn',
    selector: 'div.res-title.animate',
    contentSelector: 'div.res-info',
    type: 'news'
  }
];

async function fetchSection(section) {
  try {
    const res = await axios.get(section.url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const $ = cheerio.load(res.data);
    const items = [];

    if (section.type === 'list') {
      $(section.selector).each((i, el) => {
        const title = $(el).text().trim().replace(/^·\s*/, '');
        const date = $(el).siblings(section.dateSelector).text().trim();
        const href = $(el).find('a').attr('href');
        const link = href ? new URL(href, section.base).href : section.url;
        if (title) items.push({ section: section.name, date, title, link });
      });
    } else if (section.type === 'news') {
      $(section.selector).each((i, el) => {
        const title = $(el).text().trim();
        const link = $(el).find('a').attr('href');
        const fullLink = link ? new URL(link, section.base).href : section.url;
        const content = $(el).siblings(section.contentSelector).text().trim();
        const dateMatch = content.match(/2025[-/.]\d{1,2}[-/.]\d{1,2}/);
        const date = dateMatch ? dateMatch[0] : '';
        if (title) items.push({ section: section.name, date, title, link: fullLink });
      });
    }

    return items;
  } catch (error) {
    console.error(`Error fetching ${section.name}:`, error.message);
    return [];
  }
}

exports.main = async () => {
  try {
    const allItems = [];
    for (const section of urls) {
      const items = await fetchSection(section);
      allItems.push(...items);
    }

    if (allItems.length === 0) {
      return { success: false, error: '未抓取到任何新闻内容' };
    }

    const textForAI = allItems.map(item => `${item.section} | ${item.date} | ${item.title}`).join('\n');

    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const todayStr = `${yyyy}-${mm}-${dd}`;

    const aiResponse = await axios.post('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
      model: "glm-4-flash",
      messages: [
        {
          role: 'user',
          content: `请根据以下通知公告新闻列表，去除非当天时间（${todayStr}）的信息，生成一份格式简洁的当日的日报总结，如果没有当天的信息则返回boolean：false。\n${textForAI}`
        }
      ],
      do_sample: true,
      stream: false,
      temperature: 0.95,
      top_p: 0.7,
      max_tokens: 1024
    }, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.ZHIPU_API_KEY || ''}`
      }
    });

    const summary = aiResponse.data.choices?.[0]?.message?.content || '';

    // 判断 AI 返回是否是 false（字符串或布尔）
    if (summary.trim().toLowerCase() === 'false' || summary === false) {
      // 不存数据库，直接返回 false
      return {
        success: false,
        error: '无当天信息，AI返回false',
        itemCount: 0,
        summary: false
      };
    }
    
    // 正常存数据库
    await collection.add({
      data: {
        date: new Date(),
        summary,
        rawItems: allItems,
        createdAt: new Date()
      }
    });
    
    return {
      success: true,
      itemCount: allItems.length,
      summary
    };

  } catch (err) {
    console.error('AI 请求出错：', err.message, err.response?.data || err);
    return { success: false, error: 'AI 请求失败' };
  }
};
