const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()

exports.main = async (event = {}) => {
  const openid = cloud.getWXContext().OPENID
  const userResult = await db.collection('users').where({ _openid: openid }).limit(1).get()
  const actor = userResult.data[0]
  const systemResult = await db.collection('system').doc('system01').get()
  const systemData = systemResult.data || {}
  const adminIds = (systemData.system && systemData.system.glids) || []
  if (!actor || !adminIds.includes(actor._id)) {
    return { success: false, errCode: 'PERMISSION_DENIED' }
  }
  if (event.action === 'setUserBan') {
    if (typeof event.userId !== 'string' || typeof event.ban !== 'boolean') {
      return { success: false, errCode: 'INVALID_ARGUMENT' }
    }
    await db.collection('users').doc(event.userId).update({ data: { ban: event.ban } })
    return { success: true, ban: event.ban }
  }
  if (!event.id || typeof event.wbnr !== 'string') {
    return { success: false, errCode: 'INVALID_ARGUMENT' }
  }

  const recipients = Array.isArray(systemData.glids_openid) ? systemData.glids_openid : []
  const time = new Date().toLocaleString('zh-CN', { hour12: false })
  const path = `pages/plate2/plate2?id=${event.id}&fenxiang=true`
  const results = await Promise.allSettled(recipients.map((recipient) => {
    return cloud.openapi.uniformMessage.send({
      touser: recipient,
      mp_template_msg: {
        appid: 'wx7f35c8e296de76cf',
        url: 'http://weixin.qq.com/download',
        miniprogram: { appid: 'wx3280f3d41b172606', path },
        data: {
          first: { value: `用户：${event.username || '校园用户'}`, color: '#173177' },
          keyword1: { value: event.wbnr.slice(0, 20), color: '#173177' },
          keyword2: { value: time, color: '#173177' },
          keyword3: { value: '待审核', color: '#173177' },
          remark: { value: '违规发帖用户，管理员可封帖', color: '#B6B9BA' }
        },
        template_id: 'dG3toKiiIiGr3hLy3lrbC5XVqvouq_UDiXe5BAG4H0c'
      }
    })
  }))

  return {
    success: true,
    sent: results.filter((result) => result.status === 'fulfilled').length,
    failed: results.filter((result) => result.status === 'rejected').length
  }
}
