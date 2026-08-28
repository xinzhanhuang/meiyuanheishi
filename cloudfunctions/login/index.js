// 云函数模板
// 部署：在 cloud-functions/login 文件夹右击选择 “上传并部署”

const cloud = require('wx-server-sdk')

// 初始化 cloud
cloud.init({
  // API 调用都保持和云函数当前所在环境一致
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const _ = db.command

const USER_ACTIONS = new Set([
  'ensureUser',
  'updateProfile',
  'setOnline',
  'setLoginTime',
  'setMessageBadge',
  'appendLookHistory',
  'recordSearch',
  'removeCommentHistory',
  'removeMessage',
  'clearMessages'
])

async function getUser(openid) {
  const result = await db.collection('users').where({ _openid: openid }).limit(1).get()
  return result.data[0]
}

function validId(value) {
  return typeof value === 'string' && value.trim().length > 0 && value.length <= 128
}

async function handleUserAction(event, openid) {
  if (!USER_ACTIONS.has(event.action)) return null
  let user = await getUser(openid)
  if (event.action === 'ensureUser') {
    if (!user) {
      const now = Date.now()
      const data = {
        logintime: now, ban: false, msgnb: [0, 0], allow: true, online: true,
        wenzhang: [], message: [], dzmessage: [], pinglunguode: [], weiguinb: 0,
        phone: '', registrationCompleted: true,
        userinfo: {
          userphoto: '/images/message/touxiang1.png', username: '校园用户', gender: '',
          anonymous: '', zhuanye: '', isVIP: false, login: true, LCU: false
        }
      }
      const added = await db.collection('users').add({ data })
      user = Object.assign({ _id: added._id, _openid: openid }, data)
    } else if (!user.userinfo || user.userinfo.login !== true) {
      const userinfo = Object.assign({
        userphoto: '/images/message/touxiang1.png', username: '校园用户'
      }, user.userinfo, { login: true })
      await db.collection('users').doc(user._id).update({ data: { userinfo, online: true } })
      user = Object.assign({}, user, { userinfo, online: true })
    }
    return { success: true, action: event.action, user }
  }
  if (!user) return { success: false, errCode: 'USER_NOT_FOUND' }

  if (event.action === 'updateProfile') {
    const profile = event.profile || {}
    const data = {}
    if (typeof profile.username === 'string') data['userinfo.username'] = profile.username.slice(0, 30)
    if (typeof profile.zhuanye === 'string') data['userinfo.zhuanye'] = profile.zhuanye.slice(0, 60)
    if (typeof profile.gender === 'string') data['userinfo.gender'] = profile.gender.slice(0, 10)
    if (typeof profile.userphoto === 'string') data['userinfo.userphoto'] = profile.userphoto.slice(0, 500)
    if (event.registrationCompleted === true) data.registrationCompleted = true
    if (!Object.keys(data).length) return { success: false, errCode: 'INVALID_ARGUMENT' }
    await db.collection('users').doc(user._id).update({ data })
  } else if (event.action === 'setOnline') {
    if (typeof event.online !== 'boolean') return { success: false, errCode: 'INVALID_ARGUMENT' }
    await db.collection('users').doc(user._id).update({ data: { online: event.online } })
  } else if (event.action === 'setLoginTime') {
    await db.collection('users').doc(user._id).update({ data: { logintime: Date.now() } })
  } else if (event.action === 'setMessageBadge') {
    if (!Array.isArray(event.msgnb) || event.msgnb.length !== 2 || event.msgnb.some(value => !Number.isFinite(Number(value)) || Number(value) < 0)) {
      return { success: false, errCode: 'INVALID_ARGUMENT' }
    }
    await db.collection('users').doc(user._id).update({ data: { msgnb: event.msgnb.map(value => Number(value)) } })
  } else if (event.action === 'appendLookHistory') {
    const entry = event.entry || {}
    if (!validId(entry.id)) return { success: false, errCode: 'INVALID_ARGUMENT' }
    await db.collection('users').doc(user._id).update({
      data: {
        lookhistory: _.push({ each: [{
          id: entry.id,
          timestamp: String(entry.timestamp || ''),
          nr: String(entry.nr || '').slice(0, 500)
        }], slice: -10 })
      }
    })
  } else if (event.action === 'recordSearch') {
    const keyword = typeof event.keyword === 'string' ? event.keyword.trim().slice(0, 100) : ''
    if (!keyword) return { success: false, errCode: 'INVALID_ARGUMENT' }
    await db.runTransaction(async (transaction) => {
      await transaction.collection('searchLogs').add({
        data: {
          searchText: keyword,
          userInfo: {
            _id: user._id,
            username: user.userinfo && user.userinfo.username || '校园用户'
          },
          timestamp: Date.now()
        }
      })
      await transaction.collection('users').doc(user._id).update({
        data: { search: _.push({ each: [keyword], slice: -10 }) }
      })
    })
  } else if (event.action === 'removeCommentHistory') {
    if (!validId(event.postId)) return { success: false, errCode: 'INVALID_ARGUMENT' }
    await db.collection('users').doc(user._id).update({
      data: { pinglunguode: _.pull({ id: _.eq(event.postId) }) }
    })
  } else if (event.action === 'removeMessage' || event.action === 'clearMessages') {
    const field = event.messageType === 'dzmessage' ? 'dzmessage' : 'message'
    const data = event.action === 'clearMessages'
      ? { [field]: [] }
      : (validId(event.id) ? { [field]: _.pull({ id: _.eq(event.id) }) } : null)
    if (!data) return { success: false, errCode: 'INVALID_ARGUMENT' }
    await db.collection('users').doc(user._id).update({ data })
  }

  return { success: true, action: event.action }
}

/**
 * 这个示例将经自动鉴权过的小程序用户 openid 返回给小程序端
 * 
 * event 参数包含小程序端调用传入的 data
 * 
 */
exports.main = async (event, context) => {
  //console.log(event)
  //console.log(context)

  // 可执行其他自定义逻辑
  // console.log 的内容可以在云开发云函数调用日志查看

  // 获取 WX Context (微信调用上下文)，包括 OPENID、APPID、及 UNIONID（需满足 UNIONID 获取条件）等信息
  const wxContext = cloud.getWXContext()

  const actionResult = await handleUserAction(event || {}, wxContext.OPENID)
  if (actionResult) return actionResult

  return {
    event,
    openid: wxContext.OPENID,
    //appid: wxContext.APPID,
    //unionid: wxContext.UNIONID,
    //env: wxContext.ENV,
  }
}
