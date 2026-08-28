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
const zhoubianPostPage = read('miniprogram/pages/post-zhoubian/post-zhoubian.js')
const voteFunction = read('cloudfunctions/VoteOption/index.js')
const plate2Data = read('miniprogram/utils/plate2-data.js')
const likeFunction = read('cloudfunctions/dianzan/index.js')
const deleteFunction = read('cloudfunctions/delete/index.js')
const managementModule = read('miniprogram/utils/plate2-management.js')
const plate2 = read('miniprogram/pages/plate2/plate2.js')
const plate3 = read('miniprogram/pages/plate3/plate3.js')
assert(publishPost.includes('cloud.getWXContext().OPENID'))
assert(publishPost.includes('db.runTransaction(async (transaction)'))
assert(publishPost.includes("collection('ss').add"))
assert(publishPost.includes("collection('VoteOption').add"))
assert(publishPost.includes("collection('users').doc(actor._id).update"))
assert(postPage.includes("name: 'publishPost'"))
assert(!postPage.includes("db.collection('ss').add"))
assert(publishPost.includes("event.postType === 'zhoubian'"))
assert(publishPost.includes("collection('tianmeizhoubian').add"))
assert(zhoubianPostPage.includes("callCloudFunction('publishPost'"))
assert(!zhoubianPostPage.includes("db.collection('tianmeizhoubian').add"))
assert(postPage.includes('var reviewResults = await Promise.all(['))
assert(voteFunction.includes("event.action === 'getVoteState'"))
assert(plate2Data.includes("action: 'getVoteState'"))
assert(!plate2Data.includes("db.collection('VoteOption')"))
assert(likeFunction.includes("event.type === 'mazhu'"))
for (const action of ['editPost', 'toggleActivity', 'toggleOrder', 'deletePost']) {
  assert(deleteFunction.includes(action), `delete 云函数缺少帖子管理动作：${action}`)
}
assert(deleteFunction.includes("new Set(['ss', 'tianmeizhoubian'])"))
assert(plate3.includes("name: 'delete'"))
assert(plate3.includes("action: 'deletePost'"))
assert(!/db\.collection\([^)]*\)\.doc\([^)]*\)\.(remove|update)\(/.test(plate3), 'plate3 不应直接写入帖子或用户集合')
assert(plate2.includes("action: 'editPost'"))
assert(managementModule.includes("action: 'toggleActivity'"))
assert(managementModule.includes("action: 'toggleOrder'"))
assert(managementModule.includes('isover: targetIsOver'))
assert(managementModule.includes('takeorder: targetTakeOrder'))
assert(managementModule.includes("action: 'deletePost'"))
assert(!managementModule.includes("db.collection('ss')"))
for (const message of ['文字审核失败', '图片审核失败', '图片上传失败', '网络失败，请重试']) {
  assert(postPage.includes(message), `发帖页缺少失败提示：${message}`)
}
for (const loading of ['准备发送...', '就快好了...', '即将完成...']) {
  assert(postPage.includes(loading), `发帖页应保留加载提示：${loading}`)
}

assert(plate2.includes("callCloudFunction('dianzan', { type: 'mazhu'"))
assert(plate2.includes("callCloudFunction('ordernotice'"))
assert(!plate2.includes("db.collection('ss').doc(this.data.id).update"))
const workManager = read('miniprogram/pages/work_manager/work_manager.js')
const auditList = read('miniprogram/pages/audit-list/audit-list.js')
const checkUser = read('miniprogram/pages/checkuser/checkuser.js')
assert(!/db\.collection\([^)]*\).*\.(update|remove)\(/s.test(workManager))
assert(!auditList.includes("collection('tianmeizhoubian').doc(id).remove"))
assert(!checkUser.includes("collection('users').doc(userdata[0]._id).update"))
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
