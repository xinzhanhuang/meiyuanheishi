const assert = require('assert')
const fs = require('fs')

const login = fs.readFileSync('miniprogram/pages/my/wd/wd.js', 'utf8')
const post = fs.readFileSync('miniprogram/pages/post/post.js', 'utf8')
const nearbyPost = fs.readFileSync('miniprogram/pages/post-zhoubian/post-zhoubian.js', 'utf8')

assert(!login.includes('wx.getUserProfile'), '登录不得请求头像昵称隐私接口')
assert(login.includes("wx.cloud.callFunction({ name: 'login'"), '登录应只使用 OpenID')
assert(login.includes("userphoto: '/images/message/touxiang1.png'"), '新用户应有本地默认头像')
assert(login.includes("username: '校园用户'"), '新用户应有默认昵称')
assert(login.includes("phone: ''"), '手机号应可留空')
assert(login.includes('registrationCompleted: true'), '最小账号不应被强制资料流程拦截')

for (const source of [post, nearbyPost]) {
  assert(source.includes('app.userInfo.userinfo.login != true'), '发帖仍必须登录')
  assert(!/userinfo\.(username|userphoto)|app\.userInfo\.phone/.test(source.slice(source.indexOf('async tijiao(e)'), source.indexOf('tijiao2('))), '发帖入口不得强制资料字段')
}

console.log('无隐私资料登录与发帖检查通过')
