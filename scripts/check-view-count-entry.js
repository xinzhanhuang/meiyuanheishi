const assert = require('assert');
const fs = require('fs');

const normal = fs.readFileSync('miniprogram/utils/plate2-lifecycle.js', 'utf8');
const nearby = fs.readFileSync('miniprogram/pages/plate-zhoubian/plate-zhoubian.js', 'utf8');
const postService = fs.readFileSync('miniprogram/services/post-service.js', 'utf8');
const normalLoad = normal.slice(normal.indexOf('onLoad: function (options)'), normal.indexOf('jiazai(id)', normal.indexOf('onLoad: function (options)')));
const nearbyLoad = nearby.slice(nearby.indexOf('onLoad: function (options)'), nearby.indexOf('//判断是否有了glid'));
assert.strictEqual((normalLoad.match(/postService\.incrementView/g) || []).length, 1);
assert(normalLoad.includes("target.liuyan ? 'tj' : 'ss'"));
assert.strictEqual((nearbyLoad.match(/postService\.incrementView/g) || []).length, 1);
assert(nearbyLoad.includes("target.liuyan ? 'tj' : 'tianmeizhoubian'"));
assert(postService.includes("callCloudFunction('look'"));
['index', 'plate1', 'plate4', 'zuiretiezi', 'checkuser', 'tools'].forEach(name => {
  const source = fs.readFileSync(`miniprogram/pages/${name}/${name}.js`, 'utf8');
  const routes = source.split('xiangqing');
  assert(routes.slice(1).every(section => !section.slice(0, section.indexOf('\n  },')).includes('name: "look"')), `${name} counts before detail`);
});
console.log('view count entry checks passed');
