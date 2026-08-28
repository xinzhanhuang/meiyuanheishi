const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()
const _ = db.command
const POST_COLLECTIONS = new Set(['ss', 'tianmeizhoubian'])

async function getActor(openid) {
  const result = await db.collection('users').where({ _openid: openid }).limit(1).get()
  return result.data[0]
}

async function isAdmin(actorId) {
  const result = await db.collection('system').doc('system01').get()
  const ids = result.data && result.data.system && result.data.system.glids
  return Array.isArray(ids) && ids.includes(actorId)
}

async function managePost(event, actor) {
  if (typeof event.postId !== 'string' || !event.postId) {
    return { success: false, errCode: 'INVALID_ARGUMENT' }
  }
  const collectionName = event.collection || 'ss'
  if (!POST_COLLECTIONS.has(collectionName)) {
    return { success: false, errCode: 'INVALID_COLLECTION' }
  }
  const postResult = await db.collection(collectionName).doc(event.postId).get()
  const post = postResult.data || {}
  const detail = post.ss_xx || {}
  if (actor._id !== detail.lzid && !(await isAdmin(actor._id))) {
    return { success: false, errCode: 'PERMISSION_DENIED' }
  }

  if (event.action === 'editPost') {
    const updates = { 'ss_xx.nr': String(event.nr || '') }
    if (detail.orderdetail && detail.orderdetail.openlocationtitle) {
      updates['ss_xx.orderdetail.ordertitle'] = String(event.ordertitle || '')
      const contactField = collectionName === 'tianmeizhoubian' ? 'phone' : 'lianxi'
      updates[`ss_xx.orderdetail.${contactField}`] = String(event.phone || event.lianxi || '')
      updates['ss_xx.orderdetail.jg'] = event.jg
      updates['ss_xx.orderdetail.weixin'] = String(event.weixin || '')
    }
    if (collectionName === 'tianmeizhoubian') {
      const allowed = ['zbtitle', 'link', 'lianxi', 'weizhi', 'latitude', 'longitude']
      for (const field of allowed) {
        if (event[field] !== undefined) updates[`ss_xx.${field}`] = event[field]
      }
    }
    await db.collection(collectionName).doc(event.postId).update({ data: updates })
    return { success: true, action: event.action }
  }

  if (event.action === 'toggleActivity') {
    const isover = typeof event.isover === 'boolean' ? event.isover : !Boolean(detail.isover)
    await db.collection(collectionName).doc(event.postId).update({ data: { 'ss_xx.isover': isover } })
    return { success: true, action: event.action, isover }
  }

  if (event.action === 'toggleOrder') {
    const orderdetail = detail.orderdetail || {}
    const takeorder = typeof event.takeorder === 'boolean' ? event.takeorder : !Boolean(orderdetail.takeorder)
    const updates = { 'ss_xx.orderdetail.takeorder': takeorder }
    if (!takeorder) {
      updates['ss_xx.orderdetail.takeorderid'] = ''
      updates['ss_xx.orderdetail.takeorderphone'] = ''
    }
    await db.collection(collectionName).doc(event.postId).update({ data: updates })
    return { success: true, action: event.action, takeorder }
  }

  if (event.action === 'deletePost') {
    await db.runTransaction(async (transaction) => {
      await transaction.collection(collectionName).doc(event.postId).remove()
      await transaction.collection('users').doc(detail.lzid).update({
        data: { wenzhang: _.pull({ id: _.eq(event.postId) }) }
      })
    })
    const files = Array.isArray(detail.tp) ? detail.tp.filter(Boolean) : []
    if (files.length) {
      try { await cloud.deleteFile({ fileList: files }) } catch (error) { console.error('清理帖子图片失败', error) }
    }
    return { success: true, action: event.action, deleted: 'post', collection: collectionName }
  }

  return { success: false, errCode: 'INVALID_ACTION' }
}

exports.main = async (event = {}) => {
  const openid = cloud.getWXContext().OPENID
  if (!openid) return { success: false, errCode: 'UNAUTHENTICATED' }
  const actor = await getActor(openid)
  if (!actor) return { success: false, errCode: 'USER_NOT_FOUND' }

  if (['editPost', 'toggleActivity', 'toggleOrder', 'deletePost'].includes(event.action)) {
    return managePost(event, actor)
  }

  const data = event._data
  if (!data || typeof data.id !== 'string' || !data.id) {
    return { success: false, errCode: 'INVALID_ARGUMENT' }
  }

  const collectionName = data.liuyan
    ? 'tj'
    : (data.type111 === 'tianmeizhoubian' ? 'tianmeizhoubian' : 'ss')
  const admin = await isAdmin(actor._id)

  return db.runTransaction(async (transaction) => {
    const postResult = await transaction.collection(collectionName).doc(data.id).get()
    const post = postResult.data || {}
    const detail = post.ss_xx || {}
    const comments = Array.isArray(detail.huifunr) ? detail.huifunr.slice() : []
    const parentIndex = comments.findIndex((comment) => {
      return comment.plrid === data.id0 && comment.time == data.time
    })
    if (parentIndex < 0) {
      return { success: false, errCode: 'COMMENT_NOT_FOUND' }
    }

    const parent = comments[parentIndex]
    const deletingReply = data.id1 !== '' && data.id1 !== undefined && data.id1 !== null
    let targetAuthorId = parent.plrid
    let removedCount = 1

    if (deletingReply) {
      const replies = Array.isArray(parent.huifu) ? parent.huifu.slice() : []
      const replyIndex = replies.findIndex((reply) => {
        return reply.plrid === data.id1 && reply.time == data.time1
      })
      if (replyIndex < 0) return { success: false, errCode: 'REPLY_NOT_FOUND' }
      targetAuthorId = replies[replyIndex].plrid
      if (!admin && actor._id !== targetAuthorId && actor._id !== detail.lzid) {
        return { success: false, errCode: 'PERMISSION_DENIED' }
      }
      replies.splice(replyIndex, 1)
      parent.huifu = replies
      parent.huifunb = Math.max(0, Number(parent.huifunb || 0) - 1)
      comments[parentIndex] = parent
    } else {
      if (!admin && actor._id !== targetAuthorId && actor._id !== detail.lzid) {
        return { success: false, errCode: 'PERMISSION_DENIED' }
      }
      removedCount += Number(parent.huifunb || 0)
      comments.splice(parentIndex, 1)
    }

    const currentTotal = Number(detail.huifunb || 0)
    const nextTotal = data.liuyan && !deletingReply
      ? currentTotal
      : Math.max(0, currentTotal - removedCount)
    await transaction.collection(collectionName).doc(data.id).update({
      data: {
        'ss_xx.huifunr': comments,
        'ss_xx.huifunb': nextTotal
      }
    })

    return {
      success: true,
      deleted: deletingReply ? 'reply' : 'comment',
      collection: collectionName,
      removedCount
    }
  })
}
