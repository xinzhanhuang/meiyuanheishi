const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

function fail(code) {
  return { success: false, code, message: '', errCode: code, errMsg: '' }
}

exports.main = async (event = {}) => {
  const db = cloud.database()
  const openid = cloud.getWXContext().OPENID
  if (!openid) return fail('UNAUTHENTICATED')
  if (typeof event.id !== 'string' || !event.id) return fail('INVALID_ARGUMENT')
  const collectionName = event.type === 'tianmeizhoubian' ? 'tianmeizhoubian' : 'ss'

  const actorResult = await db.collection('users').where({ _openid: openid }).limit(1).get()
  const actor = actorResult.data[0]
  if (!actor) return fail('USER_NOT_FOUND')

  return db.runTransaction(async transaction => {
    const postResult = await transaction.collection(collectionName).doc(event.id).get()
    const post = postResult.data
    if (!post || !post.ss_xx) return fail('POST_NOT_FOUND')

    const reportState = Array.isArray(post.ss_xx.jubao) ? post.ss_xx.jubao : [[], 0]
    const reporters = Array.isArray(reportState[0]) ? reportState[0].slice() : []
    const total = Number(reportState[1] || 0)
    if (reporters.includes(actor._id)) return fail('ALREADY_REPORTED')
    if (total > 9) return fail('REPORT_LIMIT_REACHED')

    const nextTotal = total + 1
    const ownerResult = nextTotal >= 10 && post.ss_xx.lzid
      ? await transaction.collection('users').doc(post.ss_xx.lzid).get()
      : { data: null }
    reporters.push(actor._id)
    await transaction.collection(collectionName).doc(event.id).update({ data: { 'ss_xx.jubao': [reporters, nextTotal] } })

    if (nextTotal >= 10 && post.ss_xx.lzid) {
      const owner = ownerResult.data
      if (owner) {
        const articles = Array.isArray(owner.wenzhang) ? owner.wenzhang.slice() : []
        const article = articles.find(item => item && item.id === event.id)
        if (article) article.weigui = true
        const now = event.time || Date.now()
        const messages = Array.isArray(owner.message) ? owner.message.slice() : []
        messages.push({
          type: 'jubao', time: now, ssid: event.id, postId: event.id,
          postType: collectionName === 'ss' ? 'ss' : 'zhoubian', source: 'message', plnr: event.ywnr || '',
          name: '帖子被封：', id: event.id + now, liuyan: false
        })
        const violationCount = Number(owner.weiguinb || 0) + 1
        await transaction.collection('users').doc(owner._id).update({
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
