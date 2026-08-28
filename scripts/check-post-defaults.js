const assert = require('assert');
const util = require('../miniprogram/utils/util.js');

const post = util.normalizePost({
  ss_xx: {
    nr: '保留内容',
    huifunr: [{ name: null, huifu: [{ name: null }], pldianzannb: null }],
    jubao: [null, null]
  }
});

assert.strictEqual(post.ss_xx.nr, '保留内容');
['tp', 'huifunr', 'dianzanid', 'Mazhu', 'fujian'].forEach(key => assert(Array.isArray(post.ss_xx[key])));
assert.deepStrictEqual(post.ss_xx.jubao, [[], 0]);
assert.deepStrictEqual(post.ss_xx.orderdetail, { takeorder: false });
assert.strictEqual(post.ss_xx.isover, false);
assert.strictEqual(post.ss_xx.huifunr[0].name, '');
assert.deepStrictEqual(post.ss_xx.huifunr[0].huifu[0].tp, []);
assert.strictEqual(post.ss_xx.huifunr[0].pldianzannb, 0);
assert.strictEqual(util.normalizePost(null), null);
console.log('post default checks passed');
