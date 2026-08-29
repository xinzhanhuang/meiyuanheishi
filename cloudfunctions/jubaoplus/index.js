const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

function fail(code) {
  return { success: false, code, message: '', errCode: code, errMsg: '' }
}

async function getAdmin(db, openid) {
  const userResult = await db.collection('users').where({ _openid: openid }).limit(1).get()
  const user = userResult.data[0]
  if (!user) return null
  const systemResult = await db.collection('system').doc('system01').get()
  const ids = systemResult.data && systemResult.data.system && systemResult.data.system.glids
  return Array.isArray(ids) && ids.includes(user._id) ? user : null
}

exports.main = async (event = {}) => {
  const db = cloud.database()
  const admin = await getAdmin(db, cloud.getWXContext().OPENID)
  if (!admin) return fail('PERMISSION_DENIED')
  if (typeof event.id !== 'string' || !event.id || !['ss', 'tianmeizhoubian'].includes(event.type)) {
    return fail('INVALID_ARGUMENT')
  }

  return db.runTransaction(async transaction => {
    const postResult = await transaction.collection(event.type).doc(event.id).get()
    const post = postResult.data
    if (!post || !post.ss_xx) return fail('POST_NOT_FOUND')

    const reportState = Array.isArray(post.ss_xx.jubao) ? post.ss_xx.jubao : [[], 0]
    const reporters = Array.isArray(reportState[0]) ? reportState[0].slice() : []
    if (!reporters.includes(admin._id)) reporters.push(admin._id)
    const nextTotal = Number(reportState[1] || 0) + 10
    const ownerId = post.ss_xx.lzid
    const ownerResult = ownerId
      ? await transaction.collection('users').doc(ownerId).get()
      : { data: null }
    await transaction.collection(event.type).doc(event.id).update({ data: { 'ss_xx.jubao': [reporters, nextTotal] } })

    if (ownerId) {
      const owner = ownerResult.data
      if (owner) {
        const articles = Array.isArray(owner.wenzhang) ? owner.wenzhang.slice() : []
        const article = articles.find(item => item && item.id === event.id)
        if (article) article.weigui = true
        const now = event.time || Date.now()
        const messages = Array.isArray(owner.message) ? owner.message.slice() : []
        messages.push({
          type: 'jubaoplus', time: now, ssid: event.id, postId: event.id,
          postType: event.type === 'ss' ? 'ss' : 'zhoubian', source: 'message',
          plnr: event.ywnr || '', name: '帖子被封：', id: event.id + now, liuyan: false
        })
        const violationCount = Number(owner.weiguinb || 0) + 1
        await transaction.collection('users').doc(ownerId).update({
          data: {
            message: messages, wenzhang: articles, weiguinb: violationCount,
            ban: owner.weiguinb > 5 ? true : owner.ban === true
          }
        })
      }
    }

    return { success: true, code: 'OK', message: '', data: { total: nextTotal }, total: nextTotal }
  })
}
