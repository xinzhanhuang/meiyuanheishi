// miniprogram/pages/wd/wd.js
const app = getApp()
const utils = require('../../../utils/util.js')
const { callCloudFunction } = require('../../../utils/cloud-call')
const userMethods = require('../../../utils/wd-user')
const userService = require('../../../services/user-service')

Page({
  ...userMethods,
  /**
   * 页面的初始数据
   */
  data: {
    userphoto1: "",
    username: "游客",
    anonymous: "",
    login: "未知",
    isVIP: false,
    wenzhang: [],
    message: [],
    dzmessage: [],
    message2: [],
    fenxiang: "",
    phone: "",
    zhuanye: "",
    LCU: false,
    isgl: false, // 是否是管理员
    messagenumber: 0,
    dzmessagenumber: 0, // 点赞消息数量
    adload: true
  },

  resumePendingPost() {
    const target = app.consumePendingPostTarget()
    if (!target) return false
    wx.navigateTo({ url: utils.getPostTargetUrl(target) })
    return true
  },

  /**
   * 检查是否管理员
   * @param {Object} e 
   */
  isgl(e) {
    var mine = false
    var myid = app.userInfo._id
    // 遍历管理员ID列表，检查当前用户是否在其中
    for (var ii = 0; ii < app.glids.length; ii++) {
      if (app.glids[ii] == myid) {
        mine = true
        break
      }
    }

    // 如果是管理员，更新状态
    if (mine == true) {
      this.setData({
        isgl: true
      })
    }
  },

  /**
   * 获取管理员ID列表
   */
  getgl() {
    if (app.system1 == "" || app.system1 == undefined) {
      // 从数据库获取系统配置
      userService.getAdminConfig().then((config) => {
          if (!config) return
          app.system1 = config
          this.setData({
            glids: config.system.glids
          })
          app.glids = config.system.glids
          this.isgl(config.system.glids)
        })
    } else {
      // 使用全局缓存的系统配置
      this.setData({
        glids: app.system1.system.glids
      })
      app.glids = app.system1.system.glids
      this.isgl(app.system1.system.glids)
    }
  },

  /**
   * 仅使用 OpenID 登录，头像、昵称和手机号均为可选资料。
   */
  async getather() {
    var ss_xxid = app.ss_xxid ? app.ss_xxid : 'nothing'
    console.log("携带参数ss_xxid:", ss_xxid)
    wx.showLoading({
      title: '登陆中',
    })

    try {
      const user = await app.ensureCurrentUser({ create: true, refresh: true })
      if (!user) throw new Error('login did not return user')
      this.applyUserState(user)
      this.bindUserWatcher()
      wx.hideLoading()
      wx.showToast({ title: '登录成功', icon: 'success' })

      if (this.resumePendingPost()) return
      if (ss_xxid !== 'nothing') {
        wx.navigateTo({ url: utils.getPostTargetUrl({ postId: ss_xxid, postType: 'ss', source: 'login' }) })
      }
    } catch (err) {
      console.error('登录或创建用户失败', err)
      wx.hideLoading()
      wx.showToast({ title: '登录失败，请稍后重试', icon: 'none' })
    }
  },



  /**
   * 未登录状态下的重试/自动登录
   */
  weidengluchongshi() {
    var ss_xxid = this.data.ss_xxid
    return app.ensureCurrentUser().then(user => {
      if (!user || !user.userinfo || user.userinfo.login !== true) {
        this.setData({ login: false })
        return
      }
      this.applyUserState(user)
      this.bindUserWatcher()
      this.getgl()
      this.checkred()
      this.logintime()
      if (this.resumePendingPost()) return
      if (app.fenxiang == "ture" || app.fenxiang == "true") {
        app.fenxiang = "false"
        wx.navigateTo({ url: utils.getPostTargetUrl({ postId: app.fxssid, postType: 'ss', source: 'login' }) })
      } else if (app.zhoubianfenxiang == "true" || app.zhoubianfenxiang == "ture") {
        app.zhoubianfenxiang = "false"
        wx.navigateTo({ url: utils.getPostTargetUrl({ postId: app.fxssid, postType: 'zhoubian', source: 'login' }) })
      } else if (ss_xxid) {
        wx.navigateTo({ url: utils.getPostTargetUrl({ postId: ss_xxid, postType: 'ss', source: 'login' }) })
      }
    }).catch(err => {
      this.setData({ login: false })
      console.error('用户会话恢复失败', err)
    })
  },

  /**
   * 查看我的头像
   */
  chakantouxiang() {
    var url = app.userInfo.userinfo.userphoto
    wx.previewImage({
      urls: [url],
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    var heishiweixin = app.heishiweixin
    this.setData({
      heishiweixin
    })

    this.onPullDownRefresh()
    this.weidengluchongshi()
  },

  /**
   * 开启消息监听
   * @param {String} _id 用户ID
   */
  jianting() {
    this.bindUserWatcher()
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    this.unbindUserWatcher()
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    this.unbindUserWatcher()
  },

  /**
   * 点击 tab 时触发
   */
  onTabItemTap(item) {
    wx.vibrateShort();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.applyUserState(app.userInfo)
    this.bindUserWatcher()
    this.checkred()
  },

  /**
   * 监听数据变化处理函数
   * @param {Array} e 消息数组
   */
  jiantingchuli(e) {
    if (!e || !Array.isArray(e)) {
      console.error('无效的消息数据');
      return;
    }

    this.checkred();

    // 计算总未读数量
    const message = app.message || [];
    const dzmessage = app.userInfo && app.userInfo.dzmessage || [];
    const weidu = message.length;
    const dzweidu = dzmessage.length;
    const totalWeidu = weidu + dzweidu;

    if (totalWeidu > 0) {
      // 更新底部导航栏红点
      const ceng = getCurrentPages();
      if (ceng.length == 1) {
        wx.setTabBarBadge({
          index: 2,
          text: totalWeidu.toString()
        });
        app.hongdian = true;
      }

      // 处理新消息（用于页面展示）
      const oldMessage = this.data.message2 || [];
      const newMessages = e.filter(msg => !oldMessage.some(m => m.id === msg.id));

      if (newMessages.length > 0) {
        this.setData({
          message2: [...oldMessage, ...newMessages]
        });
      }
    } else {
      // 消息数量为0时，强制移除红点
      const ceng = getCurrentPages();
      if (ceng.length == 1) {
        try {
          wx.removeTabBarBadge({ index: 2 });
          app.hongdian = false;
          console.log('jiantingchuli: 已移除红点，消息数量为0');
        } catch (e) {
          console.log('jiantingchuli: 移除红点时出错:', e);
          app.hongdian = false;
        }
      }
    }
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    if (!app.userInfo._id) {
      wx.stopPullDownRefresh();
      return;
    }
    this.refreshCurrentUser(true).then(() => this.checkred()).catch(err => {
      console.error('刷新用户信息失败', err)
      wx.showToast({ title: '刷新失败', icon: 'none' })
    }).finally(() => wx.stopPullDownRefresh())
  },

  /**
   * 刷新消息红点
   * 用于更新非tabar页面未设置的红点，以及更新页面内的数字显示
   */
  checkred() {
    // 确保使用最新的消息数据
    var message = app.message || (app.userInfo && app.userInfo.message) || [];
    var dzmessage = app.userInfo && app.userInfo.dzmessage || []; // 获取点赞消息

    var weidu = Array.isArray(message) ? message.length : 0;
    var dzweidu = Array.isArray(dzmessage) ? dzmessage.length : 0; // 点赞消息数量
    var totalWeidu = weidu + dzweidu; // 总未读数量

    console.log('checkred检查消息数量:', weidu, '点赞数量:', dzweidu, '总未读:', totalWeidu);

    if (app.userInfo && app.userInfo.userinfo) {
      var LCU = app.userInfo.userinfo.LCU == true;
      this.setData({
        userphoto: app.userInfo.userinfo.userphoto,
        username: app.userInfo.userinfo.username,
        anonymous: app.userInfo.userinfo.anonymous,
        isVIP: app.userInfo.userinfo.isVIP,
        login: app.userInfo.userinfo.login,
        wenzhang: app.userInfo.wenzhang,
        zhuanye: app.zhuanye,
        gender: app.userInfo.userinfo.gender,
        LCU: LCU
      })
    }

    // 更新页面数据
    this.setData({
      messagenumber: weidu > 0 ? weidu.toString() : 0,
      dzmessagenumber: dzweidu > 0 ? dzweidu.toString() : 0
    })

    if (totalWeidu != 0) {
      // 有未读消息，设置底部导航栏红点
      wx.setTabBarBadge({
        index: 2,
        text: totalWeidu.toString()
      })
      app.hongdian = true
    } else {
      // 没有未读消息时，强制移除红点
      try {
        wx.removeTabBarBadge({ index: 2 })
        app.hongdian = false
        console.log('checkred: 已移除红点，消息数量为0')
      } catch (e) {
        console.log('checkred: 移除红点时出错（可能红点不存在）:', e)
        app.hongdian = false
      }
    }
  },

  /**
   * 上传此次登陆的时间
   */
  logintime() {
    var now = new Date().getTime()
    if (app.userInfo._id) {
      return callCloudFunction('login', { action: 'setLoginTime', logintime: now })
    }
  },

  /**
   * 广告加载失败处理
   */
  adError() {
    this.setData({
      adload: false
    })
  },
})
