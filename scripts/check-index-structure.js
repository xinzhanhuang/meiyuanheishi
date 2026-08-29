const assert = require('assert')
const fs = require('fs')

const read = file => fs.readFileSync(file, 'utf8')
const index = read('miniprogram/pages/index/index.js')
const wxml = read('miniprogram/pages/index/index.wxml')
const session = read('miniprogram/utils/index-session.js')

for (const method of ['modalConfirm', 'previewImg', 'hotPost', 'jianting', 'onPostImageError']) {
  assert(!new RegExp(`\\n  ${method}\\s*(?:\\(|:)`).test(index), `首页仍保留无引用方法 ${method}`)
}
for (const field of ['loading', 'loadingTip', 'lunbotu', 'jianting', 'message', 'scwidth', 'searchcache', 'kong', 'isover', 'guznzhugzh', 'option11111', 'cancelanniu', 'page_show', 'menuButtonInfo']) {
  assert(!new RegExp(`\\n    ${field}:`).test(index), `首页仍保留无引用状态 ${field}`)
}

assert(!session.includes('restoreUserSession'), '会话工具仍保留无引用方法')
assert(index.includes('this.bindUserWatcher()'), '首页登录后必须绑定用户监听')
assert(!index.includes('this.jianting()'), '首页不应通过无意义的监听包装方法')
assert(!wxml.includes('bind:imageerror="onPostImageError"'), '首页不应绑定无行为的图片错误适配器')
assert(!wxml.includes('bindtap="qiandao"'), '首页不应保留缺失方法的无行为点击绑定')

const listenerStart = index.indexOf('  jiantingchuli(e) {')
const listenerEnd = index.indexOf('\n  },', listenerStart)
const listener = index.slice(listenerStart, listenerEnd)
assert(listener.includes('this.checkred()'), '消息监听必须复用统一红点处理')
assert(!listener.includes('wx.setTabBarBadge'), '消息监听不应重复设置红点')

console.log('首页结构轻量化检查通过')
