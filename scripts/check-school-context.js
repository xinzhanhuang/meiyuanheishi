const assert = require('assert')
const fs = require('fs')
const { DEFAULT_SCHOOL_ID, getSchool } = require('../miniprogram/config/schools')

const appConfig = JSON.parse(fs.readFileSync('miniprogram/app.json', 'utf8'))
const app = fs.readFileSync('miniprogram/app.js', 'utf8')
const postService = fs.readFileSync('miniprogram/services/post-service.js', 'utf8')
const home = fs.readFileSync('miniprogram/utils/index-home.js', 'utf8')
const badgeFiles = [
  'miniprogram/app.js', 'miniprogram/pages/index/index.js', 'miniprogram/pages/my/wd/wd.js',
  'miniprogram/pages/message/xiaoxi/xiaoxi.js', 'miniprogram/pages/message/dianzan/dianzan.js'
]

assert.strictEqual(DEFAULT_SCHOOL_ID, 'tjarts')
assert.strictEqual(getSchool('missing').id, DEFAULT_SCHOOL_ID)
assert.deepStrictEqual(appConfig.tabBar.list.map(item => item.pagePath), ['pages/index/index', 'pages/my/wd/wd'])
for (const page of ['pages/tools/tools', 'pages/post-zhoubian/post-zhoubian', 'pages/plate-zhoubian/plate-zhoubian']) {
  assert(appConfig.pages.includes(page), `${page} 应保留以便回退和打开旧链接`)
}
assert(app.includes('this.currentSchoolId = this.currentSchool.id'))
assert(app.includes('setCurrentSchoolId(schoolId)'))
assert(postService.includes("Object.assign({ schoolId: app.getCurrentSchoolId() }, data)"))
assert(home.includes('app.currentSchool.name'))
for (const file of badgeFiles) {
  assert(!/index:\s*2\b/.test(fs.readFileSync(file, 'utf8')), `${file} 仍使用隐藏前的 Tab 索引`)
}
console.log('周边隐藏与多院校默认上下文检查通过')
