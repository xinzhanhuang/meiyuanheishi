const app = getApp()
const homeService = require('../services/home-service')

function addCategoryLabels(categories) {
  return (Array.isArray(categories) ? categories : Object.values(categories || {})).map(item => {
    const text = item.title11 || ''
    const firstLength = text.charCodeAt(0) >= 0xD800 && text.charCodeAt(0) <= 0xDBFF ? 2 : 1
    return Object.assign({}, item, { _icon: text.substring(0, firstLength), _label: text.substring(firstLength) })
  })
}

module.exports = {
  hotsearckeys() {
    const since = Date.now() - 90 * 24 * 60 * 60 * 1000
    return homeService.getHotSearches(since).then(hotsearckeys => {
      if (hotsearckeys.length) this.setData({ hotsearckeys })
    }).catch(err => console.error('获取搜索量前十的搜索词失败:', err))
  },

  currentOnlineNum() {
    return homeService.getOnlineCount(Date.now() - 18e6).then(total => {
      const offset = (Math.floor(Math.random() * 9) + 1) * (Math.floor(Math.random() * 9) + 1)
      setTimeout(() => wx.showToast({ title: total + offset + '人在线', icon: 'none' }), 3000)
    }).catch(err => console.warn('获取在线人数失败', err))
  },

  getBannerList() {
    const since = Date.now() - 3600 * 7000 * 24
    this.setData({ yizhou: since })
    homeService.getPinnedPosts(since).then(posts => this.love(posts)).then(posts => {
      this.setData({ ss_xx1: posts })
      app.zuiress_xx1 = posts
    }).catch(err => console.error('获取首页置顶帖失败', err))
    return homeService.getBannerConfig(app.currentSchool.name).then(config => {
      if (!config) return
      app.heishiweixin = config.lunbotu[4].cover
      app.zilei = config.zilei
      this.setData({ bannerList1: config.lunbotu, choosetitle: addCategoryLabels(config.choosetile) })
    }).catch(err => console.error('获取首页轮播失败', err))
  }
}
