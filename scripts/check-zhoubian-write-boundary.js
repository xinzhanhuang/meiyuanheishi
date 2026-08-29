const assert = require('assert')
const fs = require('fs')

const page = fs.readFileSync('miniprogram/pages/plate-zhoubian/plate-zhoubian.js', 'utf8')
const deleteFunction = fs.readFileSync('cloudfunctions/delete/index.js', 'utf8')
const ratingFunction = fs.readFileSync('cloudfunctions/fbzbpj/index.js', 'utf8')
const orderFunction = fs.readFileSync('cloudfunctions/ordernotice/index.js', 'utf8')
const lookFunction = fs.readFileSync('cloudfunctions/look/index.js', 'utf8')
const postService = fs.readFileSync('miniprogram/services/post-service.js', 'utf8')
const commentService = fs.readFileSync('miniprogram/services/comment-service.js', 'utf8')

assert(!/\.collection\([^\n]+\)\.(?:add|update|remove)\s*\(/.test(page), '周边详情页仍有客户端数据库直写')
for (const action of ['editPost', 'deletePost', 'toggleActivity', 'toggleOrder']) {
  assert(page.includes(`managePost('${action}'`), `周边详情页缺少 ${action} service 动作`)
}
assert(commentService.includes("action: 'ratePost'"))
assert(postService.includes("action: 'incrementDownload'"))
assert(page.includes("postType: 'zhoubian'"))
assert(deleteFunction.includes("event.collection || 'ss'"))
assert(ratingFunction.includes("event.action === 'ratePost'"))
assert(orderFunction.includes("event.postType === 'zhoubian'"))
assert(lookFunction.includes("event.action === 'incrementDownload'"))

console.log('周边详情写入边界检查通过')
