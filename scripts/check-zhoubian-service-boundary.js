const assert = require('assert')
const fs = require('fs')

const page = fs.readFileSync('miniprogram/pages/plate-zhoubian/plate-zhoubian.js', 'utf8')
const comments = fs.readFileSync('miniprogram/utils/plate-zhoubian-comments.js', 'utf8')
const reportFunction = fs.readFileSync('cloudfunctions/jubao/index.js', 'utf8')

assert(!page.includes('db.collection'), '周边详情仍直接访问数据库')
assert(!page.includes('wx.cloud.callFunction'), '周边详情仍直接调用云函数')
assert(!page.includes('cloudCall.callCloudFunction'), '周边详情仍绕过 service 调用云函数')

for (const service of ['postService', 'userService', 'commentService']) {
  assert(page.includes(service), `周边详情未接入 ${service}`)
}
assert(page.includes('...commentMethods'), '周边评论模块未注册')
for (const method of ['checkStr', 'fasongqian', 'fbzbpj']) {
  assert(comments.includes(`${method}(`), `周边评论模块缺少 ${method}`)
}
assert(page.includes('await this.fbzbpj('), '周边评论未等待云端结果')
assert(page.includes('await commentService.deleteComment('), '周边评论删除未等待云端结果')
assert(page.includes('await postService.reportPost('), '周边举报未等待云端结果')
assert(page.includes('await postService.toggleLike('), '周边帖子点赞未等待云端结果')
assert(page.includes('await commentService.toggleLike('), '周边评论点赞未等待云端结果')
assert(reportFunction.includes("event.type === 'tianmeizhoubian'"), '举报云函数未支持周边集合')

console.log('周边详情 service 边界检查通过')
