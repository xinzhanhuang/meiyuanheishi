const assert = require('assert')
const Module = require('module')

const calls = []
const cloudMock = {
  DYNAMIC_CURRENT_ENV: 'test',
  init() {},
  database() {
    return {
      command: { inc: (value) => ({ increment: value }) },
      collection(collection) {
        return {
          doc(id) {
            return {
              update({ data }) {
                calls.push({ collection, id, data })
                return Promise.resolve({ stats: { updated: 1 } })
              }
            }
          }
        }
      }
    }
  }
}

const originalLoad = Module._load
Module._load = function (request, parent, isMain) {
  if (request === 'wx-server-sdk') return cloudMock
  return originalLoad.call(this, request, parent, isMain)
}
const look = require('../cloudfunctions/look/index')
Module._load = originalLoad

;(async () => {
  assert.deepStrictEqual(await look.main({ type: 'ss' }), {
    success: false,
    errCode: 'INVALID_ID',
    errMsg: 'Missing post id'
  })
  assert.deepStrictEqual(await look.main({ id: 'post-1', type: 'unknown' }), {
    success: false,
    errCode: 'INVALID_TYPE',
    errMsg: 'Unsupported post type'
  })

  const cases = [
    [{ id: 'post-1', type: 'ss', num: 1 }, 'ss', 'ss_xx.look', 1],
    [{ id: 'post-2', type: 'ss' }, 'ss', 'ss_xx.look', 6],
    [{ id: 'post-3', type: 'tianmeizhoubian' }, 'tianmeizhoubian', 'ss_xx.zoubianlook', 7],
    [{ id: 'post-4', type: 'tj' }, 'tj', 'look', 1]
  ]
  for (const [event, collection, field, increment] of cases) {
    const result = await look.main(event)
    assert.strictEqual(result.success, true)
    assert.strictEqual(result.increment, increment)
    assert.deepStrictEqual(calls.pop(), {
      collection,
      id: event.id,
      data: { [field]: { increment } }
    })
  }

  console.log('浏览计数云函数契约检查通过')
})().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
