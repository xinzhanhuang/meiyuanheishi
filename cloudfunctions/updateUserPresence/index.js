const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext()
  const data = {}

  if (typeof event.online === 'boolean') data.online = event.online
  if (event.updateLoginTime === true) data.logintime = Date.now()
  if (event.historyEntry && event.historyEntry.id) {
    data.lookhistory = cloud.database().command.push({
      each: [event.historyEntry],
      slice: -10
    })
  }

  if (!Object.keys(data).length) return { updated: 0 }

  const result = await cloud.database().collection('users').where({
    _openid: OPENID
  }).update({ data })

  return { updated: result.stats.updated }
}
