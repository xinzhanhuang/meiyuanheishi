const assert = require('assert')
const fs = require('fs')

const pages = [
  'miniprogram/pages/plate1/plate1.js',
  'miniprogram/pages/plate4/plate4.js',
  'miniprogram/pages/zuiretiezi/zuiretiezi.js'
]
const source = pages.map(file => fs.readFileSync(file, 'utf8')).join('\n')
const service = fs.readFileSync('miniprogram/services/post-list-service.js', 'utf8')

assert(!source.includes('db.collection'), '列表页仍直接访问数据库集合')
assert(!source.includes('wx.cloud.callFunction'), '列表页仍直接调用云函数')
assert(!source.includes('db.command'), '列表页仍直接持有数据库 command')
assert(source.includes("require('../../services/post-list-service')"), '列表页未接入帖子列表 service')
assert(source.includes("require('../../services/post-service')"), '列表页未复用帖子操作 service')
assert(service.includes("db.collection('ss')"), '列表 service 未集中 ss 查询入口')
assert(service.includes('options.skip'), '列表 service 未保留分页参数')
assert(service.includes('options.orderBy'), '列表 service 未保留排序参数')
assert(service.includes('options.field'), '列表 service 未保留字段裁剪参数')
assert(service.includes('options.limitBeforeOrderBy'), '列表 service 未保留热帖原查询链顺序')
assert(service.includes('getSearchSuggestions'), '列表 service 未集中联想词云函数入口')
assert(service.includes('getTagPostCounts'), '列表 service 未集中标签统计云函数入口')

console.log('列表页 service 边界检查通过')
