const assert = require('assert');
const util = require('../miniprogram/utils/util.js');

assert.deepStrictEqual(util.getPostTarget({ id: 'old', commentId: 'comment' }, 'ss'), {
  postId: 'old', postType: 'ss', commentId: 'comment', replyId: '', source: '', schoolId: 'tjarts', liuyan: false
});
assert.deepStrictEqual(util.getPostTarget({ postId: 'new', postType: 'tj', replyId: 'reply', source: 'message' }, 'ss'), {
  postId: 'new', postType: 'ss', commentId: '', replyId: 'reply', source: 'message', schoolId: 'tjarts', liuyan: true
});
assert.deepStrictEqual(util.getPostTarget({ id: 'old', liuyan: 'true' }, 'zhoubian'), {
  postId: 'old', postType: 'zhoubian', commentId: '', replyId: '', source: '', schoolId: 'tjarts', liuyan: true
});
assert.strictEqual(
  util.getPostTargetUrl({ postId: 'p', postType: 'zhoubian', source: 'message', schoolId: 'school 1' }),
  '/pages/plate-zhoubian/plate-zhoubian?id=p&postId=p&postType=zhoubian&source=message&schoolId=school%201'
);
console.log('post target compatibility checks passed');
