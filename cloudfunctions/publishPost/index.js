const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

exports.main = async (event = {}) => {
  const openid = cloud.getWXContext().OPENID
  if (!openid || !event.ss_xx) return { success: false, errCode: 'INVALID_ARGUMENT' }

  const db = cloud.database()
  const _ = db.command
  const userResult = await db.collection('users').where({ _openid: openid }).limit(1).get()
  const actor = userResult.data[0]
  if (!actor) return { success: false, errCode: 'USER_NOT_FOUND' }
  if (actor.ban === true) return { success: false, errCode: 'ACCOUNT_BANNED' }

  const now = Date.now()
  const profile = actor.userinfo || {}
  const ss_xx = Object.assign({}, event.ss_xx, {
    firsttime: now,
    lzid: actor._id,
    username: profile.username || '校园用户',
    userphoto: profile.userphoto || '/images/message/touxiang1.png',
    gender: profile.gender || '',
    zhuanye: profile.zhuanye || ''
  })
  const voteOption = Array.isArray(event.voteOption) ? event.voteOption.slice(0, 5) : []
  const addResult = await db.collection('ss').add({
    data: {
      voteNumberPerPerson: event.voteNumberPerPerson,
      votepeopleNumber: 0,
      voteOption,
      isEnd: false,
      ss_xx,
      time: now
    }
  })

  if (voteOption.length) {
    await Promise.all(voteOption.map((option) => db.collection('VoteOption').add({
      data: { id: addResult._id, voteOption: option, voteNumber: 0 }
    })))
  }

  const orderdetail = ss_xx.orderdetail || {}
  const record = {
    time: now,
    nr: orderdetail.ordertitle || ss_xx.nr || `分享了${(ss_xx.tp || []).length}张图片`,
    id: addResult._id,
    weigui: false,
    tp: ss_xx.tp || [],
    type: orderdetail.ordertitle ? 'order' : 'post',
    ISorderdetail: Boolean(orderdetail.openlocationtitle)
  }
  await db.collection('users').doc(actor._id).update({
    data: { wenzhang: _.push({ each: [record], slice: -50 }) }
  })

  return { success: true, id: addResult._id, record }
}
