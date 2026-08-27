const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext()
  const db = cloud.database()
  const _ = db.command
  const collection = event.collection === 'tianmeizhoubian' ? 'tianmeizhoubian' : 'ss'
  const userResult = await db.collection('users').where({ _openid: OPENID }).get()
  const user = userResult.data[0]
  if (!user) throw new Error('请先完成登录')
  const ss_xx = event.ss_xx || {}
  if (ss_xx.lzid !== user._id) throw new Error('无权发布该帖子')

  if (event.editId) {
    const old = await db.collection(collection).doc(event.editId).get()
    if (!old.data || !old.data.ss_xx || old.data.ss_xx.lzid !== user._id) throw new Error('无权编辑该帖子')
    await db.collection(collection).doc(event.editId).update({ data: { ss_xx, time: ss_xx.firsttime } })
    return { postId: event.editId, edited: true }
  }

  const postData = collection === 'ss'
    ? { voteNumberPerPerson: event.voteNumberPerPerson, votepeopleNumber: 0, voteOption: event.voteOption || [], isEnd: false, ss_xx, time: ss_xx.firsttime }
    : { ss_xx: Object.assign({}, ss_xx, { checked: false }), time: ss_xx.firsttime }
  const result = await db.collection(collection).add({ data: postData })
  const isOrder = Boolean(ss_xx.orderdetail && ss_xx.orderdetail.ordertitle)
  const summary = collection === 'ss'
    ? { time: ss_xx.firsttime, nr: isOrder ? ss_xx.orderdetail.ordertitle : ss_xx.nr, id: result._id, weigui: false, tp: ss_xx.tp, type: isOrder ? 'order' : 'post', ISorderdetail: Boolean(event.openlocationtitle) }
    : { time: ss_xx.firsttime, zilei: ss_xx.zilei, nr: ss_xx.nr, zbtitle: ss_xx.zbtitle, id: result._id, weigui: false, type: 'zhoubiantype' }
  if (collection === 'ss' && !summary.nr) summary.nr = '分享了' + (ss_xx.tp || []).length + '张图片'
  if (collection === 'tianmeizhoubian' && !summary.nr && !summary.zbtitle) summary.nr = '分享了' + (ss_xx.tp || []).length + '张图片'
  if (collection === 'ss') {
    await Promise.all((event.voteOption || []).map(voteOption => db.collection('VoteOption').add({ data: { id: result._id, voteOption, voteNumber: 0 } })))
  }
  await db.collection('users').doc(user._id).update({ data: { wenzhang: _.push({ each: [summary], slice: -50 }) } })
  return { postId: result._id, summary, edited: false }
}
