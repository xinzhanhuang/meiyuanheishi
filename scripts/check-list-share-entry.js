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

console.log('列表分享入口判断检查通过')
