const assert = require('assert')
const fs = require('fs')

const file = '数据库索引权限与备份恢复清单.md'
const source = fs.readFileSync(file, 'utf8')

for (const section of ['索引清单', '权限目标矩阵', '备份清单', '恢复演练清单', '回滚条件']) {
  assert(source.includes(section), `${file} 缺少章节：${section}`)
}
for (const collection of ['users', 'ss', 'tianmeizhoubian', 'tj', 'VoteOption', 'VoteRecord', 'searchLogs', 'work_queue', 'system', 'lunbotu3']) {
  assert(source.includes(`\`${collection}\``), `${file} 缺少集合：${collection}`)
}
assert(source.includes('SHA-256'))
assert(source.includes('`-502003`'))
assert(source.includes('客户端写'))
assert(source.includes('| 禁止 | 禁止 |'))

console.log('数据库运维清单检查通过')
