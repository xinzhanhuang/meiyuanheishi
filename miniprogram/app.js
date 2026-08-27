//app.js
const app = getApp()
App({
  onLaunch: function () {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        env: "tafaheishi-1gs4bxsvcf864035",
        traceUser: true,
      })
    }
    this.kbs = {
      cookies: "",
      money: "0.00"
    }
    this.system1 = ""
    this.hongdian = false//标记当前tabar上是否有红点、文本
    this.shuaxin = false
    this.fenxiang = "false"
    this.fxssid = ""
    this.pendingPostTarget = null
    this.jianting = false


    this.glids = ["9999"]
    this.message = []
    this.globalData = {}
    this.systeminfo = ""
    this.loveinfo = ""
    this.ssinfo = {
      lovenb: "",
      plnb: "",
      looknb: ""
    }

    this.userInfo = {
      ban: false,
      msgnb: [0, 0],
      _openid: "",
      _id: "",
      wenzhang: [],
      message: [],
      pinglunguode: [],
      userinfo: {
        userphoto: "/images/message/touxiang1.png",
        username: "未登陆",
        anonymous: "",
        isVIP: false,
        login: "未知",
      },



    }


    //   {
    //     "pagePath": "pages/tools/tools",
    //     "text": "周边点评",
    //     "iconPath": "images/tabBar/tools0.png",
    //     "selectedIconPath": "images/tabBar/tools1.png"
    // },


  },
  onShow() {
    this.startUserWatcher()
    this.checkUpdate()
    this.updateOnlineState(true)
  },

  //不在小程序中就下线
  onHide() {
    this.stopUserWatcher()
    this.updateOnlineState(false)
  },

  onReady() {
  },

  onUnload() {
    this.stopUserWatcher()
  },

  updateOnlineState(online) {
    return wx.cloud.callFunction({ name: 'login', data: {} }).then((res) => {
      var openid = res && res.result && res.result.openid
      if (!openid) throw new Error('login did not return openid')
      return wx.cloud.database().collection('users').where({ _openid: openid }).update({
        data: { online }
      })
    }).catch((err) => {
      console.warn('更新在线状态失败', err)
    })
  },

  refreshMessageBadge() {
    var message = Array.isArray(this.message) ? this.message : []
    var dzmessage = this.userInfo && Array.isArray(this.userInfo.dzmessage) ? this.userInfo.dzmessage : []
    var total = message.length + dzmessage.length
    if (total > 0) wx.setTabBarBadge({ index: 2, text: total.toString() })
    else wx.removeTabBarBadge({ index: 2 })
    this.hongdian = total > 0
    wx.setStorageSync('badgeCount', total)
    return total
  },

  setPendingPostTarget(target) {
    if (!target || !target.postId) return
    this.pendingPostTarget = Object.assign({}, target, { expiresAt: Date.now() + 30 * 60 * 1000 })
    wx.setStorageSync('pendingPostTarget', this.pendingPostTarget)
  },

  consumePendingPostTarget() {
    const target = this.pendingPostTarget || wx.getStorageSync('pendingPostTarget')
    this.pendingPostTarget = null
    wx.removeStorageSync('pendingPostTarget')
    return target && target.postId && target.expiresAt > Date.now() ? target : null
  },

  setUserWatcherListener(listener) {
    this.userWatcherListener = listener
    if (listener && this.userInfo && this.userInfo._id) listener(this.userInfo)
  },

  clearUserWatcherListener() {
    this.userWatcherListener = null
  },

  startUserWatcher(retryCount = 0) {
    var userId = this.userInfo && this.userInfo._id
    if (!userId || (this.userWatcher && this.userWatcherId === userId) || (this.userWatcherRetryTimer && this.userWatcherId === userId)) return
    if (retryCount > 3) return
    this.stopUserWatcher()
    this.userWatcherId = userId
    this.jianting = true
    var that = this
    this.userWatcher = wx.cloud.database().collection('users').doc(userId).watch({
      onChange(event) {
        var user = event.docs && event.docs[0]
        if (!user) return
        that.userInfo = user
        that.message = Array.isArray(user.message) ? user.message : []
        that.refreshMessageBadge()
        if (that.userWatcherListener) that.userWatcherListener(user)
      },
      onError(err) {
        console.error('用户消息监听出现问题！', err)
        that.userWatcher = null
        that.jianting = false
        if (that.userWatcherRetryTimer) return
        that.userWatcherRetryTimer = setTimeout(() => {
          that.userWatcherRetryTimer = null
          that.startUserWatcher(retryCount + 1)
        }, 5000)
      }
    })
  },

  stopUserWatcher() {
    if (this.userWatcherRetryTimer) clearTimeout(this.userWatcherRetryTimer)
    this.userWatcherRetryTimer = null
    if (this.userWatcher) this.userWatcher.close()
    this.userWatcher = null
    this.userWatcherId = ''
    this.jianting = false
  },

  checkUpdate: function () {
    var n = wx.getUpdateManager();
    n.onCheckForUpdate(function (t) {
      console.log("检查更新：", t)
      t.hasUpdate && (n.onUpdateReady(function () {
        wx.showModal({
          title: "更新提示",
          content: "新版本已经准备好，请重启应用",
          showCancel: !1,
          confirmColor: "#00cc11",
          success: function (t) {
            t.confirm && n.applyUpdate();
          }
        });
      }), n.onUpdateFailed(function (n) {
        wx.showModal({
          title: "已经有新版本了嗷",
          content: "自动更新失败，请重启试试~"
        });
      }));
    });
  },


})
