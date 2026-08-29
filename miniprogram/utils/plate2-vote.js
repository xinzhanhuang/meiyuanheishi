const { errorMessage } = require('./cloud-call')
const voteService = require('../services/vote-service')

async function submitVote(page) {
  if (page._voteSubmitting) return
  page._voteSubmitting = true
  page.setData({ voteSubmitState: 'loading' })
  try {
    await voteService.submitVote({
      id: page.data.option._id,
      itemid: page.data.id,
      voteNumber: page.data.number,
      colorIndex: page.data.colorIndex
    })
    wx.showToast({ title: '投票成功', icon: 'none', duration: 800 })
    page.setData({ voteSubmitState: 'success' })
    page.jiazai(page.data.id)
  } catch (error) {
    page.setData({ voteSubmitState: 'failed' })
    wx.showToast({ title: errorMessage(error, '投票失败，请重试'), icon: 'none' })
  } finally {
    page._voteSubmitting = false
  }
}

module.exports = { submitVote }
