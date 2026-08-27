const assert = require('assert');
let appDefinition;
let watchOptions;
const badges = [];
global.getApp = () => ({});
global.App = definition => { appDefinition = definition; };
global.wx = {
  cloud: {
    init() {}, callFunction() { return { then() { return { catch() {} }; } }; },
    database() { return { collection() { return { doc() { return { watch(options) { watchOptions = options; return { close() {} }; } }; } }; } }; }
  },
  setTabBarBadge(options) { badges.push(options.text); },
  removeTabBarBadge() { badges.push('0'); },
  setStorageSync() {}, getUpdateManager() { return { onCheckForUpdate() {} }; }
};

require('../miniprogram/app.js');
const app = Object.assign({}, appDefinition);
app.onLaunch();
app.userInfo = { _id: 'user-1', message: [], dzmessage: [] };
app.startUserWatcher();
app.startUserWatcher();
assert.ok(watchOptions, 'should create one user watcher');
watchOptions.onChange({ docs: [{ _id: 'user-1', message: [{ id: 'm1' }], dzmessage: [{ id: 'd1' }] }] });
assert.equal(app.message.length, 1);
assert.equal(badges.at(-1), '2');
app.stopUserWatcher();
assert.equal(app.userWatcher, null);
console.log('user watcher checks passed');
