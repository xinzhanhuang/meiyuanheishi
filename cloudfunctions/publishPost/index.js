const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

function fail(code, message, requestId) {
  return { success: false, code, message: message || '', errCode: code, errMsg: message || '', requestId }
}

function ok(data, requestId) {
  return Object.assign({ success: true, code: 'OK', message: '', data, requestId }, data)
}

function validObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value)
}

exports.main = async (event = {}) => {
  const requestId = typeof event.requestId === 'string' ? event.requestId.slice(0, 128) : ''
  const openid = cloud.getWXContext().OPENID
  if (!openid) return fail('UNAUTHENTICATED', 'Missing OPENID', requestId)
  if (!validObject(event.ss_xx)) return fail('INVALID_ARGUMENT', 'Invalid post payload', requestId)

  const db = cloud.database()
  const _ = db.command
  const userResult = await db.collection('users').where({ _openid: openid }).limit(1).get()
  const actor = userResult.data[0]
  if (!actor) return fail('USER_NOT_FOUND', 'User not found', requestId)
  if (actor.ban === true) return fail('ACCOUNT_BANNED', 'Account banned', requestId)

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
  const schoolId = String(event.schoolId || ss_xx.schoolId || '')
  const orderdetail = ss_xx.orderdetail || {}
  const postType = event.postType === 'zhoubian'
    ? 'zhoubian'
    : (orderdetail.openlocationtitle ? 'order' : (ss_xx.isActivity ? 'activity' : 'post'))
  const commonFields = {
    postType,
    schoolId,
    authorId: actor._id,
    status: 'active',
    createdAt: now,
    updatedAt: now,
    requestId
  }
  if (requestId) {
    const duplicate = await db.collection(event.postType === 'zhoubian' ? 'tianmeizhoubian' : 'ss')
      .where({ authorId: actor._id, requestId }).limit(1).get()
    if (duplicate.data[0]) {
      console.log(JSON.stringify({ action: 'publishPost', requestId, duplicate: true, postId: duplicate.data[0]._id }))
      return ok({ id: duplicate.data[0]._id, duplicate: true }, requestId)
    }
  }
  if (event.postType === 'zhoubian') {
    ss_xx.checked = false
    if (event.editId) {
      const existing = await db.collection('tianmeizhoubian').doc(event.editId).get()
      if (!existing.data || !existing.data.ss_xx || existing.data.ss_xx.lzid !== actor._id) {
        return fail('PERMISSION_DENIED', 'Post owner required', requestId)
      }
      await db.collection('tianmeizhoubian').doc(event.editId).update({ data: Object.assign({ ss_xx, time: ss_xx.firsttime }, commonFields, { createdAt: existing.data.createdAt || now }) })
      return ok({ id: event.editId, edited: true }, requestId)
    }
    return db.runTransaction(async (transaction) => {
      const addResult = await transaction.collection('tianmeizhoubian').add({ data: Object.assign({ ss_xx, time: ss_xx.firsttime }, commonFields) })
      const record = {
        time: ss_xx.firsttime,
        zilei: ss_xx.zilei,
        nr: ss_xx.nr || ss_xx.zbtitle || `分享了${(ss_xx.tp || []).length}张图片`,
        zbtitle: ss_xx.zbtitle,
        id: addResult._id,
        weigui: false,
        type: 'zhoubiantype'
      }
      await transaction.collection('users').doc(actor._id).update({
        data: { wenzhang: _.push({ each: [record], slice: -50 }) }
      })
      console.log(JSON.stringify({ action: 'publishPost', requestId, postId: addResult._id, postType }))
      return ok({ id: addResult._id, record }, requestId)
    })
  }
  const voteOption = Array.isArray(event.voteOption) ? event.voteOption.slice(0, 5) : []
  return db.runTransaction(async (transaction) => {
    const addResult = await transaction.collection('ss').add({
      data: Object.assign({
        voteNumberPerPerson: event.voteNumberPerPerson,
        votepeopleNumber: 0,
        voteOption,
        isEnd: false,
        ss_xx,
        time: now
      }, commonFields)
    })

    for (const option of voteOption) {
      await transaction.collection('VoteOption').add({
        data: { id: addResult._id, voteOption: option, voteNumber: 0 }
      })
    }

    const record = {
      time: now,
      nr: orderdetail.ordertitle || ss_xx.nr || `分享了${(ss_xx.tp || []).length}张图片`,
      id: addResult._id,
      weigui: false,
      tp: ss_xx.tp || [],
      type: orderdetail.ordertitle ? 'order' : 'post',
      ISorderdetail: Boolean(orderdetail.openlocationtitle)
    }
    await transaction.collection('users').doc(actor._id).update({
      data: { wenzhang: _.push({ each: [record], slice: -50 }) }
    })

    console.log(JSON.stringify({ action: 'publishPost', requestId, postId: addResult._id, postType }))
    return ok({ id: addResult._id, record }, requestId)
  })
}
