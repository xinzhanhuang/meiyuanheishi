const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const cloudRoot = path.join(root, 'cloudfunctions');
const names = fs.readdirSync(cloudRoot).filter(name => fs.statSync(path.join(cloudRoot, name)).isDirectory());
const withSource = names.filter(name => fs.existsSync(path.join(cloudRoot, name, 'index.js')));
const inventory = fs.readFileSync(path.join(root, '项目结构与云端数据台账.md'), 'utf8');

assert.strictEqual(names.length, 121);
assert.strictEqual(withSource.length, 22);
['`users`', '`ss`', '`tianmeizhoubian`', '`tj`', '`VoteOption`', '`VoteRecord`'].forEach(item => assert(inventory.includes(item)));
['`postId`', '`postType`', '`commentId`', '`schoolId`'].forEach(item => assert(inventory.includes(item)));
assert(inventory.includes('**可安全删除：0 个。**'));
console.log('project inventory checks passed');
