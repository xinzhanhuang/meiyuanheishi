const assert = require('assert')
const fs = require('fs')

const pages = ['plate1/plate1.js', 'plate4/plate4.js', 'zuiretiezi/zuiretiezi.js']
pages.forEach((page) => {
  const source = fs.readFileSync(`miniprogram/pages/${page}`, 'utf8')
  assert(source.includes('var postStartIndex = ss_xx.length'), `${page} 必须记录新增帖起始位置`)
  assert(source.includes('for (var i = postStartIndex; i < ss_xx.length; i++)'), `${page} 只能处理新增帖评论`)
})

const existing = [{ replies: [3, 1] }]
const incoming = [{ replies: [2, 4] }]
const merged = existing.concat(incoming)
for (let i = existing.length; i < merged.length; i++) merged[i].replies.sort((a, b) => b - a)
assert.deepStrictEqual(merged, [{ replies: [3, 1] }, { replies: [4, 2] }])

console.log('列表增量评论处理检查通过')
