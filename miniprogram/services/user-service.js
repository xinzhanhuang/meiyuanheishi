const { callCloudFunction } = require('../utils/cloud-call')

const db = wx.cloud.database()

function getByOpenId(openid) {
  if (!openid) return Promise.resolve(null)
  return db.collection('users').where({ _openid: openid }).limit(1).get()
    .then(result => result.data && result.data[0] || null)
}

function getSystemConfig() {
  return db.collection('system').doc('001').get().then(result => result.data || null)
}

function runUserAction(action, data) {
  return callCloudFunction('login', Object.assign({ action }, data))
}

function getOpenId() {
  return callCloudFunction('login', {}).then(result => result.openid || '')
}

module.exports = { getByOpenId, getSystemConfig, runUserAction, getOpenId }
