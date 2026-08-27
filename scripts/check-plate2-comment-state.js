const assert = require('assert')
const fs = require('fs')

const source = fs.readFileSync('miniprogram/pages/plate2/plate2.js', 'utf8')
assert(source.includes('let oldCommentById = Object.create(null);'), '旧评论必须建立 ID 索引')
assert(source.includes('let oldItem = oldCommentById[item.pinglunID] || null;'), '新评论必须通过 ID 索引匹配旧状态')
assert(!source.includes('oldHuifunr ? oldHuifunr.find'), '不得保留逐条扫描旧评论的匹配逻辑')

const oldComments = [{ pinglunID: 'same', state: 'first' }, { pinglunID: 'same', state: 'second' }]
const byId = Object.create(null)
oldComments.forEach((old) => {
  if (byId[old.pinglunID] === undefined) byId[old.pinglunID] = old
})
assert.strictEqual(byId.same.state, 'first')

console.log('详情页评论状态索引检查通过')
