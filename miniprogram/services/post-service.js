const { callCloudFunction } = require('../utils/cloud-call')

const db = wx.cloud.database()

function getPost(collection, postId) {
  if (!postId) return Promise.resolve(null)
  return db.collection(collection).doc(postId).get().then(result => result.data || null)
}

function incrementView(postId, postType) {
  return callCloudFunction('look', { id: postId, type: postType, num: 1 })
}

function incrementDownload(postId) {
  return callCloudFunction('look', { action: 'incrementDownload', id: postId })
}

function managePost(action, data) {
  return callCloudFunction('delete', Object.assign({ action }, data))
}

function reportPost(data) {
  return callCloudFunction('jubao', data)
}

function moderatePost(data) {
  return callCloudFunction('jubaoplus', data)
}

function bookmarkPost(postId) {
  return callCloudFunction('dianzan', { type: 'mazhu', id: postId })
}

function toggleLike(data) {
  return callCloudFunction('dianzan', Object.assign({ type: 'ss' }, data))
}

function takeOrder(data) {
  return callCloudFunction('ordernotice', data)
}

function publishPost(data) {
  return callCloudFunction('publishPost', data)
}

module.exports = { getPost, incrementView, incrementDownload, managePost, reportPost, moderatePost, bookmarkPost, toggleLike, takeOrder, publishPost }
