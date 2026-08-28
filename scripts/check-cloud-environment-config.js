const assert = require('assert')
const fs = require('fs')
const { CLOUD_ENV_BY_APP_ID, getCloudEnvId } = require('../miniprogram/config/cloud-env')

assert.strictEqual(
  getCloudEnvId({ miniProgram: { appId: 'wx3280f3d41b172606' } }),
  'tafaheishi-1gs4bxsvcf864035'
)
assert.strictEqual(
  getCloudEnvId({ miniProgram: { appId: 'wx46b1315e54c4e3b6' } }),
  'cloudbase-5gz26l7717d976f6'
)
assert.throws(
  () => getCloudEnvId({ miniProgram: { appId: 'unknown' } }),
  /未配置 AppID/
)
assert.strictEqual(Object.keys(CLOUD_ENV_BY_APP_ID).length, 2)
const app = fs.readFileSync('miniprogram/app.js', 'utf8')
assert(app.includes('env: getCloudEnvId()'))
assert(!/env:\s*["'](?:tafaheishi|cloudbase-)/.test(app), 'app.js 不得硬编码云环境')

console.log('云环境 AppID 路由检查通过')
