const assert = require('assert')
const fs = require('fs')

const source = fs.readFileSync('miniprogram/utils/plate2-data.js', 'utf8')
const voteGuard = 'if (Array.isArray(ss_xx.voteOption) && ss_xx.voteOption.length > 0)'

assert(source.includes(voteGuard), '投票查询必须由非空投票选项保护')
assert(source.indexOf(voteGuard) < source.indexOf('VOTE_OPTION.where({'), '投票选项查询必须位于保护条件内')
assert(source.includes('if (options.length === 0) return;'), '空投票选项时不得继续查询投票记录')

console.log('详情页按需投票加载检查通过')
