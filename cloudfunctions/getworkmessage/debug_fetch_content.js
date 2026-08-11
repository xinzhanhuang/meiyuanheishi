const axios = require('axios');
const cheerio = require('cheerio');

async function debugFetch() {
    const url = 'https://mp.weixin.qq.com/s/W56yQju0wYwnLPAK2UgKZg';
    console.log('Fetching:', url);

    try {
        const response = await axios.get(url, {
            timeout: 15000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.2(0x18000236) NetType/WIFI Language/zh_CN'
            }
        });

        console.log('Status:', response.status);
        const $ = cheerio.load(response.data);

        if ($('.weui-msg__title.warn').text().includes('参数错误')) {
            console.log('Detected: User Block / Parameter Error');
            return;
        }

        let content = $('#js_content').text().trim() || $('.rich_media_content').text().trim();
        console.log('Content Length:', content.length);
        console.log('Content Preview (first 500 chars):');
        console.log(content.substring(0, 500));

        if (content.length < 100) {
            console.log('WARNING: Content is very short. Might be a login page or redirect.');
            console.log('Full Body:', response.data);
        }

    } catch (err) {
        console.error('Error:', err.message);
    }
}

debugFetch();
