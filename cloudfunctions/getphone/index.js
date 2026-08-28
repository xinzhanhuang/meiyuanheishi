
const cloud = require('wx-server-sdk')

// 初始化 cloud
cloud.init({
  // API 调用都保持和云函数当前所在环境一致
  env: cloud.DYNAMIC_CURRENT_ENV
})

/**
 * 这个示例将经自动鉴权过的小程序用户 openid 返回给小程序端
 * 
 * event 参数包含小程序端调用传入的 data
 * 
 */
exports.main = async (event, context) => {
  const result = await cloud.getOpenData({
    list:[event.id]
  })
  const phone = result && result.list && result.list[0] && result.list[0].data && result.list[0].data.phoneNumber
  const openid = cloud.getWXContext().OPENID
  if (!phone || !openid) return { success: false, errCode: 'PHONE_NOT_FOUND' }
  const db = cloud.database()
  await db.collection('users').where({ _openid: openid }).update({ data: { phone } })
  return { success: true, phone }
}
