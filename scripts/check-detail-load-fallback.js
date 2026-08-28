const assert = require('assert');
const fs = require('fs');

const normal = fs.readFileSync('miniprogram/utils/plate2-data.js', 'utf8');
const nearby = fs.readFileSync('miniprogram/pages/plate-zhoubian/plate-zhoubian.js', 'utf8');

assert(/if \(!id\) \{\s+this\.setData\(\{ ss_xx: 0, loadingHidden: true \}\);/.test(normal));
assert(normal.includes('updates.loadingHidden = true;'));
assert(normal.includes("console.error('加载帖子失败', err);"));
assert(nearby.includes('if (!id) {\n      this.setData({ ss_xx: 0 })'));
assert(nearby.includes("console.error('加载周边帖子失败', err)"));
assert.strictEqual((normal.match(/title: '加载失败，请稍后重试'/g) || []).length, 1);
assert.strictEqual((nearby.match(/title: '加载失败，请稍后重试'/g) || []).length, 1);
console.log('detail load fallback checks passed');
