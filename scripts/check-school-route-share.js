const assert = require('assert')
const fs = require('fs')
const util = require('../miniprogram/utils/util.js')

const target = util.getPostTarget({ id: 'legacy', commentId: 'c' }, 'ss')
assert.strictEqual(target.schoolId, 'tjarts', '旧链接应回退默认院校')
assert.strictEqual(
  util.getPostTargetUrl({ postId: '跨校帖子', postType: 'ss', source: 'message', schoolId: 'academy-2', replyId: 'r' }),
  '/pages/plate2/plate2?id=%E8%B7%A8%E6%A0%A1%E5%B8%96%E5%AD%90&postId=%E8%B7%A8%E6%A0%A1%E5%B8%96%E5%AD%90&postType=ss&source=message&replyId=r&schoolId=academy-2'
)
assert(util.getPostTargetUrl({ postId: 'legacy', postType: 'ss' }).includes('schoolId=tjarts'))

const lifecycle = fs.readFileSync('miniprogram/utils/plate2-lifecycle.js', 'utf8')
const nearby = fs.readFileSync('miniprogram/pages/plate-zhoubian/plate-zhoubian.js', 'utf8')
const share = fs.readFileSync('miniprogram/utils/plate2-share.js', 'utf8')
const app = fs.readFileSync('miniprogram/app.js', 'utf8')
for (const source of [lifecycle, nearby]) {
  assert(source.includes('setCurrentSchoolId'), '详情入口未恢复学校上下文')
  assert(source.includes('schoolId: target.schoolId'), '详情页未保留 schoolId')
}
assert(share.includes('schoolId='), '普通帖子分享缺少 schoolId')
assert(app.includes('schoolId: target.schoolId || this.getCurrentSchoolId()'), '登录待返回目标未保存 schoolId')

for (const name of ['xiaoxi', 'dianzan']) {
  const source = fs.readFileSync(`miniprogram/pages/message/${name}/${name}.js`, 'utf8')
  assert(source.includes('dataset.schoolId'), `${name} 消息未读取 schoolId`)
}
for (const name of ['fbpl', 'fbzbpj', 'dianzan', 'ordernotice', 'update_post_status', 'jubao', 'jubaoplus']) {
  assert(fs.readFileSync(`cloudfunctions/${name}/index.js`, 'utf8').includes('schoolId:'), `${name} 消息未写入 schoolId`)
}
console.log('school route/share/login/message checks passed')
