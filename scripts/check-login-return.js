const assert = require('assert');
const fs = require('fs');
const util = require('../miniprogram/utils/util.js');

assert.strictEqual(
  util.getPostTargetUrl({ postId: 'post 1', postType: 'ss', commentId: 'comment/1', source: 'share' }),
  '/pages/plate2/plate2?id=post%201&postId=post%201&postType=ss&source=share&commentId=comment%2F1&schoolId=tjarts'
);
assert.strictEqual(
  util.getPostTargetUrl({ postId: 'post', postType: 'zhoubian', source: 'share', liuyan: true }),
  '/pages/plate-zhoubian/plate-zhoubian?id=post&postId=post&postType=zhoubian&source=share&schoolId=tjarts&liuyan=true'
);
['miniprogram/pages/my/wd/wd.js', 'miniprogram/pages/my/set/set.js'].forEach(file => {
  const source = fs.readFileSync(file, 'utf8');
  assert(source.includes('consumePendingPostTarget'));
  assert(source.includes('getPostTargetUrl'), `${file} 旧登录返回未收口统一路由`);
});
assert(fs.readFileSync('miniprogram/utils/plate2-lifecycle.js', 'utf8').includes('target.replyId || target.commentId'));
assert(fs.readFileSync('miniprogram/pages/plate-zhoubian/plate-zhoubian.js', 'utf8').includes('target.replyId || target.commentId'));
console.log('login return checks passed');
