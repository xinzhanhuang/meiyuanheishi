const assert = require('assert');
const Module = require('module');
const originalLoad = Module._load;
let update;
const command = {
  eq(value) { return { eq: value }; },
  pull(value) { return { pull: value }; },
  push(value) { return { push: value }; }
};
const cloud = {
  DYNAMIC_CURRENT_ENV: 'current',
  init() {},
  getWXContext() { return { OPENID: 'openid-1' }; },
  database() {
    return {
      command,
      collection() {
        return { where(query) { assert.deepStrictEqual(query, { _openid: 'openid-1' }); return { update(payload) { update = payload; return { stats: { updated: 1 } }; } }; } };
      }
    };
  }
};
Module._load = (request, parent, isMain) => request === 'wx-server-sdk' ? cloud : originalLoad(request, parent, isMain);
const handler = require('../cloudfunctions/updateUserPresence/index.js').main;
Module._load = originalLoad;

(async () => {
  await handler({ messageAction: 'remove', messageType: 'message', messageId: 'm1' });
  assert.deepStrictEqual(update.data.message, { pull: { id: { eq: 'm1' } } });
  await handler({ messageAction: 'clear', messageType: 'dzmessage' });
  assert.deepStrictEqual(update.data.dzmessage, []);
  const result = await handler({ messageAction: 'remove', messageType: 'invalid', messageId: 'm1' });
  assert.deepStrictEqual(result, { updated: 0 });
  console.log('updateUserPresence message action checks passed');
})();
