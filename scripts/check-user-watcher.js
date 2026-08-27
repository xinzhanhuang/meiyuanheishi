const assert = require('assert');
let appDefinition;
let watchOptions;
let watchCount = 0;
const badges = [];
const timers = [];
global.setTimeout = callback => { timers.push(callback); return callback; };
global.clearTimeout = timer => {
  const index = timers.indexOf(timer);
  if (index >= 0) timers.splice(index, 1);
};
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
app.startUserWatcher();
for (let attempt = 0; attempt < 3; attempt++) {
  watchOptions.onError(new Error('offline'));
  assert.equal(timers.length, 1);
  timers.shift()();
}
watchOptions.onError(new Error('offline'));
assert.equal(timers.length, 0, 'should stop scheduling after three retries');
assert.equal(app.userWatcherUnavailable, true);
assert.equal(app.jianting, false);
console.log('user watcher checks passed');
