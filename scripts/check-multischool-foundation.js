const assert = require('assert')
const fs = require('fs')
const schools = require('../miniprogram/config/schools')
const schoolService = require('../miniprogram/services/school-service')
const audit = require('./audit-multischool-migration')

const app = fs.readFileSync('miniprogram/app.js', 'utf8')
const contract = JSON.parse(fs.readFileSync('多院校字段契约.json', 'utf8'))

assert.strictEqual(contract.defaultSchoolId, schools.DEFAULT_SCHOOL_ID)
assert.strictEqual(contract.runtime.queryFilterEnabled, false)
assert.strictEqual(contract.runtime.uiChangeEnabled, false)
assert.strictEqual(schools.normalizeSchool({ _id: 'academy', name: '测试学院', status: 'active' }).id, 'academy')
assert.strictEqual(schools.normalizeSchool({ id: 'disabled', name: '停用学校', status: 'inactive' }), null)
assert(app.includes('this.refreshSchoolConfig()'))
assert(app.includes('this.schoolConfigPromise = loadSchoolCatalog()'))
assert(app.includes("source: 'local'"))
assert.strictEqual(audit.buildReport().readOnly, true)
assert.strictEqual(audit.buildReport().databaseWrites, 0)

delete global.wx
schoolService.loadSchoolCatalog().then(result => {
  assert.strictEqual(result.source, 'local')
  assert.strictEqual(result.currentSchoolId, schools.DEFAULT_SCHOOL_ID)
  global.wx = {
    cloud: {
      database: () => ({
        collection: () => ({
          where: () => ({ get: () => Promise.resolve({ data: [{ _id: 'academy', name: '测试学院', status: 'active' }] }) })
        })
      })
    }
  }
  return schoolService.loadSchoolCatalog().then(cloudResult => {
    assert.strictEqual(cloudResult.source, 'cloud')
    assert(cloudResult.schools.academy)
    global.wx.cloud.database = () => ({ collection: () => { throw new Error('permission denied') } })
    return schoolService.loadSchoolCatalog()
  }).then(fallbackResult => {
    assert.strictEqual(fallbackResult.source, 'local')
    assert.deepStrictEqual(fallbackResult.schools, schools.SCHOOLS)
    console.log('多院校第一阶段学校配置、契约与只读审计检查通过')
  })
}).catch(error => {
  console.error(error)
  process.exitCode = 1
})
