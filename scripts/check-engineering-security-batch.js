const assert = require('assert')
const fs = require('fs')

function read(file) {
  return fs.readFileSync(file, 'utf8')
}

const ordernotice = read('cloudfunctions/ordernotice/index.js')
assert(ordernotice.includes("where({ _openid: openid })"))
assert(ordernotice.includes("doc(event.orderid).get()"))
assert(!ordernotice.includes('event.lzopenid'))
assert(!ordernotice.includes("doc(event.lzid)"))

const checknotice = read('cloudfunctions/checknotice/index.js')
assert(checknotice.includes("doc('system01').get()"))
assert(checknotice.includes('adminIds.includes(actor._id)'))
assert(!checknotice.includes('event.glids'))

const publishPost = read('cloudfunctions/publishPost/index.js')
const postPage = read('miniprogram/pages/post/post.js')
assert(publishPost.includes('cloud.getWXContext().OPENID'))
assert(publishPost.includes('db.runTransaction(async (transaction)'))
assert(publishPost.includes("collection('ss').add"))
assert(publishPost.includes("collection('VoteOption').add"))
assert(publishPost.includes("collection('users').doc(actor._id).update"))
assert(postPage.includes("name: 'publishPost'"))
assert(!postPage.includes("db.collection('ss').add"))
for (const message of ['文字审核失败', '图片审核失败', '图片上传失败', '网络失败，请重试']) {
  assert(postPage.includes(message), `发帖页缺少失败提示：${message}`)
}
for (const loading of ['准备发送...', '就快好了...', '即将完成...']) {
  assert(postPage.includes(loading), `发帖页应保留加载提示：${loading}`)
}

const plate2 = read('miniprogram/pages/plate2/plate2.js')
const voteModule = read('miniprogram/utils/plate2-vote.js')
const commentModule = read('miniprogram/utils/plate2-comments.js')
const modules = {
  comments: 'commentMethods',
  share: 'shareMethods',
  images: 'imageMethods',
  data: 'dataMethods',
  management: 'managementMethods',
  lifecycle: 'lifecycleMethods'
}
assert(plate2.includes("require('../../utils/plate2-vote')"))
assert(plate2.includes('return submitVote(this)'))
assert(voteModule.includes('page._voteSubmitting'))
assert(plate2.includes("require('../../utils/plate2-comments')"))
assert(plate2.includes('...commentMethods'))
assert(commentModule.includes('this._commentSubmitting'))
for (const method of ['showCommentMenu', 'btnClick', 'handleMenuReply', 'handleMenuDelete', 'fbpl']) {
  assert(commentModule.includes(`${method}(`), `评论模块缺少 ${method}`)
}
for (const [name, variable] of Object.entries(modules)) {
  assert(plate2.includes(`require('../../utils/plate2-${name}')`), `plate2 未接入 ${name} 模块`)
  assert(plate2.includes(`...${variable}`), `plate2 未注册 ${name} 方法`)
}
assert(plate2.split('\n').length < 2000, 'plate2 主文件应保持在 2000 行以内')
assert(plate2.includes('app.userInfo.pinglunguode || []'))
assert(!plate2.includes('async fasongqian('))

const cloudCall = read('miniprogram/utils/cloud-call.js')
const imageModule = read('miniprogram/utils/plate2-images.js')
assert(cloudCall.includes('PERMISSION_DENIED'))
assert(cloudCall.includes('ALREADY_VOTED'))
assert(cloudCall.includes('throw error'))
assert(imageModule.includes("fail(err) {\n      console.error('选择评论图片失败'"))
assert(imageModule.includes('无法选择图片，请检查相册权限'))

console.log('工程化安全批次检查通过')
