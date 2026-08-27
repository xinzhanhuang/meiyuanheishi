const assert = require('assert')
const fs = require('fs')

const targets = [
  'miniprogram/pages/plate1/plate1.js',
  'miniprogram/pages/zuiretiezi/zuiretiezi.js'
]

targets.forEach((file) => {
  const source = fs.readFileSync(file, 'utf8')
  assert(source.includes("const isSharedEntry = options.fenxiang === 'true' || options.fenxiang === 'ture';"), `${file} 必须兼容分享参数`)
  assert(!/options\.fenxiang\s*=\s*['\"]true['\"]/.test(source), `${file} 不得把分享判断写成赋值`)
})

const hotPosts = fs.readFileSync('miniprogram/pages/zuiretiezi/zuiretiezi.js', 'utf8')
assert(hotPosts.includes("if (this.data.fenxiang === 'true' || this.data.fenxiang === 'ture')"), '热帖详情跳转必须按分享状态分支')
assert(!hotPosts.includes('if (this.data.fenxiang = true)'), '热帖详情跳转不得强制写入分享状态')

console.log('列表分享入口判断检查通过')
