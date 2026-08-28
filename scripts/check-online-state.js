const assert = require('assert');
const fs = require('fs');

const source = fs.readFileSync('miniprogram/app.js', 'utf8');
assert(source.includes('this.updateOnlineState(true)'));
assert(source.includes('this.updateOnlineState(false)'));
assert(source.includes('updateOnlineState(online) {'));
assert(source.includes("callCloudFunction('login', { action: 'setOnline', online })"));
assert(source.includes("console.warn('更新在线状态失败', err)"));
assert(source.indexOf('this.checkUpdate()') < source.indexOf('this.updateOnlineState(true)'));
console.log('online state checks passed');
