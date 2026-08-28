const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()

async function getActor(openid) {
  const result = await db.collection('users').where({ _openid: openid }).limit(1).get()
  return result.data[0]
}

async function isAdmin(actorId) {
  const result = await db.collection('system').doc('system01').get()
  const ids = result.data && result.data.system && result.data.system.glids
  return Array.isArray(ids) && ids.includes(actorId)
}

exports.main = async (event = {}) => {
  const data = event._data
  const openid = cloud.getWXContext().OPENID
  if (!openid) return { success: false, errCode: 'UNAUTHENTICATED' }
  if (!data || typeof data.id !== 'string' || !data.id) {
    return { success: false, errCode: 'INVALID_ARGUMENT' }
  }

  const actor = await getActor(openid)
  if (!actor) return { success: false, errCode: 'USER_NOT_FOUND' }

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
