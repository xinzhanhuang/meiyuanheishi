const assert = require('assert');
const util = require('../miniprogram/utils/util.js');

assert.deepStrictEqual(util.getPostTarget({ id: 'old', commentId: 'comment' }, 'ss'), {
  postId: 'old', postType: 'ss', commentId: 'comment', replyId: '', source: ''
});
assert.deepStrictEqual(util.getPostTarget({ postId: 'new', postType: 'tj', replyId: 'reply', source: 'message' }, 'ss'), {
  postId: 'new', postType: 'tj', commentId: '', replyId: 'reply', source: 'message'
});
assert.strictEqual(util.getPostTarget({ id: 'old', liuyan: 'true' }, 'zhoubian').postType, 'tj');
console.log('post target compatibility checks passed');
