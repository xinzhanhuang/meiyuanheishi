const assert = require('assert');
const fs = require('fs');
const util = require('../miniprogram/utils/util.js');

const writers = ['fbpl', 'fbzbpj', 'dianzan', 'ordernotice', 'update_post_status', 'jubao', 'jubaoplus'];
writers.forEach(name => {
  const source = fs.readFileSync(`cloudfunctions/${name}/index.js`, 'utf8');
  ['postId:', 'postType:', 'source:'].forEach(field => assert(source.includes(field), `${name} missing ${field}`));
});
['fbpl', 'fbzbpj', 'dianzan'].forEach(name => {
  assert(fs.readFileSync(`cloudfunctions/${name}/index.js`, 'utf8').includes('commentId:'));
});
['xiaoxi', 'dianzan'].forEach(name => {
  const source = fs.readFileSync(`miniprogram/pages/message/${name}/${name}.js`, 'utf8');
  assert(source.includes('getPostTargetUrl'));
  assert(source.includes('dataset.postId || ssid'));
});
assert.strictEqual(
  util.getPostTargetUrl({ postId: 'p', postType: 'ss', commentId: 'c', replyId: 'r', source: 'message', liuyan: true }),
  '/pages/plate2/plate2?id=p&postId=p&postType=ss&source=message&commentId=c&replyId=r&liuyan=true'
);
console.log('message target checks passed');
