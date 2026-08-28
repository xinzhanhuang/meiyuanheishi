const app = getApp()

function shareData(page) {
  const detail = page.data.ss_xx.ss_xx
  const order = detail.orderdetail || {}
  const query = `id=${page.data.id}&postId=${page.data.id}&postType=ss&source=share&fenxiang=ture&liuyan=${page.data.liuyan}`
  return {
    order,
    query,
    title: order.ordertitle ? `派单${order.jg}元｜${order.ordertitle}` : app.ssinfo.nr,
    imageUrl: app.ssinfo.tp[0]
  }
}

module.exports = {
  fuzhi(e) {
    wx.setClipboardData({ data: e.currentTarget.dataset.item })
  },

  onShareTimeline() {
    const share = shareData(this)
    const suffix = share.order.ordertitle
      ? `&takeorderid=${this.data.takeorderid1}&lzid=${this.data.lzid}`
      : `&lzid=${this.data.lzid}`
    return { title: share.title, imageUrl: share.imageUrl, query: share.query + suffix }
  },

  onShareAppMessage() {
    const share = shareData(this)
    const suffix = share.order.ordertitle
      ? `&takeorderid=${this.data.takeorderid1}&lzid=${this.data.lzid}`
      : ''
    return {
      title: share.title,
      imageUrl: share.imageUrl,
      path: `/pages/plate2/plate2?${share.query}${suffix}`
    }
  }
}
