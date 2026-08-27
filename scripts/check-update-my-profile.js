const assert = require('assert');
const Module = require('module');
const originalLoad = Module._load;
let update;
const cloud = {
  DYNAMIC_CURRENT_ENV: 'current', init() {},
  getWXContext() { return { OPENID: 'openid-1' }; },
  database() {
    const command = { push(value) { return { push: value }; }, pull(value) { return { pull: value }; }, eq(value) { return { eq: value }; } };
    return { command, collection() { return { where(query) { assert.deepStrictEqual(query, { _openid: 'openid-1' }); return { update: async payload => { update = payload; return { stats: { updated: 1 } }; } }; } }; } };
  }
};
Module._load = (request, parent, isMain) => request === 'wx-server-sdk' ? cloud : originalLoad(request, parent, isMain);
const handler = require('../cloudfunctions/updateMyProfile/index.js').main;
Module._load = originalLoad;

(async () => {
  await handler({ avatar: 'cloud://avatar', profile: { username: '用户', zhuanye: ['学院', '年级'], registrationCompleted: true } });
  assert.equal(update.data['userinfo.userphoto'], 'cloud://avatar');
  assert.equal(update.data['userinfo.username'], '用户');
  await handler({ removeCommentedPostId: 'post-1' });
  assert.deepStrictEqual(update.data.pinglunguode, { pull: { id: { eq: 'post-1' } } });
  console.log('updateMyProfile checks passed');
})();
