const assert = require('assert')
const fs = require('fs')

const source = fs.readFileSync('miniprogram/pages/index/index.js', 'utf8')
const start = source.indexOf('  onShow: function () {')
const end = source.indexOf('  /**\n   * 刷新消息红点', start)
const onShow = source.slice(start, end)

assert(start >= 0 && end > start, '必须找到首页 onShow 生命周期')
assert(!onShow.includes("db.collection('users').doc(app.userInfo._id).get()"), '首页显示时不得重复读取当前用户文档')
assert(onShow.includes('this.checkred()'), '首页显示时必须保留红点刷新')

console.log('首页用户重复读取检查通过')
