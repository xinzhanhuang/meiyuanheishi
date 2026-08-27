const fs = require('fs')

const index = fs.readFileSync('miniprogram/pages/index/index.js', 'utf8')
const profile = fs.readFileSync('miniprogram/pages/my/wd/wd.js', 'utf8')

if (!index.includes("console.error('首页列表加载失败', err)")) throw new Error('首页列表缺少失败处理')
if (!index.includes("console.error('首页静默登录失败', err)")) throw new Error('首页静默登录缺少失败处理')
if (!profile.includes("console.error('创建或读取用户失败', err)")) throw new Error('新用户登录缺少失败处理')
if (!profile.includes('return db.collection("users").where')) throw new Error('自动登录查询未纳入异常链')

console.log('加载状态保护检查通过')
