const assert = require('assert');
const fs = require('fs');

const login = fs.readFileSync('miniprogram/pages/my/wd/wd.js', 'utf8');
const profile = fs.readFileSync('miniprogram/pages/my/set/set.js', 'utf8');
const saveStart = profile.indexOf('tijiao(e) {');
const saveEnd = profile.indexOf('\n  genderchoose1()', saveStart);
const saveFlow = profile.slice(saveStart, saveEnd);

assert(!login.includes('wx.getUserProfile'));
assert(login.includes("title: '登录失败，请稍后重试'"));
assert(saveFlow.includes('wx.hideLoading()'));
assert(saveFlow.includes('consumePendingPostTarget'));
assert(saveFlow.includes("console.error('更新用户资料失败', err)"));
assert(saveFlow.includes("title: '保存失败，请稍后重试'"));
assert(saveFlow.indexOf('consumePendingPostTarget') > saveFlow.indexOf('}).then(res => {'));
console.log('login failure checks passed');
