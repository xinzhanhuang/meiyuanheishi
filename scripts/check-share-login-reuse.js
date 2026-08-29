const assert = require('assert');
const fs = require('fs');

const normal = fs.readFileSync('miniprogram/utils/plate2-lifecycle.js', 'utf8');
const nearby = fs.readFileSync('miniprogram/pages/plate-zhoubian/plate-zhoubian.js', 'utf8');
const normalFlow = normal.slice(normal.indexOf('// 判断是否为分享来的'), normal.indexOf('// 判断是否有了glid'));
const nearbyFlow = nearby.slice(nearby.indexOf('//判断是否为分享来的'), nearby.indexOf('//判断是否有了glid'));

[normalFlow, nearbyFlow].forEach(flow => {
  assert(flow.includes('if (app.userInfo._openid)'));
  const loginCall = flow.includes('userService.getOpenId()') ? 'userService.getOpenId()' : "name: 'login'";
  assert.strictEqual(flow.split(loginCall).length - 1, 1);
  assert(flow.indexOf('if (app.userInfo._openid)') < flow.indexOf(loginCall));
  assert(flow.includes(".catch((err) =>"));
});
console.log('share login reuse checks passed');
