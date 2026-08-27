const assert = require('assert');
const fs = require('fs');
const util = require('../miniprogram/utils/util.js');

assert.strictEqual(
  util.getPostTargetUrl({ postId: 'post 1', postType: 'ss', commentId: 'comment/1', source: 'share' }),
  '/pages/plate2/plate2?id=post%201&postId=post%201&postType=ss&source=share&commentId=comment%2F1'
);
assert.strictEqual(
  util.getPostTargetUrl({ postId: 'post', postType: 'zhoubian', source: 'share', liuyan: true }),
  '/pages/plate-zhoubian/plate-zhoubian?id=post&postId=post&postType=zhoubian&source=share&liuyan=true'
);
['miniprogram/pages/my/wd/wd.js', 'miniprogram/pages/my/set/set.js'].forEach(file => {
  assert(fs.readFileSync(file, 'utf8').includes('consumePendingPostTarget'));
});
console.log('login return checks passed');
