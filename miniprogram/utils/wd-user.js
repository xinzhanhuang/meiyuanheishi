const app = getApp()

function userViewState(user) {
  var profile = user && user.userinfo || {}
  var message = user && Array.isArray(user.message) ? user.message : []
  var dzmessage = user && Array.isArray(user.dzmessage) ? user.dzmessage : []
  return {
    userphoto: profile.userphoto || '/images/message/touxiang1.png',
    username: profile.username || '游客',
    anonymous: profile.anonymous || '',
    isVIP: profile.isVIP === true,
    login: profile.login === true,
    wenzhang: user && Array.isArray(user.wenzhang) ? user.wenzhang : [],
    message,
    dzmessage,
    zhuanye: profile.zhuanye || '',
    gender: profile.gender || '',
    LCU: profile.LCU === true,
    messagenumber: message.length || 0,
    dzmessagenumber: dzmessage.length || 0
  }
}

module.exports = {
  applyUserState(user) {
    if (!user) return false
    this.setData(userViewState(user))
    return true
  },

  bindUserWatcher() {
    if (this.unsubscribeUserWatcher) {
      app.startUserWatcher()
      return
    }
    this.unsubscribeUserWatcher = app.subscribeUserWatcher(user => {
      this.applyUserState(user)
      this.jiantingchuli(user.message || [])
    })
    app.startUserWatcher()
  },

  unbindUserWatcher() {
    if (this.unsubscribeUserWatcher) this.unsubscribeUserWatcher()
    this.unsubscribeUserWatcher = null
  },

  refreshCurrentUser(showToast) {
    return app.ensureCurrentUser({ refresh: true }).then(user => {
      if (user) this.applyUserState(user)
      if (showToast && user) wx.showToast({ title: '刷新成功', icon: 'none', duration: 800 })
      return user
    })
  }
}
