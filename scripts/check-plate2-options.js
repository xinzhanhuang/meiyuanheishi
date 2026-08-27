const assert = require('assert');
const source = require('fs').readFileSync('miniprogram/pages/plate2/plate2.js', 'utf8');

assert(!source.includes("options.fenxiang = 'true'"));
assert(!source.includes('options.fenxiang = "true"'));
console.log('plate2 option checks passed');
