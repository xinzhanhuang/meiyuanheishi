const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()
const _ = db.command

function messageId() {
  return Date.now().toString() + Math.random().toString(36).slice(2, 11)
}

async function getActorId(openid) {
  const result = await db.collection('users').where({ _openid: openid }).limit(1).get()
  return result.data[0] && result.data[0]._id
}

async function togglePostLike(event, actorId, collectionName, postType) {
  const toggleResult = await db.runTransaction(async (transaction) => {
    const postResult = await transaction.collection(collectionName).doc(event.id).get()
    const post = postResult.data || {}
    const detail = post.ss_xx || {}
    const likedUserIds = Array.isArray(detail.dianzanid) ? detail.dianzanid : []
    const liked = !likedUserIds.includes(actorId)

    await transaction.collection(collectionName).doc(event.id).update({
      data: {
        'ss_xx.dianzanid': liked ? _.push(actorId) : _.pull(actorId),
        'ss_xx.dianzannb': _.inc(liked ? 1 : -1)
      }
    })
    return { liked }
  })

  if (toggleResult.liked && event.lzid && event.lzid !== cloud.getWXContext().OPENID) {
    const notification = {
      name: event.name,
      photo: event.photo,
      time: event.time,
      type: 'dianzan',
      ywnr: event.ywnr,
      zbtitle: event.zbtitle,
      zilei: event.zilei,
      id: messageId(),
      ssid: event.id,
      postId: event.id,
      postType,
      source: 'message',
      isorder: false
    }
    if (collectionName === 'tianmeizhoubian') notification.subtype = 'tianmeizhoubian'
    await db.collection('users').where({ _openid: event.lzid }).update({
      data: { dzmessage: _.push(notification) }
    })
  }

  return { success: true, liked: toggleResult.liked, type: event.type }
}

async function toggleCommentLike(event, actorId, collectionName) {
  const toggleResult = await db.runTransaction(async (transaction) => {
    const postResult = await transaction.collection(collectionName).doc(event.id).get()
    const comments = (((postResult.data || {}).ss_xx || {}).huifunr) || []
    const index = comments.findIndex((comment, commentIndex) => {
      return (comment.pinglunID || `${event.id}_${commentIndex}`) === event.plid
    })
    if (index < 0) return { found: false, liked: false }

    const likedUserIds = Array.isArray(comments[index].dianzhanID) ? comments[index].dianzhanID : []
    const liked = !likedUserIds.includes(actorId)
    await transaction.collection(collectionName).doc(event.id).update({
      data: {
        [`ss_xx.huifunr.${index}.dianzhanID`]: liked ? _.push(actorId) : _.pull(actorId),
        [`ss_xx.huifunr.${index}.pldianzannb`]: _.inc(liked ? 1 : -1)
      }
    })
    return { found: true, liked }
  })

  if (!toggleResult.found) {
    return { success: false, errCode: 'COMMENT_NOT_FOUND', errMsg: 'Comment not found' }
  }

  if (toggleResult.liked && event.pllzid && event.pllzid !== actorId) {
    await db.collection('users').doc(event.pllzid).update({
      data: {
        dzmessage: _.push({
          name: event.name,
          photo: event.photo,
          time: event.time,
          type: 'pldianzan',
          zilei: event.zilei,
          plnr: event.plnr,
          bhfpl: event.plnr,
          id: messageId(),
          ssid: event.id,
          postId: event.id,
          postType: collectionName === 'tianmeizhoubian' ? 'zhoubian' : 'ss',
          commentId: event.plid,
          source: 'message',
          isorder: false,
          subtype: collectionName === 'tianmeizhoubian' ? 'tianmeizhoubian' : ''
        })
      }
    })
  }

  return { success: true, liked: toggleResult.liked, type: event.type }
}

async function toggleBookmark(event, actorId) {
  return db.runTransaction(async (transaction) => {
    const postResult = await transaction.collection('ss').doc(event.id).get()
    const detail = (postResult.data && postResult.data.ss_xx) || {}
    if (detail.lzid === actorId) {
      return { success: false, errCode: 'SELF_POST', errMsg: 'Cannot bookmark own post' }
    }
    const userIds = Array.isArray(detail.Mazhu) ? detail.Mazhu : []
    const bookmarked = !userIds.includes(actorId)
    await transaction.collection('ss').doc(event.id).update({
      data: { 'ss_xx.Mazhu': bookmarked ? _.push(actorId) : _.pull(actorId) }
    })
    return { success: true, bookmarked }
  })
}

exports.main = async (event = {}) => {
  const openid = cloud.getWXContext().OPENID
  if (!openid) return { success: false, errCode: 'UNAUTHENTICATED', errMsg: 'Missing OPENID' }
  if (typeof event.id !== 'string' || !event.id) {
    return { success: false, errCode: 'INVALID_ID', errMsg: 'Missing post id' }
  }

  const actorId = await getActorId(openid)
  if (!actorId) return { success: false, errCode: 'USER_NOT_FOUND', errMsg: 'User not found' }

  if (event.type === 'mazhu') return toggleBookmark(event, actorId)
  if (event.type === 'ss') return togglePostLike(event, actorId, 'ss', 'ss')
  if (event.type === 'tianmeizhoubian') {
    return togglePostLike(event, actorId, 'tianmeizhoubian', 'zhoubian')
  }
  if (event.type === 'sspinglun') {
    const collectionName = event.collection || 'ss'
    if (!['ss', 'tianmeizhoubian'].includes(collectionName)) {
      return { success: false, errCode: 'INVALID_COLLECTION', errMsg: 'Unsupported collection' }
    }
    return toggleCommentLike(event, actorId, collectionName)
  }
  return { success: false, errCode: 'INVALID_TYPE', errMsg: 'Unsupported like type' }
}
