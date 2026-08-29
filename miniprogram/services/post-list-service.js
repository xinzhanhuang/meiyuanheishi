const db = wx.cloud.database()
const command = db.command
const { callCloudFunction } = require('../utils/cloud-call')

// Keep list-specific filters in pages; this service owns the shared ss query plumbing.
function queryPosts(options) {
  let query = db.collection('ss').where(options.where || {})
  if (options.limit !== undefined && options.limitBeforeOrderBy) query = query.limit(options.limit)
  if (options.orderBy) query = query.orderBy(options.orderBy, options.orderDirection || 'desc')
  if (options.limit !== undefined && !options.limitBeforeOrderBy) query = query.limit(options.limit)
  if (options.field) query = query.field(options.field)
  if (options.skip !== undefined) query = query.skip(options.skip)
  return query.get()
}

function getSearchSuggestions(keyword) {
  return callCloudFunction('getSearchSuggestions', { keyword })
    .then(result => result.list || [])
}

function getTagPostCounts(tags) {
  return callCloudFunction('getTagPostCount', { tags })
}

module.exports = { command, queryPosts, getSearchSuggestions, getTagPostCounts }
