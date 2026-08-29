const fs = require('fs')

const index = fs.readFileSync('miniprogram/pages/index/index.js', 'utf8')
const profile = fs.readFileSync('miniprogram/pages/my/wd/wd.js', 'utf8')
const app = fs.readFileSync('miniprogram/app.js', 'utf8')
const userService = fs.readFileSync('miniprogram/services/user-service.js', 'utf8')

if (!index.includes("console.error('首页列表加载失败', err)")) throw new Error('首页列表缺少失败处理')
if (!index.includes("console.warn('首页用户会话恢复失败', err)")) throw new Error('首页用户会话缺少失败处理')
if (!profile.includes("console.error('登录或创建用户失败', err)")) throw new Error('新用户登录缺少失败处理')
if (!profile.includes('return app.ensureCurrentUser()')) throw new Error('个人中心未使用统一会话入口')
if (!app.includes('this.userSessionPromise')) throw new Error('用户会话缺少重复请求保护')
if (!userService.includes('function ensureUser()')) throw new Error('用户 service 缺少建立账号能力')

console.log('加载状态保护检查通过')
