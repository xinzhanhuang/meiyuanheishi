const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext()
  const _ = cloud.database().command
  const data = {}
  if (event.avatar) data['userinfo.userphoto'] = event.avatar
  if (event.phone) data.phone = event.phone
  if (Array.isArray(event.msgnb)) data.msgnb = event.msgnb
  if (event.profile) {
    if (event.profile.username) data['userinfo.username'] = event.profile.username
    if (Array.isArray(event.profile.zhuanye)) data['userinfo.zhuanye'] = event.profile.zhuanye
    if (event.profile.gender) data['userinfo.gender'] = event.profile.gender
    if (event.profile.registrationCompleted === true) data.registrationCompleted = true
  }
  if (event.searchKeyword) data.search = _.push({ each: [event.searchKeyword], slice: -10 })
  if (event.removeCommentedPostId) data.pinglunguode = _.pull({ id: _.eq(event.removeCommentedPostId) })
  if (!Object.keys(data).length) return { updated: 0 }
  const result = await cloud.database().collection('users').where({ _openid: OPENID }).update({ data })
  return { updated: result.stats.updated }
}
