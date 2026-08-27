const assert = require('assert');
const Module = require('module');
const originalLoad = Module._load;
const writes = [];
const cloud = {
  DYNAMIC_CURRENT_ENV: 'current', init() {},
  getWXContext() { return { OPENID: 'openid-1' }; },
  database() {
    return {
      command: { push(value) { return { push: value }; } },
      collection(name) {
        return {
          where() { return { get: async () => ({ data: name === 'users' ? [{ _id: 'user-1' }] : [] }) }; },
          doc() { return { get: async () => ({ data: { ss_xx: { lzid: 'user-1' } } }), update: async payload => writes.push([name, payload]) }; },
          add: async ({ data }) => { writes.push([name, data]); return { _id: 'post-1' }; }
        };
      }
    };
  }
};
Module._load = (request, parent, isMain) => request === 'wx-server-sdk' ? cloud : originalLoad(request, parent, isMain);
const handler = require('../cloudfunctions/publishPost/index.js').main;
Module._load = originalLoad;

(async () => {
  const result = await handler({ collection: 'ss', ss_xx: { lzid: 'user-1', firsttime: 1, nr: '内容', tp: [], orderdetail: {} }, voteNumberPerPerson: 1, voteOption: ['A'] });
  assert.equal(result.postId, 'post-1');
  assert.equal(result.summary.type, 'post');
  assert.ok(writes.some(([name]) => name === 'VoteOption'));
  assert.ok(writes.some(([name]) => name === 'users'));
  console.log('publishPost checks passed');
})();
