const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext()
  const users = cloud.database().collection('users')
  const existing = await users.where({ _openid: OPENID }).get()
  if (existing.data.length) return { user: existing.data[0], created: false }

  const profile = event.profile || {}
  const user = {
    logintime: Date.now(), ban: false, msgnb: [0, 0], allow: true, online: true,
    wenzhang: [], message: [], dzmessage: [], pinglunguode: [], weiguinb: 0,
    phone: '',
    userinfo: {
      userphoto: profile.userphoto || '', username: profile.username || '微信用户',
      gender: profile.gender || 0, anonymous: '', zhuanye: '', isVIP: false,
      login: true, LCU: false
    }
  }
  const result = await users.add({ data: user })
  return { user: Object.assign({ _id: result._id, _openid: OPENID }, user), created: true }
}
