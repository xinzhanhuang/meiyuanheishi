const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()
const _ = db.command

async function legacyVote(event) {
  if (!event.id || !event.itemid) {
    return { success: false, errCode: 'INVALID_ARGUMENT', errMsg: 'Missing vote target' }
  }
  const results = await Promise.all([
    db.collection('VoteOption').doc(event.id).update({ data: { voteNumber: _.inc(1) } }),
    db.collection('ss').doc(event.itemid).update({ data: { votepeopleNumber: _.inc(1) } })
  ])
  return { success: true, legacy: true, stats: results.map((result) => result.stats) }
}

async function getVoteState(event) {
  if (!event.itemid) {
    return { success: false, errCode: 'INVALID_ARGUMENT', errMsg: 'Missing post id' }
  }
  const openid = cloud.getWXContext().OPENID
  const optionResult = await db.collection('VoteOption').where({ id: event.itemid }).get()
  const recordResult = openid
    ? await db.collection('VoteRecord').where({ voteItemId: event.itemid, voterId: openid }).get()
    : { data: [] }
  return {
    success: true,
    options: optionResult.data || [],
    record: recordResult.data && recordResult.data[0] ? recordResult.data[0] : null
  }
}

exports.main = async (event = {}) => {
  if (event.action === 'getVoteState') return getVoteState(event)
  // 旧客户端会先直写 VoteRecord，再调用本函数；部署过渡期必须保留原计数协议。
  if (event.actionVersion !== 2) return legacyVote(event)

  const optionId = event.id
  const itemId = event.itemid
  const voteNumber = Number(event.voteNumber || 1)
  const colorIndex = Number(event.colorIndex)
  const openid = cloud.getWXContext().OPENID

  if (!openid) return { success: false, errCode: 'UNAUTHENTICATED', errMsg: 'Missing OPENID' }
  if (!optionId || !itemId || !Number.isInteger(voteNumber) || voteNumber < 1) {
    return { success: false, errCode: 'INVALID_ARGUMENT', errMsg: 'Invalid vote payload' }
  }

  return db.runTransaction(async (transaction) => {
    const postResult = await transaction.collection('ss').doc(itemId).get()
    const optionResult = await transaction.collection('VoteOption').doc(optionId).get()
    const recordResult = await transaction.collection('VoteRecord').where({
      voteItemId: itemId,
      voterId: openid
    }).get()
    const post = postResult.data
    const option = optionResult.data
    const usedVotes = recordResult.data.reduce((total, record) => total + Number(record.voteNumber || 0), 0)
    const voteLimit = Number(post.voteNumberPerPerson || 1)

    if (option.id !== itemId) {
      return { success: false, errCode: 'OPTION_MISMATCH', errMsg: 'Vote option does not belong to post' }
    }
    if (usedVotes + voteNumber > voteLimit) {
      return { success: false, errCode: 'ALREADY_VOTED', errMsg: 'Vote limit reached' }
    }

    await transaction.collection('VoteRecord').add({
      data: {
        _openid: openid,
        voteTime: db.serverDate(),
        voteItemId: itemId,
        voteOptionId: optionId,
        voterId: openid,
        voteNumber,
        colorIndex: Number.isInteger(colorIndex) ? colorIndex : 0
      }
    })
    await transaction.collection('VoteOption').doc(optionId).update({ data: { voteNumber: _.inc(voteNumber) } })
    await transaction.collection('ss').doc(itemId).update({ data: { votepeopleNumber: _.inc(voteNumber) } })

    return { success: true, remaining: voteLimit - usedVotes - voteNumber }
  })
}
