const assert = require('assert');
let scrolledTo;
let clearHighlight;
global.setTimeout = callback => { clearHighlight = callback; };

global.wx = {
  nextTick(callback) { callback(); },
  createSelectorQuery() {
    return {
      select() { return this; },
      boundingClientRect(callback) { callback({ top: 500 }); return this; },
      exec() {}
    };
  },
  pageScrollTo(options) { scrolledTo = options.scrollTop; }
};

const { jumpToComment } = require('../miniprogram/utils/util.js');
const page = {
  data: {
    ss_xx: { ss_xx: { huifunr: [{ pinglunID: 'main', huifu: [{ pinglunID: 'reply' }, {}, {}, { pinglunID: 'hidden' }] }] } }
  },
  setData(updates, callback) {
    Object.assign(this.data, updates);
    if (updates['ss_xx.ss_xx.huifunr[0].zhankai']) this.data.ss_xx.ss_xx.huifunr[0].zhankai = true;
    callback && callback();
  }
};

jumpToComment(page, 'hidden');
assert.equal(page.data.activeReplyId, 'sub-comment-0-3');
assert.equal(page.data.ss_xx.ss_xx.huifunr[0].zhankai, true);
assert.equal(scrolledTo, 420);
clearHighlight();
assert.equal(page.data.activeReplyId, '');
console.log('comment jump check passed');
