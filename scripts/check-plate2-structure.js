const assert = require('assert')
const fs = require('fs')

const pagePath = 'miniprogram/pages/plate2/plate2.js'
const wxmlPath = 'miniprogram/pages/plate2/plate2.wxml'
const modulePaths = [
  'miniprogram/utils/plate2-comments.js',
  'miniprogram/utils/plate2-data.js',
  'miniprogram/utils/plate2-images.js',
  'miniprogram/utils/plate2-interactions.js',
  'miniprogram/utils/plate2-lifecycle.js',
  'miniprogram/utils/plate2-management.js',
  'miniprogram/utils/plate2-share.js'
]

const read = file => fs.readFileSync(file, 'utf8')
const methodPattern = /^ {2}(?:async\s+)?([A-Za-z_$][\w$]*)\s*(?:\([^)]*\)|:\s*(?:async\s*)?function\s*\([^)]*\))\s*\{/gm

function methodNames(source) {
  const names = []
  let match
  while ((match = methodPattern.exec(source))) names.push(match[1])
  return names
}

const page = read(pagePath)
const wxml = read(wxmlPath)
const pageMethods = methodNames(page)
const duplicates = pageMethods.filter((name, index) => pageMethods.indexOf(name) !== index)
assert.deepStrictEqual(duplicates, [], `plate2 主页面存在重复方法：${duplicates.join(', ')}`)

const removedMethods = ['bindDialogButtonTap', 'getInput', 'send', 'showToast', 'onInputFocus', 'onInputBlur', 'islogin']
for (const name of removedMethods) {
  assert(!pageMethods.includes(name), `已清理方法仍在 plate2 页面：${name}`)
  assert(!new RegExp(`(?:bind|catch)[A-Za-z]*="${name}"`).test(wxml), `WXML 仍绑定已清理方法：${name}`)
}

for (const file of modulePaths) assert(fs.existsSync(file), `plate2 模块不存在：${file}`)
for (const binding of ['xiangqing', 'fasong', 'huifu', 'chooseImg', 'vote', 'onConfirm', 'onLoad']) {
  const modules = modulePaths.some(file => methodNames(read(file)).includes(binding))
  assert(pageMethods.includes(binding) || modules, `plate2 入口缺少实现：${binding}`)
}

assert(!page.includes('db.collection('), 'plate2 主页面不应直接访问数据库')
assert(!page.includes('wx.cloud.callFunction('), 'plate2 主页面不应直接调用云函数')
console.log('plate2 页面重复入口与历史死代码检查通过')
