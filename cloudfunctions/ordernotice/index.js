const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()
const _ = db.command

exports.main = async (event = {}) => {
  const openid = cloud.getWXContext().OPENID
  if (!openid || !event.orderid) return { success: false, errCode: 'INVALID_ARGUMENT' }

  const actorResult = await db.collection('users').where({ _openid: openid }).limit(1).get()
  const actor = actorResult.data[0]
  if (!actor) return { success: false, errCode: 'USER_NOT_FOUND' }

  const collectionName = event.liuyan ? 'tj' : 'ss'
  const postResult = await db.collection(collectionName).doc(event.orderid).get()
  const post = postResult.data || {}
  const detail = post.ss_xx || {}
  const ownerId = detail.lzid
  if (!ownerId || ownerId === actor._id) return { success: false, errCode: 'INVALID_RECIPIENT' }

  const ownerResult = await db.collection('users').doc(ownerId).get()
  const owner = ownerResult.data || {}
  const profile = actor.userinfo || {}
  const takeordername = profile.username || event.takeordername || '校园用户'
  const takeorderphoto = profile.userphoto || event.takeorderphoto || '/images/message/touxiang1.png'
  const takeorderphone = event.takeorderphone || profile.userphone || ''
  const ordertitle = (detail.orderdetail && detail.orderdetail.ordertitle) || event.ordertitle || '派单'
  const message = {
    type: 'takeorder',
    photo: takeorderphoto,
    name: takeordername,
    time: Date.now(),
    isorder: true,
    plnr: `🎉请及时联系：${takeorderphone}`,
    ywnr: ordertitle,
    ssid: event.orderid,
    postId: event.orderid,
    postType: 'ss',
    source: 'message',
    id: `${Date.now()}${Math.random().toString(36).slice(2, 11)}`,
    liuyan: Boolean(event.liuyan)
  }

  const accepted = await db.runTransaction(async (transaction) => {
    const latestResult = await transaction.collection(collectionName).doc(event.orderid).get()
    const latestDetail = (latestResult.data && latestResult.data.ss_xx) || {}
    if (latestDetail.orderdetail && latestDetail.orderdetail.takeorder) return false
    await transaction.collection(collectionName).doc(event.orderid).update({ data: {
      'ss_xx.orderdetail.takeorder': true,
      'ss_xx.orderdetail.takeorderid': actor._id,
      'ss_xx.orderdetail.takeorderphone': takeorderphone,
      'ss_xx.orderdetail.takeordername': takeordername
    } })
    await transaction.collection('users').doc(ownerId).update({ data: { message: _.push(message) } })
    return true
  })
  if (!accepted) return { success: false, errCode: 'ORDER_ALREADY_TAKEN' }

  let subscriptionSent = false
  if (!owner.online && Array.isArray(owner.msgnb) && owner.msgnb[0] > 0 && owner._openid) {
    const now = new Date()
    const dateText = `${now.getFullYear()}年${String(now.getMonth() + 1).padStart(2, '0')}月${String(now.getDate()).padStart(2, '0')}日`
    try {
      await cloud.openapi.subscribeMessage.send({
        touser: owner._openid,
        page: `pages/plate2/plate2?id=${event.orderid}&fenxiang=true&liuyan=${Boolean(event.liuyan)}`,
        lang: 'zh_CN',
        data: {
          thing1: { value: ordertitle.slice(0, 20) },
          thing6: { value: takeordername.slice(0, 20) },
          phone_number5: { value: takeorderphone },
          time2: { value: dateText }
        },
        templateId: 'ZVDufG3eOY6D9c9JOJe_81ADKqBGf0-TVuALiqUTd58',
        miniprogramState: 'formal'
      })
      await db.collection('users').doc(ownerId).update({ data: { 'msgnb.0': _.inc(-1) } })
      subscriptionSent = true
    } catch (error) {
      console.error('派单订阅消息发送失败', error)
    }
  }

  return { success: true, ownerId, subscriptionSent }
}
