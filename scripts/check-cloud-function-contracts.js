const assert = require('assert')
const fs = require('fs')
const path = require('path')

const cloudRoot = path.join(__dirname, '..', 'cloudfunctions')
const contractPath = path.join(__dirname, '..', '云函数接口契约.md')
const sourceFunctions = fs.readdirSync(cloudRoot)
  .filter((name) => fs.existsSync(path.join(cloudRoot, name, 'index.js')))
  .sort()
const contract = fs.readFileSync(contractPath, 'utf8')
const documentedFunctions = [...contract.matchAll(/^\| `([^`]+)` \|/gm)]
  .map((match) => match[1])
  .sort()

assert.strictEqual(sourceFunctions.length, 22, '有效云函数数量发生变化，请同步契约')
assert.strictEqual(new Set(documentedFunctions).size, documentedFunctions.length, '契约中存在重复云函数')
assert.deepStrictEqual(documentedFunctions, sourceFunctions, '云函数源码目录与契约不一致')

const timerFunctions = sourceFunctions.filter((name) => {
  const configPath = path.join(cloudRoot, name, 'config.json')
  if (!fs.existsSync(configPath)) return false
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'))
  return Array.isArray(config.triggers) && config.triggers.some((trigger) => trigger.type === 'timer')
})
assert.deepStrictEqual(timerFunctions.sort(), ['AiNews', 'getnewlines', 'getworkmessage'])

console.log('云函数接口契约检查通过：22 个有效云函数，3 个定时任务')
