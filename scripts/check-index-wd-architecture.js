const assert = require('assert')
const fs = require('fs')

const read = file => fs.readFileSync(file, 'utf8')
const index = read('miniprogram/pages/index/index.js')
const wd = read('miniprogram/pages/my/wd/wd.js')
const app = read('miniprogram/app.js')
const homeService = read('miniprogram/services/home-service.js')

for (const [name, source] of [['index', index], ['wd', wd]]) {
  assert(!/db\.collection|wx\.cloud\.callFunction/.test(source), `${name} 页仍绕过 service`)
  assert(!source.includes('setUserWatcherListener'), `${name} 仍覆盖全局监听回调`)
  assert(!/plate2\/plate2\?id=|plate-zhoubian\/plate-zhoubian\?id=/.test(source), `${name} 仍手写帖子跳转参数`)
}
assert(index.includes("require('../../services/home-service')"))
assert(index.includes("require('../../utils/index-home')"))
assert(wd.includes("require('../../../utils/wd-user')"))
assert(app.includes('ensureCurrentUser(options = {})'))
assert(app.includes('subscribeUserWatcher(listener)'))
assert(app.includes('this.userSessionPromise'))
for (const method of ['getHotSearches', 'getOnlineCount', 'getSystemConfig', 'getPinnedPosts', 'getBannerConfig', 'getPosts']) {
  assert(homeService.includes(`function ${method}`), `home service 缺少 ${method}`)
}
console.log('首页与个人中心架构边界检查通过')
