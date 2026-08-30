const assert = require('assert')
const fs = require('fs')

function read(path) {
  return fs.readFileSync(path, 'utf8')
}

const login = read('cloudfunctions/login/index.js')
const publish = read('cloudfunctions/publishPost/index.js')
const vote = read('cloudfunctions/VoteOption/index.js')
const keywords = read('cloudfunctions/aggregateSearchKeywords/index.js')
const queue = read('cloudfunctions/getnewlines/index.js')
const work = read('cloudfunctions/getworkmessage/index.js')

assert(login.includes("const DEFAULT_SCHOOL_ID = 'tjarts'"))
assert(login.includes('schoolId: DEFAULT_SCHOOL_ID'))
assert(login.includes("transaction.collection('searchLogs').add({"))
assert(login.includes('schoolId: getActorSchoolId(user)'))

// 普通帖按当前浏览学校归属，但必须由云端确认该学校 active。
assert(publish.includes('getActorSchoolId(actor)'))
assert(publish.includes('resolveActiveSchoolId(db, event.schoolId, actor)'))
assert(publish.includes("collection('schools').doc(schoolId).get()"))
assert(publish.includes("return fail('INVALID_SCHOOL'"))
assert(publish.includes("event.postType === 'zhoubian'"))
assert(!publish.includes('String(event.schoolId || ss_xx.schoolId || \'\')\n  const orderdetail'))
assert(publish.includes('if (event.postType !== \'zhoubian\') ss_xx.schoolId = schoolId'))
assert(publish.includes("transaction.collection('ss').add({"))
assert(publish.includes("transaction.collection('VoteOption').add({"))
assert(publish.match(/transaction\.collection\('VoteOption'\)\.add\(\{\s*data: \{[\s\S]*?schoolId/s))

assert(vote.includes("transaction.collection('VoteRecord').add({"))
assert(vote.match(/transaction\.collection\('VoteRecord'\)\.add\(\{\s*data: \{[\s\S]*?schoolId/s))
assert(keywords.includes('schoolId: DEFAULT_SCHOOL_ID'))
assert(queue.match(/newItems\.push\(\{\s*schoolId: DEFAULT_SCHOOL_ID/s))
assert(work.match(/ssCollection\.add\(\{\s*data: \{\s*schoolId: DEFAULT_SCHOOL_ID/s))

// tj 目前只有评论/留言对既有主文档的更新，没有顶层新增入口；周边仍延后。
for (const source of [login, publish, vote, keywords, queue, work]) {
  assert(!source.match(/collection\(['"]tj['"]\)\.add\(/))
}

console.log('多院校新数据写入字段子系统静态检查通过')
