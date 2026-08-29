const { callCloudFunction } = require('../utils/cloud-call')

function getVoteState(postId) {
  return callCloudFunction('VoteOption', { action: 'getVoteState', itemid: postId })
}

function submitVote(data) {
  return callCloudFunction('VoteOption', Object.assign({ actionVersion: 2 }, data))
}

module.exports = { getVoteState, submitVote }
