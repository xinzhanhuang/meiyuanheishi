const assert = require('assert')
const fs = require('fs')

const page = fs.readFileSync('miniprogram/pages/post/post.js', 'utf8')
const service = fs.readFileSync('miniprogram/services/post-service.js', 'utf8')

assert(page.includes("require('../../services/post-service')"))
assert(page.includes("require('../../services/user-service')"))
assert(page.includes('postService.buildPublishRecord('))
assert(page.includes('postService.reviewText('))
assert(page.includes('postService.reviewImages('))
assert(page.includes('postService.uploadImages('))
assert(page.includes('postService.publishPost('))
assert(!page.includes('wx.cloud.callFunction('), '发帖页不应直接调用云函数')
assert(!page.includes('callCloudFunction('), '发帖页不应绕过 service 调用云函数')
assert(!page.includes('wx.cloud.uploadFile('), '发帖页不应直接上传文件')
assert(!page.includes('getFileSystemManager'), '发帖页不应直接读取媒体 Buffer')
for (const method of ['buildPublishRecord', 'reviewText', 'reviewImages', 'uploadImages']) {
  assert(service.includes(`function ${method}`), `post-service 缺少 ${method}`)
}
assert(service.includes("require('./comment-service')"))

global.wx = {
  cloud: {
    database: () => ({}),
    uploadFile({ cloudPath, filePath, success }) {
      success({ fileID: `${cloudPath}:${filePath}` })
    }
  }
}
global.getApp = () => ({ getCurrentSchoolId: () => 'tjarts' })

const postService = require('../miniprogram/services/post-service')
const record = postService.buildPublishRecord({
  form: { wbnr: '内容', ordertitle: '标题', jg: '2', lianxi: '13800000000', weixin: 'wx' },
  pageData: { choosetitle111: '#话题', openlocationtitle: '其他任务' },
  userInfo: {
    _id: 'user-1',
    userinfo: { username: '校园用户', zhuanye: '专业', gender: '未知', userphoto: '/avatar.png' }
  }
})
assert.strictEqual(record.nr, '内容')
assert.strictEqual(record.choosetitle, '#话题')
assert.strictEqual(record.orderdetail.ordertitle, '标题')
assert.deepStrictEqual(record.tp, [])
assert.strictEqual(record.lzid, 'user-1')

postService.uploadImages(['tmp/a.jpg'], { userId: 'user-1', format: 'png' }).then(fileIds => {
  assert.strictEqual(fileIds.length, 1)
  assert(fileIds[0].startsWith('ss_img1/user-1-'))
  assert(fileIds[0].endsWith('-0.png:tmp/a.jpg'))
  console.log('普通发帖页面与 service 边界检查通过')
}).catch(error => {
  console.error(error)
  process.exitCode = 1
})
