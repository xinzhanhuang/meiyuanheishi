const assert = require('assert')
const fs = require('fs')

const source = fs.readFileSync('miniprogram/utils/plate2-lifecycle.js', 'utf8')
const firstLoad = source.search(/if \(options\.fenxiang === 'true' \|\| options\.fenxiang === 'ture'\) \{\s+this\.jiazai\(id\);/)
const normalLoad = source.search(/\} else \{\s+applyUserState\(\);\s+this\.jiazai\(id\);/)

assert(firstLoad >= 0, '分享入口必须保留提前加载')
assert(normalLoad > firstLoad, '普通入口必须在身份状态设置后加载')
assert.strictEqual((source.match(/this\.jiazai\(id\);/g) || []).length, 2, '分享与普通入口应各保留一次加载')

console.log('详情页单次加载检查通过')
