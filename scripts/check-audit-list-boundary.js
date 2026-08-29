const assert = require('assert')
const fs = require('fs')

const page = fs.readFileSync('miniprogram/pages/audit-list/audit-list.js', 'utf8')
const service = fs.readFileSync('miniprogram/services/admin-service.js', 'utf8')

assert(page.includes("require('../../services/admin-service')"))
assert(!page.includes('wx.cloud.callFunction'))
assert(!page.includes('db.collection'))
assert(page.includes('this._skipNextShow'))
assert(page.includes('adminService.updatePostStatus('))
assert(page.includes('adminService.deletePost('))
assert(service.includes("callCloudFunction('update_post_status'"))
assert(service.includes('result.stats.updated !== 1'))
assert(service.includes('result.success !== true'))
assert(!page.includes('Optimistic success'))

console.log('审核列表 service 边界检查通过')
