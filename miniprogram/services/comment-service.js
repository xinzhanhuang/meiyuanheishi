const { callCloudFunction } = require('../utils/cloud-call')
const app = getApp()

function schoolId() {
  return app && typeof app.getCurrentSchoolId === 'function' ? app.getCurrentSchoolId() : 'tjarts'
}

function publishComment(pinglunnr, pd, Mazhu) {
  return callCloudFunction('fbpl', { pinglunnr: Object.assign({ schoolId: schoolId() }, pinglunnr), pd, Mazhu })
}

function publishNearbyComment(pinglunnr, pd) {
  return callCloudFunction('fbzbpj', { pinglunnr: Object.assign({ schoolId: schoolId() }, pinglunnr), pd })
}

function rateNearbyPost(postId, rating) {
  return callCloudFunction('fbzbpj', { action: 'ratePost', id: postId, rating })
}

function deleteComment(data) {
  return callCloudFunction('delete', { _data: data, type: 'ss' })
}

function toggleLike(data) {
  return callCloudFunction('dianzan', Object.assign({ type: 'sspinglun', schoolId: schoolId() }, data))
}

function checkText(text) {
  return callCloudFunction('checkStr', { text }).then(result => result.errCode === 0)
}

function checkImage(media) {
  return wx.cloud.callFunction({ name: 'checkImg', data: { media } })
    .then(response => response.result && response.result.errCode)
}

module.exports = { publishComment, publishNearbyComment, rateNearbyPost, deleteComment, toggleLike, checkText, checkImage }
