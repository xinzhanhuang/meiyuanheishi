const assert = require('assert');
const fs = require('fs');

const normal = fs.readFileSync('miniprogram/pages/plate2/plate2.js', 'utf8');
const nearby = fs.readFileSync('miniprogram/pages/plate-zhoubian/plate-zhoubian.js', 'utf8');
const normalShare = fs.readFileSync('miniprogram/utils/plate2-share.js', 'utf8');
const nearbyShare = nearby.slice(nearby.indexOf('onShareAppMessage:'), nearby.indexOf('//点赞帖子', nearby.indexOf('onShareAppMessage:')));

['postId=', 'postType=', 'source=share'].forEach(field => {
  assert(normalShare.includes(field));
  assert(nearbyShare.includes(field));
});
assert(normal.includes("require('../../utils/plate2-share')"));
['bannerList2=', 'heishiweixin=', 'zuiress_xx1='].forEach(field => assert(!normalShare.includes(field)));
assert(nearbyShare.includes('onShareTimeline:'));
assert(nearbyShare.includes('query:'));
console.log('share target checks passed');
