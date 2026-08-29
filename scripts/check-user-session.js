const assert = require('assert')

let appDefinition
let loginCalls = 0
global.getApp = () => ({})
global.App = definition => { appDefinition = definition }
global.wx = {
  getAccountInfoSync() { return { miniProgram: { appId: 'wx3280f3d41b172606' } } },
  cloud: {
    init() {},
    callFunction(options) {
      loginCalls++
      return Promise.resolve({
        result: {
          success: true,
          user: { _id: 'u1', _openid: 'o1', message: [{ id: 'm1' }], dzmessage: [], userinfo: { login: true } }
        }
      })
    },
    database() {
      return { collection() { return { doc() { return { watch() { return { close() {} } } } } } } }
    }
  },
  setTabBarBadge() {}, removeTabBarBadge() {}, setStorageSync() {}, getStorageSync() { return '' }
}

require('../miniprogram/app.js')
const app = Object.assign({}, appDefinition)
app.onLaunch()

Promise.all([
  app.ensureCurrentUser({ create: true, refresh: true }),
  app.ensureCurrentUser({ create: true, refresh: true })
]).then(([first, second]) => {
  assert.strictEqual(loginCalls, 1, '并发会话恢复应复用同一请求')
  assert.strictEqual(first, second)
  assert.strictEqual(app.userInfo._id, 'u1')
  assert.strictEqual(app.userInfo.userinfo.login, true)
  assert.strictEqual(app.message.length, 1)
  console.log('用户会话单入口检查通过')
}).catch(error => {
  console.error(error)
  process.exitCode = 1
})
