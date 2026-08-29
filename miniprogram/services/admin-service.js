const db = wx.cloud.database()
const { callCloudFunction } = require('../utils/cloud-call')

function getPendingNearbyPosts() {
  return db.collection('tianmeizhoubian')
    .where({ 'ss_xx.checked': db.command.in([false, 2]) })
    .orderBy('time', 'desc')
    .get()
    .then(result => result.data || [])
}

function updatePostStatus(id, status, reason) {
  return callCloudFunction('update_post_status', { id, status, reason }).then(result => {
    if (!result.stats || result.stats.updated !== 1) {
      const error = new Error('审核状态未更新')
      error.result = result
      throw error
    }
    return result
  })
}

function deletePost(id) {
  return callCloudFunction('update_post_status', { id, action: 'delete' }).then(result => {
    if (result.success !== true) {
      const error = new Error('删除失败')
      error.result = result
      throw error
    }
    return result
  })
}

function getRecentUsers(skip = 0, limit = 20) {
  return db.collection('users').aggregate()
    .sort({ logintime: -1 })
    .skip(skip)
    .limit(limit)
    .project({ _id: 1, 'userinfo.userphoto': 1, 'userinfo.username': 1, online: 1, logintime: 1 })
    .end()
    .then(result => result.list || [])
}

function searchUsers(keyword) {
  const regexp = '.*' + keyword + '.*'
  return db.collection('users').where(db.command.or([
    { 'userinfo.username': db.RegExp({ regexp, options: 'i' }) },
    { phone: db.RegExp({ regexp, options: 'i' }) }
  ])).field({
    'userinfo.username': true,
    'userinfo.userphoto': true,
    logintime: true,
    online: true
  }).get().then(result => result.data || [])
}

function countUsers() {
  return db.collection('users').count().then(result => result.total || 0)
}

function countTodayLoginUsers(since) {
  return db.collection('users').where({ logintime: db.command.gte(since) })
    .count().then(result => result.total || 0)
}

function setUserBan(userId, ban) {
  return callCloudFunction('checknotice', { action: 'setUserBan', userId, ban })
}

module.exports = {
  getPendingNearbyPosts,
  updatePostStatus,
  deletePost,
  getRecentUsers,
  searchUsers,
  countUsers,
  countTodayLoginUsers,
  setUserBan
}
