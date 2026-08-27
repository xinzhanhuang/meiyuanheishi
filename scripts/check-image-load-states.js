const assert = require('assert');
const util = require('../miniprogram/utils/util.js');

const previous = { tp: ['same', 'old'], tp2: [{ loaded: true }, { loaded: true }] };
assert.deepStrictEqual(util.createImageLoadStates(['same', 'new'], previous), [{ loaded: true }, { loaded: false }]);
assert.deepStrictEqual(util.createImageLoadStates(['same', 'new'], previous, false), [{ loaded: true }, { loaded: true }]);
assert.deepStrictEqual(util.createImageLoadStates(['new'], null), [{ loaded: false }]);
assert.deepStrictEqual(util.createImageLoadStates(null, previous), []);
console.log('image load state checks passed');
