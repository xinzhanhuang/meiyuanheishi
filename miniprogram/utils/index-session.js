const app = getApp()

module.exports = {
  bindUserWatcher() {
    if (this.unsubscribeUserWatcher) {
      app.startUserWatcher()
      return
    }
    this.unsubscribeUserWatcher = app.subscribeUserWatcher(user => this.jiantingchuli(user.message || []))
    app.startUserWatcher()
  },

  unbindUserWatcher() {
    if (this.unsubscribeUserWatcher) this.unsubscribeUserWatcher()
    this.unsubscribeUserWatcher = null
  },

  restoreUserSession() {
    return app.ensureCurrentUser().then(user => {
      if (!user) return null
      this.bindUserWatcher()
      this.checkred()
      return user
    })
  }
}
