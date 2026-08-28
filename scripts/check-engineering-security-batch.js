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

const plate2 = read('miniprogram/pages/plate2/plate2.js')
const voteModule = read('miniprogram/utils/plate2-vote.js')
const commentModule = read('miniprogram/utils/plate2-comments.js')
assert(plate2.includes("require('../../utils/plate2-vote')"))
assert(plate2.includes('return submitVote(this)'))
assert(voteModule.includes('page._voteSubmitting'))
assert(plate2.includes("require('../../utils/plate2-comments')"))
assert(plate2.includes('...commentMethods'))
assert(commentModule.includes('this._commentSubmitting'))
for (const method of ['showCommentMenu', 'btnClick', 'handleMenuReply', 'handleMenuDelete', 'fbpl']) {
  assert(commentModule.includes(`${method}(`), `评论模块缺少 ${method}`)
}

const cloudCall = read('miniprogram/utils/cloud-call.js')
assert(cloudCall.includes('PERMISSION_DENIED'))
assert(cloudCall.includes('ALREADY_VOTED'))
assert(cloudCall.includes('throw error'))

console.log('工程化安全批次检查通过')
