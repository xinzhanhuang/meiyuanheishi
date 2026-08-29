const assert = require('assert')
const fs = require('fs')
const path = require('path')

const pagesRoot = 'miniprogram/pages'
const files = []
function visit(dir) {
  fs.readdirSync(dir, { withFileTypes: true }).forEach(entry => {
    const file = path.join(dir, entry.name)
    if (entry.isDirectory()) visit(file)
    else if (entry.name.endsWith('.js') && file !== 'miniprogram/pages/tools/tools.js') files.push(file)
  })
}
visit(pagesRoot)
for (const file of files) {
  const source = fs.readFileSync(file, 'utf8')
  assert(!/(?:plate2\/plate2|plate-zhoubian\/plate-zhoubian)\?/.test(source), `${file} 仍手写详情页参数`)
}
console.log('帖子详情跳转边界检查通过（tools 按计划后置）')
