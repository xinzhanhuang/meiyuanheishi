//app.js
const app = getApp()
const { getCloudEnvId } = require('./config/cloud-env')
const { callCloudFunction } = require('./utils/cloud-call')
const { DEFAULT_SCHOOL_ID, SCHOOLS, getSchools, getSchool } = require('./config/schools')
const { loadSchoolCatalog } = require('./services/school-service')
App({
  onLaunch: function () {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        env: getCloudEnvId(),
        traceUser: true,
      })
    }
    this.kbs = {
      cookies: "",
      money: "0.00"
    }
    this.system1 = ""
    this.hongdian = false//标记当前tabar上是否有红点、文本
    this.myTabIndex = 1
    this.currentSchool = getSchool(wx.getStorageSync('currentSchoolId') || DEFAULT_SCHOOL_ID)
    this.currentSchoolId = this.currentSchool.id
    this.schools = getSchools()
    this.schoolConfigReady = false
    this.refreshSchoolConfig()
    this.shuaxin = false
    this.fenxiang = "false"
    this.fxssid = ""
    this.pendingPostTarget = null
    this.userWatcherUnavailable = false
    this.userWatcherListeners = new Set()
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
    return callCloudFunction('login', { action: 'setOnline', online }).catch((err) => {
      console.warn('更新在线状态失败', err)
    })
  },

  refreshMessageBadge() {
    var message = Array.isArray(this.message) ? this.message : []
    var dzmessage = this.userInfo && Array.isArray(this.userInfo.dzmessage) ? this.userInfo.dzmessage : []
    var total = message.length + dzmessage.length
    if (total > 0) wx.setTabBarBadge({ index: this.myTabIndex, text: total.toString() })
    else wx.removeTabBarBadge({ index: this.myTabIndex })
    this.hongdian = total > 0
    wx.setStorageSync('badgeCount', total)
    return total
  },

  getCurrentSchoolId() {
    return this.currentSchoolId || DEFAULT_SCHOOL_ID
  },

  refreshSchoolConfig() {
    if (this.schoolConfigPromise) return this.schoolConfigPromise
    this.schoolConfigPromise = loadSchoolCatalog().then(result => {
      this.schools = result.schools
      this.setCurrentSchoolId(wx.getStorageSync('currentSchoolId') || DEFAULT_SCHOOL_ID)
      this.schoolConfigReady = true
      return result
    }).catch(error => {
      console.warn('学校配置加载失败，继续使用本地默认配置', error)
      this.schools = SCHOOLS
      this.setCurrentSchoolId(DEFAULT_SCHOOL_ID)
      this.schoolConfigReady = true
      return { schools: this.schools, currentSchoolId: DEFAULT_SCHOOL_ID, source: 'local', reason: 'app-refresh-failed', error }
    }).finally(() => { this.schoolConfigPromise = null })
    return this.schoolConfigPromise
  },

  setCurrentSchoolId(schoolId) {
    this.currentSchool = getSchool(schoolId)
    this.currentSchoolId = this.currentSchool.id
    wx.setStorageSync('currentSchoolId', this.currentSchoolId)
    return this.currentSchool
  },

  applyCurrentUser(user) {
    if (!user) return null
    var defaults = this.userInfo || {}
    this.userInfo = Object.assign({}, defaults, user, {
      userinfo: Object.assign({}, defaults.userinfo || {}, user.userinfo || {})
    })
    this.message = Array.isArray(this.userInfo.message) ? this.userInfo.message : []
    this.refreshMessageBadge()
    return this.userInfo
  },

  ensureCurrentUser(options = {}) {
    var userService = require('./services/user-service')
    if (this.userSessionPromise) return this.userSessionPromise
    var create = options.create === true
    var refresh = options.refresh === true
    if (!refresh && this.userInfo && this.userInfo._id && this.userInfo.userinfo && this.userInfo.userinfo.login === true) {
      this.startUserWatcher()
      return Promise.resolve(this.userInfo)
    }
    var request
    if (create) request = userService.ensureUser()
    else if (refresh && this.userInfo && this.userInfo._id) request = userService.getById(this.userInfo._id)
    else request = userService.getOpenId().then(openid => userService.getByOpenId(openid))
    this.userSessionPromise = request.then(user => {
      if (!user) return null
      this.applyCurrentUser(user)
      this.startUserWatcher()
      return this.userInfo
    }).finally(() => { this.userSessionPromise = null })
    return this.userSessionPromise
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

  subscribeUserWatcher(listener) {
    if (typeof listener !== 'function') return () => {}
    this.userWatcherListeners.add(listener)
    if (this.userInfo && this.userInfo._id) listener(this.userInfo)
    return () => this.userWatcherListeners.delete(listener)
  },

  startUserWatcher(retryCount = 0) {
    var userId = this.userInfo && this.userInfo._id
    if (!userId || (this.userWatcher && this.userWatcherId === userId) || (this.userWatcherRetryTimer && this.userWatcherId === userId)) return
    if (retryCount > 3) return
    this.stopUserWatcher()
    this.userWatcherId = userId
    this.jianting = true
    this.userWatcherUnavailable = false
    var that = this
    this.userWatcher = wx.cloud.database().collection('users').doc(userId).watch({
      onChange(event) {
        var user = event.docs && event.docs[0]
        if (!user) return
        that.applyCurrentUser(user)
        that.userWatcherListeners.forEach(listener => listener(that.userInfo))
      },
      onError(err) {
        console.error('用户消息监听出现问题！', err)
        that.userWatcher = null
        that.jianting = false
        if (that.userWatcherRetryTimer) return
        if (retryCount >= 3) {
          that.userWatcherUnavailable = true
          console.warn('用户消息实时监听已降级，等待下次进入前台重试')
          return
        }
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
