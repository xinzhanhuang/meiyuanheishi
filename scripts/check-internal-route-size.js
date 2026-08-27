const assert = require('assert');
const fs = require('fs');

['index', 'plate1', 'plate4', 'zuiretiezi'].forEach(name => {
  const source = fs.readFileSync(`miniprogram/pages/${name}/${name}.js`, 'utf8');
  source.split('\n').filter(line => line.includes('plate2/plate2?')).forEach(route => {
    assert(!route.includes('choosetitle1='), `${name} detail route carries category array`);
    assert(!route.includes('zuiress_xx1='), `${name} detail route carries hot-post array`);
  });
});
const detail = fs.readFileSync('miniprogram/pages/plate2/plate2.js', 'utf8');
assert(detail.includes('var zuiress_xx1 = app.zuiress_xx1 || false;'));
assert(detail.includes('var choosetitle1 = app.choosetitle1 || false;'));
assert(detail.includes('if (options.zuiress_xx1)'));
assert(detail.includes('if (options.choosetitle1)'));
console.log('internal route size checks passed');
