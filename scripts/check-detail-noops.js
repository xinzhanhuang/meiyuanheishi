const assert = require('assert');
const fs = require('fs');

['miniprogram/pages/plate2/plate2.js', 'miniprogram/pages/plate-zhoubian/plate-zhoubian.js'].forEach(file => {
  const source = fs.readFileSync(file, 'utf8');
  assert(!source.includes('xx.forEach(function (item) {\n      });'));
  assert(!source.includes('ss_xx.ss_xx.huifunr.push.apply(xx);'));
  assert(source.includes('xx.sort(function (a, b) {'));
  assert(source.includes('this.setData({\n        ss_xx: ss_xx,'));
});
console.log('detail no-op cleanup checks passed');
