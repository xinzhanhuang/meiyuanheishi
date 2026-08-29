const assert = require('assert')
const fs = require('fs')

const page = fs.readFileSync('miniprogram/pages/my/wd/wd.js', 'utf8')
const template = fs.readFileSync('miniprogram/pages/my/wd/wd.wxml', 'utf8')

const boundHandlers = [...template.matchAll(/bind(?:tap|getphonenumber)="([^"]+)"/g)].map(match => match[1])
const unresolvedHandlers = boundHandlers.filter(handler => !new RegExp(`\\b${handler}\\s*(?:\\(|:)`).test(page))
assert.deepStrictEqual(unresolvedHandlers, [], `unresolved WXML handlers: ${unresolvedHandlers.join(', ')}`)

for (const binding of ['chakantouxiang', 'getather']) {
  assert.match(template, new RegExp(`bindtap="${binding}"`), `missing WXML binding: ${binding}`)
}

for (const handler of ['onLoad', 'onShow', 'onHide', 'onUnload', 'onPullDownRefresh', 'jiantingchuli', 'checkred']) {
  assert.ok(new RegExp(`\\b${handler}\\s*(?:\\(|:)`).test(page), `missing page handler: ${handler}`)
}

for (const stale of ['message2', 'adError', 'adload', 'userphoto1', 'jianting()', 'GetUserInfo', 'phone==999']) {
  assert.ok(!page.includes(stale), `stale wd.js symbol remains: ${stale}`)
}

console.log('wd page static check passed')
