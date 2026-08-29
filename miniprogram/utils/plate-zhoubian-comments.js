const app = getApp()
const commentService = require('../services/comment-service')
const { errorMessage } = require('./cloud-call')

module.exports = {
  async checkStr(text) {
    try {
      return await commentService.checkText(text)
    } catch (err) {
      console.log(err)
      return false
    }
  },

  async fasongqian() {
    return app.userInfo.pinglunguode || []
  },

  async fbzbpj(pinglunnr, pd) {
    if (this._commentSubmitting) return false
    this._commentSubmitting = true
    this.setData({ commentSubmitState: 'loading' })
    try {
      const result = await commentService.publishNearbyComment(pinglunnr, pd)
      this.setData({ commentSubmitState: 'success' })
      return result
    } catch (err) {
      console.log(err)
      this.setData({ commentSubmitState: 'failed' })
      wx.showToast({ title: errorMessage(err, '评论失败，请重试'), icon: 'none' })
      return false
    } finally {
      this._commentSubmitting = false
    }
  }
}
