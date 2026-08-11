// miniprogram/pages/wd/wd.js
const app = getApp()
const db = wx.cloud.database()

Page({
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
      db.collection('system').where({ '_id': 'system01' })
        .get().then((res) => {
          app.system1 = res.data[0]
          this.setData({
            glids: res.data[0].system.glids
          })
          app.glids = res.data[0].system.glids
          this.isgl(res.data[0].system.glids)
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
   * 获取用户头像及认证信息（登录）
   */
  getather() {
    var ss_xxid = app.ss_xxid ? app.ss_xxid : 'nothing'
    console.log("携带参数ss_xxid:", ss_xxid)
    wx.showLoading({
      title: '登陆中',
    })
    wx.getUserProfile({
      desc: '用于获取头像与昵称', // 声明获取用户个人信息后的用途
      success: (a) => {
        let userInfo = a.userInfo;
        if (userInfo) {
          wx.showLoading({
            title: '登陆中',
          })
          // 创建新用户记录
          db.collection('users').add({
            data: {
              logintime: new Date().getTime(),
              ban: false,
              msgnb: [0, 0],
              allow: true,
              online: true,
              wenzhang: [],
              message: [],
              dzmessage: [],
              pinglunguode: [],
              weiguinb: 0,
              phone: this.data.phone,
              userinfo: {
                userphoto: userInfo.avatarUrl,
                username: userInfo.nickName,
                gender: userInfo.gender,
                anonymous: "",
                zhuanye: "",
                isVIP: false,
                login: true,
                LCU: false
              },
            }
          }).then((res) => {
            // 登录成功后开启监听
            this.jianting(res._id)
            app.jianting = true
            app.userInfo._id = res._id // 修正: res.id -> res._id

            // 获取完整的用户信息
            db.collection('users').doc(res._id).get().then((res) => {
              app.userInfo = Object.assign(app.userInfo, res.data);
              console.log("登录成功，用户信息:", res.data);
              wx.hideLoading()

              // 更新页面数据
              this.setData({
                userphoto: app.userInfo.userinfo.userphoto,
                username: app.userInfo.userinfo.username,
                anonymous: app.userInfo.userinfo.anonymous,
                isVIP: app.userInfo.userinfo.isVIP,
                login: true,
                wenzhang: app.userInfo.wenzhang,
                message: app.userInfo.message,
                gender: app.userInfo.userinfo.gender,
              })

              // 跳转到设置页面
              wx.navigateTo({
                url: '/pages/my/set/set?ss_xxid=' + ss_xxid,
              })
            })
          })
        }
      },
      fail: res => {
        console.log("获取用户信息失败", res)
      }
    })
  },



  /**
   * 未登录状态下的重试/自动登录
   */
  weidengluchongshi() {
    var ss_xxid = this.data.ss_xxid
    let logined = app.userInfo.userinfo.login;

    if (logined != true) {
      /* 若不是登录状态，调用云函数尝试静默登录 */
      wx.showLoading({
        title: '尝试登录',
      })
      wx.cloud.callFunction({
        name: 'login',
        data: {}
      }).then((res) => {
        // 根据openid查询用户
        db.collection("users").where({ _openid: res.result.openid }).get().then((res) => {
          if (res.data.length > 0) {
            app.userInfo = Object.assign(app.userInfo, res.data[0]);
            wx.hideLoading()

            if (app.userInfo.userinfo.login == true) {
              if (!app.jianting) {
                // 开启监听
                this.jianting(app.userInfo._id)
                app.jianting = true
              }

              /* 加载用户信息和配置 */
              this.getgl()
              this.checkred() // 刷新红点

              this.setData({
                userphoto: app.userInfo.userinfo.userphoto,
                gender: app.userInfo.userinfo.gender,
                username: app.userInfo.userinfo.username,
                anonymous: app.userInfo.userinfo.anonymous,
                isVIP: app.userInfo.userinfo.isVIP,
                login: app.userInfo.userinfo.login,
                wenzhang: app.userInfo.wenzhang,
                message: app.userInfo.message,
                zhuanye: app.zhuanye
              })

              this.logintime() // 更新登录时间

              // 处理分享跳转
              if (app.fenxiang == "ture") {
                app.fenxiang = "false"
                wx.navigateTo({
                  url: "/pages/plate2/plate2?id=" + app.fxssid + "&fenxiang=false"
                })
              }
              if (app.zhoubianfenxiang == "true") {
                app.zhoubianfenxiang = "false"
                wx.navigateTo({
                  url: "/pages/plate-zhoubian/plate-zhoubian?id=" + app.fxssid + "&zhoubianfenxiang=false"
                })
              }
              if (ss_xxid) {
                wx.navigateTo({
                  url: "/pages/plate2/plate2?id=" + ss_xxid
                })
              }
            } else {
              // 登录状态为false
              this.setData({
                login: false
              })
              app.userInfo.userinfo = Object.assign(app.userInfo.userinfo, { login: false })
              wx.showToast({
                title: '还未授权登录',
                icon: 'none',
                duration: 2000,
              })
            }
          } else {
            // 未找到用户
            wx.hideLoading();
            this.setData({ login: false });
          }
        })
      }).catch(err => {
        wx.hideLoading();
        console.error("云函数登录失败", err);
      });
    } else {
      // 已登录状态
      if (!app.jianting) {
        // 开启监听
        this.jianting(app.userInfo._id)
        app.jianting = true
      }
      this.getgl()
      this.checkred() // 刷新红点

      if (app.fenxiang == "ture") {
        app.fenxiang = "false"
        wx.navigateTo({
          url: "/pages/plate2/plate2?id=" + app.fxssid + "&fenxiang=false"
        })
      }
    }
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
  jianting(_id) {
    // 先关闭已存在的监听器
    if (this.watcher) {
      this.watcher.close();
    }

    if (!_id) {
      console.error('用户ID不存在，无法开启监听');
      return;
    }

    var that = this;
    app.jianting = true;

    try {
      this.watcher = db.collection('users').doc(_id).watch({
        onChange: function (e) {
          var user = e.docs && e.docs[0];
          if (!user) return;

          console.log('监听user数据变化：', user);
          app.userInfo = user;
          var message = user.message || [];
          app.message = message;
          that.jiantingchuli(message);
        },
        onError: function (err) {
          console.error('监听出现问题！', err);
          // 监听出错时尝试重新初始化
          that.watcherRetryTimer = setTimeout(() => {
            that.watcherRetryTimer = null;
            if (app.userInfo._id) {
              that.jianting(app.userInfo._id);
            }
          }, 3000);
        }
      });
    } catch (err) {
      console.error('初始化监听器失败:', err);
    }
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    if (this.watcherRetryTimer) {
      clearTimeout(this.watcherRetryTimer);
      this.watcherRetryTimer = null;
    }
    if (this.watcher) {
      this.watcher.close();
      this.watcher = null;
    }
    app.jianting = false;
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    if (this.watcherRetryTimer) {
      clearTimeout(this.watcherRetryTimer);
      this.watcherRetryTimer = null;
    }
    if (this.watcher) {
      this.watcher.close();
      this.watcher = null;
    }
    app.jianting = false;
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
    // 重新从数据库获取最新消息数据，确保红点状态正确
    if (app.userInfo._id && app.userInfo.userinfo && app.userInfo.userinfo.login) {
      var that = this;
      db.collection('users').doc(app.userInfo._id).get().then((res) => {
        if (res.data) {
          // 无论message是否存在，都要更新（包括空数组的情况）
          var message = res.data.message || [];
          var dzmessage = res.data.dzmessage || []; // 获取点赞消息

          // 更新app.userInfo的完整数据
          app.userInfo = res.data;
          // 确保app.message和app.userInfo.message一致
          app.message = message;
          app.userInfo.message = message;
          app.userInfo.dzmessage = dzmessage; // 更新点赞消息

          // 更新本地数据
          that.setData({
            message: message,
            dzmessage: dzmessage
          });
          console.log('onShow获取到的消息数量:', message.length, '点赞数量:', dzmessage.length);
        }
        // 检查并更新红点状态
        that.checkred();
      }).catch((err) => {
        console.error('获取消息数据失败:', err);
        // 即使获取失败，也尝试检查红点
        that.checkred();
      });
    } else {
      this.checkred();
    }

    // 如果用户已登录且没有活跃的监听器，则重新初始化
    if (app.userInfo._id && !app.jianting) {
      this.jianting(app.userInfo._id);
    }
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
    var _id = app.userInfo._id
    if (!_id) {
      wx.stopPullDownRefresh();
      return;
    }

    db.collection('users').doc(_id).get().then((res) => {
      console.log("下拉刷新获取信息", res.data)
      this.setData({
        userphoto: res.data.userinfo.userphoto,
        username: res.data.userinfo.username,
        anonymous: res.data.userinfo.anonymous,
        isVIP: res.data.userinfo.isVIP,
        login: res.data.userinfo.login,
        wenzhang: res.data.wenzhang,
        message: res.data.message,
        zhuanye: res.data.userinfo.zhuanye,
        gender: res.data.userinfo.gender
      })

      app.userInfo = res.data
      app.zhuanye = res.data.userinfo.zhuanye

      wx.stopPullDownRefresh({})
      this.checkred()
      wx.showToast({
        title: '刷新成功',
        icon: 'none',
        duration: 800
      })
    })
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
      db.collection('users').doc(app.userInfo._id).update({
        data: {
          logintime: now
        }
      })
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
