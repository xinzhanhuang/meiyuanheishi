const assert = require('assert')
const fs = require('fs')

const source = fs.readFileSync('miniprogram/utils/plate2-data.js', 'utf8')
const voteGuard = 'if (Array.isArray(ss_xx.voteOption) && ss_xx.voteOption.length > 0)'

assert(source.includes(voteGuard), '投票查询必须由非空投票选项保护')
assert(source.indexOf(voteGuard) < source.indexOf("action: 'getVoteState'"), '投票状态查询必须位于保护条件内')
assert(source.includes('if (result.record) {'), '已有投票记录才应设置已投状态')

console.log('详情页按需投票加载检查通过')
