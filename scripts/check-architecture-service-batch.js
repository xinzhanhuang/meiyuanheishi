const assert = require('assert')
const fs = require('fs')

const read = file => fs.readFileSync(file, 'utf8')
const services = ['post', 'user', 'comment', 'vote']
for (const service of services) {
  assert(fs.existsSync(`miniprogram/services/${service}-service.js`), `缺少 ${service}-service`)
}

const plate2 = read('miniprogram/pages/plate2/plate2.js')
const interactions = read('miniprogram/utils/plate2-interactions.js')
assert(!plate2.includes('db.collection('), 'plate2 主页面仍直接访问数据库')
assert(!plate2.includes('wx.cloud.callFunction('), 'plate2 主页面仍直接调用云函数')
for (const service of services.slice(0, 3)) {
  assert(plate2.includes(`${service}Service`), `plate2 未使用 ${service}-service`)
}
for (const method of ['pldianzan', 'mazhu', 'dianzan']) {
  assert(interactions.includes(`${method}(`), `互动模块缺少 ${method}`)
}
assert(plate2.includes('...interactionMethods'))

const publish = read('cloudfunctions/publishPost/index.js')
for (const field of ['postType', 'schoolId', 'authorId', 'status', 'createdAt', 'updatedAt', 'requestId']) {
  assert(publish.includes(field), `发布云函数缺少公共字段：${field}`)
}
assert(publish.includes("code: 'OK'"))
assert(publish.includes('duplicate: true'))

for (const file of ['cloudfunctions/jubao/index.js', 'cloudfunctions/jubaoplus/index.js']) {
  const source = read(file)
  assert(source.includes('runTransaction'), `${file} 未使用事务`)
  assert(source.includes("success: true, code: 'OK'"), `${file} 返回契约未统一`)
}

const comments = read('miniprogram/utils/plate2-comments.js')
assert(comments.includes("commentSubmitState: 'loading'"))
assert(plate2.includes('await this.fbpl('), '评论提交未等待云端结果')

console.log('帖子模型、服务层与状态契约检查通过')
