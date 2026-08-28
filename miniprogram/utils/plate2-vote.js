const { callCloudFunction, errorMessage } = require('./cloud-call')

async function submitVote(page) {
  if (page._voteSubmitting) return
  page._voteSubmitting = true
  try {
    await callCloudFunction('VoteOption', {
      actionVersion: 2,
      id: page.data.option._id,
      itemid: page.data.id,
      voteNumber: page.data.number,
      colorIndex: page.data.colorIndex
    })
    wx.showToast({ title: '投票成功', icon: 'none', duration: 800 })
    page.jiazai(page.data.id)
  } catch (error) {
    wx.showToast({ title: errorMessage(error, '投票失败，请重试'), icon: 'none' })
  } finally {
    page._voteSubmitting = false
  }
}

module.exports = { submitVote }
