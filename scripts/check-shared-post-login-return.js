const assert = require('assert')
const fs = require('fs')

const normalLifecycle = fs.readFileSync('miniprogram/utils/plate2-lifecycle.js', 'utf8')
const normalPage = fs.readFileSync('miniprogram/pages/plate2/plate2.js', 'utf8')
const normalInteractions = fs.readFileSync('miniprogram/utils/plate2-interactions.js', 'utf8')
const nearby = fs.readFileSync('miniprogram/pages/plate-zhoubian/plate-zhoubian.js', 'utf8')

for (const source of [normalLifecycle, nearby]) {
  const shareFlow = source.slice(source.indexOf('userService.getOpenId()'), source.indexOf('if (app.glid'))
  assert(shareFlow.includes('app.applyCurrentUser(user)'), '已注册用户未同步统一会话')
  assert(shareFlow.includes('app.startUserWatcher()'), '分享自动登录后未启动消息监听')
  const failureFlow = shareFlow.slice(shareFlow.indexOf('.catch((err) =>'))
  assert(failureFlow.includes('app.setPendingPostTarget'), '分享登录查询失败时未保留返回目标')
}

assert(normalPage.includes("app.setPendingPostTarget({ postId: ss_xxid, postType: 'ss'"))
assert(normalInteractions.includes("app.setPendingPostTarget(loginTarget)"))
assert((nearby.match(/app\.setPendingPostTarget\(loginTarget\)/g) || []).length >= 3, '周边页登录入口未全部保留返回目标')

for (const fallback of [
  "var fenxiang = options.fenxiang || 'false'",
  "var takeorderid1 = options.takeorderid || ''",
  "var lzopenid = options.openid || ''",
  "var lzid = options.lzid || ''",
  'options.DONOT === undefined ? this.data.DONOT : options.DONOT',
  "heishiweixin = app.heishiweixin || ''",
  "openlocationtitle: options.openlocationtitle || ''",
  'var orderlzid = lzid === app.userInfo._id'
]) assert(normalLifecycle.includes(fallback), `缺少路由可选字段默认值: ${fallback}`)
console.log('分享帖登录、返回与默认值链路检查通过')
