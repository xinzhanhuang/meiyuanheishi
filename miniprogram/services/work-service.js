const db = wx.cloud.database()
const { callCloudFunction } = require('../utils/cloud-call')

function getQueue(limit = 20) {
  return db.collection('work_queue').orderBy('created_at', 'desc').limit(limit).get()
    .then(result => result.data || [])
}

function generate(data) {
  return callCloudFunction('getworkmessage', data).then(result => {
    if (result.success !== true) throw new Error(result.msg || result.error || '执行失败')
    return result
  })
}

function deleteQueue(id) {
  return generate({ action: 'deleteQueue', id })
}

function approvePost(id) {
  return generate({ action: 'approvePost', id })
}

function deletePost(id) {
  return generate({ action: 'deletePost', id })
}

module.exports = { getQueue, generate, deleteQueue, approvePost, deletePost }
