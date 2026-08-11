const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

exports.main = async () => {
  const db = cloud.database()
  const _ = db.command
  const result = await db.collection('users').where({
    logintime: _.gte(Date.now() - 18e6)
  }).count()

  return { total: result.total }
}
