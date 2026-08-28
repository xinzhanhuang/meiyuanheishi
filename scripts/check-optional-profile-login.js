const assert = require('assert')
const fs = require('fs')

const login = fs.readFileSync('miniprogram/pages/my/wd/wd.js', 'utf8')
const loginFunction = fs.readFileSync('cloudfunctions/login/index.js', 'utf8')
const post = fs.readFileSync('miniprogram/pages/post/post.js', 'utf8')
const nearbyPost = fs.readFileSync('miniprogram/pages/post-zhoubian/post-zhoubian.js', 'utf8')
const index = fs.readFileSync('miniprogram/pages/index/index.js', 'utf8')
const tools = fs.readFileSync('miniprogram/pages/tools/tools.js', 'utf8')

assert(!login.includes('wx.getUserProfile'), '登录不得请求头像昵称隐私接口')
assert(login.includes("wx.cloud.callFunction({ name: 'login'"), '登录应只使用 OpenID')
assert(login.includes("action: 'ensureUser'"), '登录应由云函数创建最小账号')
assert(loginFunction.includes("userphoto: '/images/message/touxiang1.png'"), '新用户应有默认头像')
assert(loginFunction.includes("username: '校园用户'"), '新用户应有默认昵称')
assert(loginFunction.includes("phone: ''"), '手机号应可留空')
assert(loginFunction.includes('registrationCompleted: true'), '最小账号不应被强制资料流程拦截')

for (const source of [post, nearbyPost]) {
  assert(source.includes('app.userInfo.userinfo.login != true'), '发帖仍必须登录')
  assert(!/userinfo\.(username|userphoto)|app\.userInfo\.phone/.test(source.slice(source.indexOf('async tijiao(e)'), source.indexOf('tijiao2('))), '发帖入口不得强制资料字段')
}

const indexAdd = index.slice(index.indexOf('  add() {'), index.indexOf('  closeDialog:', index.indexOf('  add() {')))
const toolsAdd = tools.slice(tools.indexOf('  add() {'), tools.indexOf('  closeDialog:', tools.indexOf('  add() {')))
for (const source of [indexAdd, toolsAdd]) {
  assert(!source.includes('app.userInfo.phone'), '发布入口不得要求手机号')
  assert(!source.includes('userinfo.gender'), '发布入口不得要求性别')
}

console.log('无隐私资料登录与发帖检查通过')
