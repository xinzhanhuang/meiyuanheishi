const fs = require('fs')
const path = require('path')

const source = fs.readFileSync(
  path.join(__dirname, '../miniprogram/pages/plate4/plate4.js'),
  'utf8'
)

const checks = [
  ['保留 300ms 防抖', /setTimeout\(\(\) => \{[\s\S]*?getSuggestions\(val, currentReqId\);[\s\S]*?\}, 300\)/],
  ['每次输入先取消旧任务', /getValue\(event\) \{[\s\S]*?this\.cancelSuggestionRequest\(\);/],
  ['过期响应被丢弃', /reqId !== this\.suggestionRequestId/],
  ['清空时取消任务', /clearinput\(\) \{\s*this\.cancelSuggestionRequest\(\)/],
  ['提交搜索时取消任务', /search\(e\) \{\s*this\.cancelSuggestionRequest\(\)/],
  ['页面隐藏时取消任务', /onHide: function \(\) \{\s*this\.cancelSuggestionRequest\(\)/],
  ['页面卸载时取消任务', /onUnload: function \(\) \{\s*this\.cancelSuggestionRequest\(\)/]
]

for (const [name, pattern] of checks) {
  if (!pattern.test(source)) {
    throw new Error(`检查失败: ${name}`)
  }
}

console.log(`搜索建议请求控制检查通过（${checks.length} 项）`)
