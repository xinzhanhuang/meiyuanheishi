const assert = require('assert');
const util = require('../miniprogram/utils/util.js');

assert.deepStrictEqual(util.getPostTarget({ id: 'old', commentId: 'comment' }, 'ss'), {
  postId: 'old', postType: 'ss', commentId: 'comment', replyId: '', source: '', liuyan: false
});
assert.deepStrictEqual(util.getPostTarget({ postId: 'new', postType: 'tj', replyId: 'reply', source: 'message' }, 'ss'), {
  postId: 'new', postType: 'tj', commentId: '', replyId: 'reply', source: 'message', liuyan: false
});
assert.deepStrictEqual(util.getPostTarget({ id: 'old', liuyan: 'true' }, 'zhoubian'), {
  postId: 'old', postType: 'zhoubian', commentId: '', replyId: '', source: '', liuyan: true
});
console.log('post target compatibility checks passed');
