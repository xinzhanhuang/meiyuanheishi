const assert = require('assert');
let appDefinition;
let watchOptions;
let watchCount = 0;
const badges = [];
global.getApp = () => ({});
global.App = definition => { appDefinition = definition; };
global.wx = {
  cloud: {
    init() {}, callFunction() { return { then() { return { catch() {} }; } }; },
    database() { return { collection() { return { doc() { return { watch(options) { watchOptions = options; watchCount++; return { close() {} }; } }; } }; } }; }
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
assert.equal(watchCount, 1);
watchOptions.onChange({ docs: [{ _id: 'user-1', message: [{ id: 'm1' }], dzmessage: [{ id: 'd1' }] }] });
assert.equal(app.message.length, 1);
assert.equal(badges.at(-1), '2');
app.userWatcher = null;
app.userWatcherRetryTimer = {};
app.startUserWatcher();
assert.equal(watchCount, 1, 'should keep the scheduled retry for the same user');
app.userWatcherRetryTimer = null;
app.stopUserWatcher();
assert.equal(app.userWatcher, null);
console.log('user watcher checks passed');
