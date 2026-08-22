const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext()
  const data = {}
  const command = cloud.database().command

  if (typeof event.online === 'boolean') data.online = event.online
  if (event.updateLoginTime === true) data.logintime = Date.now()
  if (event.historyEntry && event.historyEntry.id) {
    data.lookhistory = command.push({
      each: [event.historyEntry],
      slice: -10
    })
  }

  if (event.messageAction === 'clear' && (event.messageType === 'message' || event.messageType === 'dzmessage')) {
    data[event.messageType] = []
  }
  if (event.messageAction === 'remove' && event.messageId !== undefined && (event.messageType === 'message' || event.messageType === 'dzmessage')) {
    data[event.messageType] = command.pull({ id: command.eq(event.messageId) })
  }

  if (!Object.keys(data).length) return { updated: 0 }

  const result = await cloud.database().collection('users').where({
    _openid: OPENID
  }).update({ data })

  return { updated: result.stats.updated }
}
