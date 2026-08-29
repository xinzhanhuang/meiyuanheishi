const { callCloudFunction } = require('../utils/cloud-call')

function publishComment(pinglunnr, pd, Mazhu) {
  return callCloudFunction('fbpl', { pinglunnr, pd, Mazhu })
}

function publishNearbyComment(pinglunnr, pd) {
  return callCloudFunction('fbzbpj', { pinglunnr, pd })
}

function rateNearbyPost(postId, rating) {
  return callCloudFunction('fbzbpj', { action: 'ratePost', id: postId, rating })
}

function deleteComment(data) {
  return callCloudFunction('delete', { _data: data, type: 'ss' })
}

function toggleLike(data) {
  return callCloudFunction('dianzan', Object.assign({ type: 'sspinglun' }, data))
}

function checkText(text) {
  return callCloudFunction('checkStr', { text }).then(result => result.errCode === 0)
}

function checkImage(media) {
  return wx.cloud.callFunction({ name: 'checkImg', data: { media } })
    .then(response => response.result && response.result.errCode)
}

module.exports = { publishComment, publishNearbyComment, rateNearbyPost, deleteComment, toggleLike, checkText, checkImage }
