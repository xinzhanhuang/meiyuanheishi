const app = getApp()
const { errorMessage } = require('./cloud-call')
const commentService = require('../services/comment-service')

module.exports = {
  showCommentMenu(e) {
    let { item, index0, index, type, index1, parentitem } = e.currentTarget.dataset
    if (index0 === undefined && index !== undefined) index0 = index
    const userId = app.userInfo._id
    const postOwnerId = this.data.ss_xx.ss_xx.lzid
    const groups = [{ text: '回复', value: 'reply' }, { text: '复制', value: 'copy' }]
    if (this.data.isAdmin || postOwnerId == userId || item.plrid == userId) {
      groups.push({ text: '删除', type: 'warn', value: 'delete' })
    }
    this.setData({
      showDialog: true,
      groups,
      selectedComment: { item, index0, type, index1, parentitem }
    })
  },

  closeCommentMenu() {
    this.setData({ showDialog: false })
  },

  btnClick(e) {
    const { value } = e.detail
    this.closeCommentMenu()
    if (value === 'reply') this.handleMenuReply()
    else if (value === 'copy') this.handleMenuCopy()
    else if (value === 'delete') this.handleMenuDelete()
    else if (value === 'toggle_status') {
      this.data.ss_xx.ss_xx.orderdetail.openlocationtitle ? this.oderover() : this.gameover()
    } else if (value === 'delete_post') this.deletethisone()
  },

  handleMenuReply() {
    const { item, index0, type, index1, parentitem } = this.data.selectedComment
    const dataset = type === 'main'
      ? { xx: item, index: index0 }
      : { xx: parentitem, xx1: item, index: index0, index1 }
    this.huifu({ currentTarget: { dataset } })
  },

  handleMenuCopy() {
    wx.setClipboardData({
      data: this.data.selectedComment.item.wbnr,
      success() { wx.showToast({ title: '已复制', icon: 'none' }) }
    })
  },

  handleMenuDelete() {
    const { item, index0, type, index1, parentitem } = this.data.selectedComment
    const dataset = type === 'main'
      ? { id0: item.plrid, index: index0, time: item.time, huifunb: item.huifunb }
      : {
          id0: parentitem.plrid,
          index: index0,
          time: parentitem.time,
          index1,
          id1: item.plrid,
          time1: item.time
        }
    this.changanshanchu({ currentTarget: { dataset } })
  },

  zhankai(e) {
    this.setData({ [`ss_xx.ss_xx.huifunr[${e.currentTarget.dataset.index}].zhankai`]: true })
  },

  shouqi(e) {
    this.setData({ [`ss_xx.ss_xx.huifunr[${e.currentTarget.dataset.index}].zhankai`]: false })
  },

  async fbpl(pinglunnr, pd, Mazhu) {
    if (this._commentSubmitting) return false
    this._commentSubmitting = true
    this.setData({ commentSubmitState: 'loading' })
    try {
      const result = await commentService.publishComment(pinglunnr, pd, Mazhu)
      this.setData({ commentSubmitState: 'success' })
      return result
    } catch (error) {
      this.setData({ commentSubmitState: 'failed' })
      wx.showToast({ title: errorMessage(error, '评论失败，请重试'), icon: 'none' })
      return false
    } finally {
      this._commentSubmitting = false
    }
  },

  wbnr(e) {
    this.setData({ wbnr: e.detail.value })
  }
}
