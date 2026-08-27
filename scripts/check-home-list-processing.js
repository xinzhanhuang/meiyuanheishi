const assert = require('assert')
const fs = require('fs')

const source = fs.readFileSync('miniprogram/pages/index/index.js', 'utf8')
assert(source.includes('postStartIndex = ss_xx.length'), '加载更多必须从新增帖子开始处理')
assert(source.includes('for (var i = postStartIndex; i < ss_xx_new.length; i++)'), '评论排序范围必须是新增帖子')

const oldPosts = [{ replies: [3, 1] }]
const newPosts = [{ replies: [2, 4] }]
const allPosts = oldPosts.concat(newPosts)
for (let i = oldPosts.length; i < allPosts.length; i++) allPosts[i].replies.sort((a, b) => b - a)
assert.deepStrictEqual(allPosts, [{ replies: [3, 1] }, { replies: [4, 2] }])

console.log('首页增量列表处理检查通过')
