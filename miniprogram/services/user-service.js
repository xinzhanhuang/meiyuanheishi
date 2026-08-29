const { callCloudFunction } = require('../utils/cloud-call')

const db = wx.cloud.database()

function getByOpenId(openid) {
  if (!openid) return Promise.resolve(null)
  return db.collection('users').where({ _openid: openid }).limit(1).get()
    .then(result => result.data && result.data[0] || null)
}

function getById(userId) {
  if (!userId) return Promise.resolve(null)
  return db.collection('users').doc(userId).get().then(result => result.data || null)
}

function getSystemConfig() {
  return db.collection('system').doc('001').get().then(result => result.data || null)
}

function getAdminConfig() {
  return db.collection('system').doc('system01').get().then(result => result.data || null)
}

function runUserAction(action, data) {
  return callCloudFunction('login', Object.assign({ action }, data))
}

function getOpenId() {
  return callCloudFunction('login', {}).then(result => result.openid || '')
}

function ensureUser() {
  return runUserAction('ensureUser', {}).then(result => result.user || null)
}

module.exports = { getByOpenId, getById, getSystemConfig, getAdminConfig, runUserAction, getOpenId, ensureUser }
