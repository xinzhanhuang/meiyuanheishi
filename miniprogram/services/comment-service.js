const { callCloudFunction } = require('../utils/cloud-call')

function publishComment(pinglunnr, pd, Mazhu) {
  return callCloudFunction('fbpl', { pinglunnr, pd, Mazhu })
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

module.exports = { publishComment, deleteComment, toggleLike, checkText }
