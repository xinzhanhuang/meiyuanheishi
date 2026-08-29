const assert = require('assert')
const fs = require('fs')

const read = file => fs.readFileSync(file, 'utf8')
const control = read('miniprogram/pages/Bgd_control/Bgd_control.js')
const userPage = read('miniprogram/pages/checkuser/checkuser.js')
const service = read('miniprogram/services/admin-service.js')

for (const page of [control, userPage]) {
  assert(!page.includes('db.collection'), '管理页不应直接访问 users 集合')
  assert(!page.includes('wx.cloud.callFunction'), '管理页不应直接调用云函数')
}
assert(control.includes('app.glids[ii] == myid'), '管理员判断必须检查当前遍历项')
assert(!control.includes('app.glids[0] == myid'), '管理员判断仍只检查第一项')
for (const method of ['getRecentUsers', 'searchUsers', 'countUsers', 'countTodayLoginUsers', 'setUserBan']) {
  assert(service.includes(`function ${method}`), `admin-service 缺少 ${method}`)
}
assert(userPage.includes('userService.getById(id)'))
assert(userPage.includes('adminService.setUserBan(user._id, switch1Checked)'))
assert(userPage.includes('switch1Checked: !switch1Checked'), '封禁失败必须回滚界面状态')

console.log('管理用户页 service 边界与多管理员检查通过')
