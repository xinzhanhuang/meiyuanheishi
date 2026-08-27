const assert = require('assert')
const fs = require('fs')

const source = fs.readFileSync('miniprogram/pages/plate2/plate2.js', 'utf8')
const firstLoad = source.indexOf('if (options.fenxiang === \'true\' || options.fenxiang === \'ture\') {\n      this.jiazai(id);')
const normalLoad = source.indexOf('this.jiazai(options.id);')

assert(firstLoad >= 0, '分享入口必须保留提前加载')
assert(normalLoad > firstLoad, '普通入口必须在身份状态设置后加载')
assert.strictEqual((source.match(/this\.jiazai\(id\);/g) || []).length, 1, '详情页不得保留无条件的重复加载')

console.log('详情页单次加载检查通过')
