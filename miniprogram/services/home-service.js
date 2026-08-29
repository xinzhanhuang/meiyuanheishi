const db = wx.cloud.database()
const command = db.command

function getHotSearches(since, limit = 15) {
  return db.collection('searchLogs').aggregate()
    .match({ timestamp: command.gte(since) })
    .group({ _id: '$searchText', count: { $sum: 1 } })
    .sort({ count: -1 }).limit(limit).end()
    .then(result => result.list || [])
}

function getOnlineCount(since) {
  return db.collection('users').where({ logintime: command.gte(since) }).count()
    .then(result => result.total || 0)
}

function getSystemConfig() {
  return db.collection('system').doc('system01').get().then(result => result.data || null)
}

function getPinnedPosts(since) {
  return db.collection('ss').limit(5).where({
    'ss_xx.jubao.1': command.lte(9),
    time: command.gt(since),
    'ss_xx.orderdetail.openlocationtitle': command.eq('')
  }).field({ 'ss_xx.nr': true, 'ss_xx.look': true, 'ss_xx.dianzanid': true })
    .orderBy('ss_xx.look', 'desc').get().then(result => result.data || [])
}

function getBannerConfig(schoolType) {
  return db.collection('lunbotu3').where({ schooltype: schoolType }).limit(1).get()
    .then(result => result.data && result.data[0] || null)
}

function getPosts(options) {
  var orderMode = options.orderMode
  return db.collection('ss').where({
    'ss_xx.jubao.1': command.lte(19),
    'ss_xx.sstype': command.neq(true),
    time: command.gt(orderMode === 0 ? 0 : options.since),
    'ss_xx.orderdetail.openlocationtitle': orderMode === 0 ? command.neq('111') : command.neq('')
  }).orderBy('time', 'desc').skip(options.skip || 0).get()
    .then(result => result.data || [])
}

module.exports = { getHotSearches, getOnlineCount, getSystemConfig, getPinnedPosts, getBannerConfig, getPosts }
