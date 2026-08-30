const assert = require('assert')
const context = require('../miniprogram/services/school-context-service')
const schools = require('../miniprogram/config/schools')

const removed = []
global.wx = {
  getStorageSync: () => schools.DEFAULT_SCHOOL_ID,
  setStorageSync: () => {},
  removeStorageSync: key => removed.push(key)
}

const app = {
  schools: {
    tjarts: schools.SCHOOLS.tjarts,
    academy: { id: 'academy', name: '测试学院', status: 'active' }
  },
  currentSchool: schools.SCHOOLS.tjarts,
  currentSchoolId: schools.DEFAULT_SCHOOL_ID,
  zuiress_xx1: [{ _id: 'old' }],
  zilei: { old: true },
  globalData: { schoolListCache: ['old'] }
}

assert.strictEqual(context.get(app).id, schools.DEFAULT_SCHOOL_ID)
assert.strictEqual(Object.keys(context.list(app)).length, 2)
let notifications = []
const unsubscribe = context.subscribe(app, snapshot => notifications.push(snapshot))
assert.strictEqual(notifications.length, 1)
context.set(app, 'academy')
assert.strictEqual(context.get(app).id, 'academy')
assert.strictEqual(app.currentSchoolId, 'academy')
assert.strictEqual(app.zuiress_xx1, null)
assert.strictEqual(app.zilei, null)
assert.strictEqual(app.globalData.schoolListCache, null)
assert.deepStrictEqual(removed.sort(), context.SCHOOL_CACHE_KEYS.slice().sort())
assert.strictEqual(notifications.at(-1).reason, 'set')
unsubscribe()
app.schoolConfigReady = true
context.set(app, 'missing')
assert.strictEqual(context.get(app).id, schools.DEFAULT_SCHOOL_ID)
assert.strictEqual(notifications.length, 2)
app.schoolConfigReady = false
context.set(app, 'school-from-share')
assert.strictEqual(context.get(app).id, 'school-from-share')
assert.strictEqual(context.get(app).status, 'pending')
delete global.wx

context.refresh(app).then(result => {
  assert.strictEqual(result.source, 'local')
  assert.strictEqual(result.currentSchoolId, schools.DEFAULT_SCHOOL_ID)
  assert.strictEqual(app.schoolConfigReady, true)
  console.log('学校上下文子系统行为检查通过')
}).catch(error => {
  console.error(error)
  process.exitCode = 1
})
