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
    wx.cloud.callFunction({
      name: 'login',
      data: {}
    }).then((res) => {
      var openid = res.result.openid
      this.checkUpdate()
      var db = wx.cloud.database()
      db.collection('users').where({ _openid: openid }).update({
        data: {
          online: true
        }
      })
    });


  },

  //不在小程序中就下线
  onHide() {

    wx.cloud.callFunction({
      name: 'login',
      data: {}
    }).then((res) => {

      var openid = res.result.openid

      var db = wx.cloud.database()

      // if(this._id!=""){
      console.log("下线")
      db.collection('users').where({ _openid: openid }).update({
        data: {
          online: false
        }
      })
      // }
    })
  },

  onReady() {
  },

  onUnload() {
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
