const assert = require('assert');
const Module = require('module');
const originalLoad = Module._load;
let records = [];
const cloud = {
  DYNAMIC_CURRENT_ENV: 'current', init() {},
  getWXContext() { return { OPENID: 'openid-1' }; },
  database() {
    return { collection() {
      return {
        where(query) { assert.deepStrictEqual(query, { _openid: 'openid-1' }); return { get: async () => ({ data: records }) }; },
        add: async ({ data }) => { records = [Object.assign({ _id: 'user-1', _openid: 'openid-1' }, data)]; return { _id: 'user-1' }; }
      };
    }};
  }
};
Module._load = (request, parent, isMain) => request === 'wx-server-sdk' ? cloud : originalLoad(request, parent, isMain);
const handler = require('../cloudfunctions/registerUser/index.js').main;
Module._load = originalLoad;

(async () => {
  const created = await handler({ profile: { username: '测试用户' } });
  assert.equal(created.created, true);
  assert.equal(created.user._id, 'user-1');
  assert.equal(created.user.userinfo.login, true);
  const existing = await handler({ profile: { username: '不会覆盖' } });
  assert.equal(existing.created, false);
  assert.equal(existing.user.userinfo.username, '测试用户');
  console.log('registerUser checks passed');
})();
