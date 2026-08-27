const assert = require('assert')
const fs = require('fs')

const source = fs.readFileSync('miniprogram/pages/plate-zhoubian/plate-zhoubian.js', 'utf8')
assert(source.includes("const isSharedEntry = options.zhoubianfenxiang === 'true' || options.zhoubianfenxiang === 'ture';"), '必须显式判断分享入口')
assert(source.includes('if (isSharedEntry && options.bannerList2)'), '分享横幅只能由分享入口读取')
assert(source.includes('if (isSharedEntry) {\n      this.jiazai(id)'), '分享入口必须只加载一次')
assert(source.includes('this.jiazai(id)\n    }\n\n    //判断是否有了glid'), '普通入口必须保留加载')
assert.strictEqual((source.match(/this\.jiazai\(id\)/g) || []).length, 2, '分享与普通入口应各保留一次加载')
assert(!source.includes('options.zhoubianfenxiang = "true"'), '不得把分享判断写成赋值')

console.log('周边详情页单次加载流程检查通过')
