const assert = require('assert')
const fs = require('fs')

function read(file) {
  return fs.readFileSync(file, 'utf8')
}

const login = read('cloudfunctions/login/index.js')
for (const action of [
  'ensureUser',
  'updateProfile',
  'setOnline',
  'setLoginTime',
  'setMessageBadge',
  'appendLookHistory',
  'recordSearch',
  'removeCommentHistory',
  'removeMessage',
  'clearMessages'
]) {
  assert(login.includes(`'${action}'`), `login 缺少安全用户操作：${action}`)
}

for (const file of [
  'miniprogram/pages/my/wd/wd.js',
  'miniprogram/pages/my/set/set.js'
]) {
  const source = read(file)
  assert(!/collection\(['"]users['"]\)[^\n]*\.(add|update|remove)\s*\(/.test(source), `${file} 仍直接写 users`)
}
assert(login.includes('cloud.getWXContext()'))
assert(login.includes("where({ _openid: openid })"))

const migrated = {
  'miniprogram/app.js': 'setOnline',
  'miniprogram/pages/index/index.js': 'setLoginTime',
  'miniprogram/pages/zuiretiezi/zuiretiezi.js': 'setLoginTime',
  'miniprogram/utils/plate2-data.js': 'appendLookHistory',
  'miniprogram/pages/post/post.js': 'setMessageBadge'
}
for (const [file, action] of Object.entries(migrated)) {
  const source = read(file)
  assert(source.includes(`action: '${action}'`), `${file} 未调用 login.${action}`)
  assert(!/collection\(['"]users['"]\)[^\n]*\.(add|update|remove)\s*\(/.test(source), `${file} 仍直接写 users`)
}

for (const file of [
  'miniprogram/pages/message/xiaoxi/xiaoxi.js',
  'miniprogram/pages/message/dianzan/dianzan.js',
  'miniprogram/pages/plate4/plate4.js'
]) {
  const source = read(file)
  assert(!/collection\(['"](?:users|searchLogs)['"]\)[^\n]*\.(add|update|remove)\s*\(/.test(source), `${file} 仍直接写 users/searchLogs`)
}

for (const [file, action] of [
  ['miniprogram/pages/plate2/plate2.js', 'setMessageBadge'],
  ['miniprogram/pages/post-zhoubian/post-zhoubian.js', 'setMessageBadge']
]) {
  const source = read(file)
  assert(source.includes(`action: '${action}'`), `${file} 未调用 login.${action}`)
}

console.log('login 用户安全写入检查通过')
