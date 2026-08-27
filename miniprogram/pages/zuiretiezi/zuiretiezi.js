const app = getApp()
const db = wx.cloud.database()
const _ = db.command

Page({
  //页面的初始数据！！！！！！！！！！！！！！
  data: {
    showList: false,
    loadingHidden: false,
    ss_xx: [],
    ss_xx1: [],
    _ss_xx: [],
    lunbotu: [],
    yincang: true,
    shuaxin: "",
    search: "",
    jianting: false,
    zuixinorzuire: 0,
    movehight: 500,
    movehight2: 500,
    message: [],
    index: -1,
    yizhou: "",
    scwidth: 0,
    kong: false,
    jiazaizhong: false,
    option11111: ["A", "B", "C", "D", "E"],


    indicatorDots: true, // 是否显示指示点
    autoplay: true, // 是否自动切换
    interval: 1000, // 自动切换时间间隔
    duration: 100, // 滑动动画时长

  },

  toMsgDetail(e) {
    wx.navigateTo({
      url: '',
    })
  },




  //生命周期函数--监听页面加载！！！！！！！！！！！！！！
  onLoad: function (options) {
    var choosetitle1 = options.choosetitle1
    let logined = app.userInfo.userinfo.login;
    var fenxiang = options.fenxiang
    //console.log(app.userInfo);


    // 使用 sort 方法和 Math.random 打乱数组顺序
    if (options.fenxiang = 'true' && options.bannerList2) {


      var bannerList2 = JSON.parse(decodeURIComponent(options.bannerList2))

    } else {


      var bannerList1 = app.bannerList2
      if (bannerList1) {
        var bannerList2 = bannerList1.sort(() => Math.random() - 0.5);
      } else {
        var bannerList2 = false

      }

    }
    console.log("hdhdhdhdhddhhd", bannerList2)

    this.setData({
      bannerList2,
      fenxiang,
      choosetitle1
    })

    app.fenxiang = "false"
    var systeminfo = wx.getWindowInfo()

    if (logined != true) {
      wx.cloud.callFunction({
        name: 'login',
        data: {}
      }).then((res) => {
        //console.log("获取到openid:",res.result.openid);
        db.collection("users").where({
          _openid: res.result.openid
        }).get().then((res) => {
          //console.log("首页登录取到的对应openid的信息：",res.data[0]);
          app.userInfo = Object.assign(app.userInfo, res.data[0]);

          this.jiazai()
          wx.hideLoading()
          if (app.userInfo._openid == "") {
          } else {
            //登录上了就监听user
            console.log("已经登录，开启监听user")
            var _id = app.userInfo._id
            var that = this
            app.startUserWatcher()
          }
        })
      });
    } else {

      //登录上了就监听user
      if (!app.jianting) {
        //开启监听
        app.jianting = true
      }
    }


    this.jiazai()
    this.setData({
      movehight: systeminfo.windowHeight,
      movehight2: systeminfo.windowHeight - 80
    })
    setTimeout(() => {
      this.setData({
        showList: true,
        loadingHidden: true,
      });
    }, 1500);


  },







  //刷新！！！！！！！！！！！！！！
  shuaxin() {
    this.setData({
      shuaxin: "",
      search: "",
      kong: false,
      ss_xx: []
    })
    var shuaxin = true
    this.jiazai(shuaxin)
  },



  //生命周期函数--监听页面显示！！！！！！！！！！！！！！
  onShow: function () {

    //这是发帖成功，跳转刷新
    var shuaxin = app.shuaxin
    if (shuaxin) {
      this.shuaxin()
      app.shuaxin = false
    }


    //点赞页面返回更新点赞评论浏览状态
    var index = this.data.index
    var ss_xx = this.data.ss_xx
    var reping = app.ssinfo.reping
    //console.log("index::::",index)
    if (index >= 0 && reping == 4444) {
      ss_xx[index].ss_xx.look = app.ssinfo.looknb
      var loveinfo = app.loveinfo
      //console.log("app.loveinfo:",loveinfo)
      if (loveinfo == 'true') {
        console.log("返回点赞：", index)
        ss_xx[index].love = true
        app.loveinfo = ""
      } else if (loveinfo == 'false') {
        console.log("返回取消点赞：", index)
        ss_xx[index].love = false
        app.loveinfo = ""
      }
      ss_xx[index].ss_xx.huifunb = app.ssinfo.plnb
      ss_xx[index].ss_xx.dianzannb = app.ssinfo.lovenb
      this.setData({
        ss_xx: ss_xx,
        index: -1
      })
    }
  },






  //生命周期函数--监听页面隐藏
  onHide: function () { },

  //生命周期函数--监听页面卸载
  onUnload: function () { },

  //用户点击右上角分享
  onShareAppMessage: function () {
    var zuiress_xx1 = false
    return {
      title: "天美热榜真是绝了！",
      path: "/pages/zuiretiezi/zuiretiezi?zuiress_xx1=" + zuiress_xx1 + "&fenxiang=ture&DONOT=111"
    }
  },


  onShareTimeline: function () {
    var zuiress_xx1 = false
    return {
      title: "天美热榜真是绝了！",
      path: "/pages/zuiretiezi/zuiretiezi?zuiress_xx1=" + zuiress_xx1 + "&fenxiang=ture&DONOT=111"
    }
  },


  //页面上拉触底事件的处理函数！！！！！！！！！！！！！！
  onReachBottom: function () {
    if (this.data.jiazaizhong == false) {
      this.setData({
        jiazaizhong: true
      })
      this.jiazai()
    }
  },




  //加载数据(刷新状态下，data内ss_xx数组重新赋值)！！！！！！！！！！！！！！
  jiazai(shuaxin) {


    var zuixinorzuire = this.data.zuixinorzuire
    var now = new Date().getTime()//现在的时间
    if (zuixinorzuire == 0) {
      // Week: 7 days
      var yizhou = (now - 7 * 24 * 3600 * 1000)
      console.log("title: Week")
    } else if (zuixinorzuire == 1) {
      // Month: 30 days
      var yizhou = (now - 30 * 24 * 3600 * 1000)
      console.log("title: Month")
    } else {
      // History: 10 years (effectively all time)
      var yizhou = (now - 10 * 365 * 24 * 3600 * 1000)
      console.log("title: History")
    }


    this.setData({
      yizhou: yizhou
    })


    //console.log(shuaxin)
    var shuaxin2 = this.data.shuaxin
    shuaxin = shuaxin2 == "" ? shuaxin : shuaxin2
    //console.log(shuaxin2)
    if (shuaxin == true) {
      var head = 0
      console.log("toushi0")
    } else {
      var head = this.data.ss_xx.length
      console.log("toushih", head)
    }


    /////////////////////




    if (zuixinorzuire == 0) {
      // Week
      zuixinorzuire = "ss_xx.huifunb"
      var limit = 20
      var yizhou = this.data.yizhou
      var openlocationtitle = db.command.eq("")
      var query = {
        'ss_xx.jubao.1': db.command.lte(19),
        "ss_xx.orderdetail.openlocationtitle": openlocationtitle
      };
      query['time'] = db.command.gt(yizhou);
    } else if (zuixinorzuire == 1) {
      // Month
      zuixinorzuire = "ss_xx.huifunb"
      var limit = 20
      var yizhou = this.data.yizhou
      var openlocationtitle = db.command.eq("")
      var query = {
        'ss_xx.jubao.1': db.command.lte(19),
        "ss_xx.orderdetail.openlocationtitle": openlocationtitle
      };
      query['time'] = db.command.gt(yizhou);
    } else {
      // History
      zuixinorzuire = "ss_xx.huifunb"
      var limit = 5
      var yizhou = this.data.yizhou
      var openlocationtitle = db.command.eq("")
      var query = {
        'ss_xx.jubao.1': db.command.lte(19),
        "ss_xx.orderdetail.openlocationtitle": openlocationtitle
      };
      query['ss_xx.huifunb'] = db.command.gt(20);
    }
    /////////////////
    if (this.data.ss_xx1.length < 1) {
      db.collection('ss').limit(5).where({
        'ss_xx.jubao.1': db.command.lte(19),
        'time': db.command.gt(yizhou),
        "ss_xx.orderdetail.openlocationtitle": openlocationtitle
      }).orderBy('ss_xx.dianzannb', 'desc')
        .field({
          _id: true,
          _openid: true,
          love: true,
          'ss_xx.nr': true,
          'ss_xx.tp': true,
          'ss_xx.look': true,
          'ss_xx.orderdetail.openlocationtitle': true
        })
        .skip(0).get().then(async (res) => {
          console.log(res.data)
          var ss_xx1 = res.data
          this.setData({

            ss_xx1: ss_xx1,

          })

        })
    }


    ///////////////////


    db.collection('ss').where(
      query

    ).limit(limit).orderBy(zuixinorzuire, 'desc')
      .field({
        _id: true,
        _openid: true,
        love: true,
        'ss_xx.nr': true,
        'ss_xx.tp': true,
        'ss_xx.look': true,
        'ss_xx.dianzannb': true,
        'ss_xx.huifunb': true,
        'ss_xx.huifunr': true,
        'ss_xx.userphoto': true,
        'ss_xx.username': true,
        'ss_xx.gender': true,
        'ss_xx.niming1': true,
        'ss_xx.isover': true,
        'ss_xx.zhuanye': true,
        'ss_xx.orderdetail': true,
        'ss_xx.tuswiper': true,
        'ss_xx.choosetitle': true,
        'ss_xx.tp2': true,
        'ss_xx.firsttime': true,
        'ss_xx.dianzanid': true,
        'voteOption': true
      })
      .skip(head).get().then(async (res) => {
        console.log(res.data)




        //这里已经取到了相应的数组
        if (res.data == "") {
          this.setData({
            kong: true,
            jiazaizhong: false
          })
          wx.stopPullDownRefresh({})


          return
        } else if (shuaxin == true) {
          //真刷新状态
          //var ss_xx=res.data
          //var ss_xx=await this.read(res.data)
          var ss_xx = await this.love(res.data)
          console.log("😄1", ss_xx)
        } else {
          //加载并加入
          var ss_xx = this.data.ss_xx
          // console.log("😄2",ss_xx)
          //var xx=await this.read(res.data)
          var xx = await this.love(res.data)
          var postStartIndex = ss_xx.length
          ss_xx.push.apply(ss_xx, xx)
        }
        if (shuaxin == true) var postStartIndex = 0

        ///////循环评论

        for (var i = postStartIndex; i < ss_xx.length; i++) {
          if (ss_xx[i] && ss_xx[i].ss_xx && ss_xx[i].ss_xx.huifunr) {
            var plxx = ss_xx[i].ss_xx.huifunr
            plxx.sort(function (a, b) {
              return b.pldianzannb - a.pldianzannb
            });
            // plxx.forEach(function (item) { }) // Removed empty loop
            // ss_xx[i].ss_xx.huifunr.push.apply(plxx) // REMOVED: This was duplicating comments!
          }
        }


        //写进本地
        this.setData({

          ss_xx: ss_xx,
          kong: true,
          jiazaizhong: false
        })
        wx.hideLoading({})
        if (shuaxin == true) {
          //this.goTop()
          //wx.hideLoading({})
          wx.stopPullDownRefresh({})
          wx.showToast({
            title: '刷新成功',
            icon: 'none',
            duration: 800
          })

        } else {
          //wx.hideLoading({})
        }
      })
  },



  //跳转传参，传递板块名！！！！！！！！！！！！！！
  tiaozhuan(e) {
    //console.log(bankuai.currentTarget.dataset.ku)
    var choosetitle = (e.detail && e.detail.choosetitle) ? e.detail.choosetitle : e.currentTarget.dataset.choosetitle
    var choosetitle1 = this.data.choosetitle1
    console.log("ccccvvvvvvv", choosetitle)
    wx.navigateTo({
      url: "../plate1/plate1?choosetitle=" + choosetitle + "&choosetitle1=" + choosetitle1
    })
  },



  //点击跳到详情！！！！！！！！！！！！！！
  xiangqing(e) {
    var id, lzid, openid, love, index, reping;
    if (e.detail && e.detail.item) {
      id = e.detail.item._id;
      lzid = e.detail.item.ss_xx.lzid;
      openid = e.detail.item._openid;
      love = e.detail.item.love;
      index = e.detail.index;
      reping = "2222";
    } else {
      id = e.currentTarget.dataset.id
      lzid = e.currentTarget.dataset.lzid
      openid = e.currentTarget.dataset.openid
      love = e.currentTarget.dataset.love
      index = e.currentTarget.dataset.index
      reping = e.currentTarget.dataset.reping
    }
    if (this.data.fenxiang = true) {
      var choosetitle1 = false
      var zuiress_xx1 = false
      var DONOT = '111'
    } else {
      var choosetitle1 = this.data.choosetitle1
      var zuiress_xx1 = JSON.stringify(app.zuiress_xx1)
      var DONOT = '000'
    }

    console.log("index:", index)
    wx.cloud.callFunction({
      name: "look",
      data: {
        id: id,
        type: 'ss',
        num: 1
      }
    })

    if (love) {
      love = 'true'
    } else {
      love = 'false'
    }
    wx.navigateTo({
      url: "../plate2/plate2?id=" + id + "&fenxiang=false&liuyan=false&love=" + love + "&reping=" + reping + "&openid=" + openid + "&lzid=" + lzid + "&choosetitle1=" + choosetitle1 + "&zuiress_xx1=" + encodeURIComponent(zuiress_xx1) + "&DONOT=" + DONOT,
    })
    this.setData({
      index: index
    })
  },


  //去轮播图详情页
  toBannerDetail(e) {

    var type = e.currentTarget.dataset.type
    var Appid1 = e.currentTarget.dataset.appid
    var Appid = encodeURIComponent(Appid1)
    var title1 = e.currentTarget.dataset.title

    // console.log('sssssss',title)

    if (type == 0) {

      wx.navigateToMiniProgram({
        appId: Appid,
        path: title1,
        extraData: {
          envVersion: 'release', // 设置为体验版
          targetOptions: {
            halfScreen: false // 设置为半屏展示
          }
        },
        success(res) {
          // 跳转成功的逻辑
        },
        fail(err) {
          // 跳转失败的逻辑
        }
      });


    } else {
      var title = encodeURIComponent(title1)
      wx.navigateTo({
        url: '/pages/bannerDetail/bannerDetail?title=' + title + "&type=" + type,
      })

    }



  },


  //返回组件Tabs的监听
  changetitle(e) {


    var value = e.currentTarget.dataset.value
    var zuixinorzuire = this.data.zuixinorzuire
    if (value != zuixinorzuire) {
      console.log("Switching to:", value)
      this.setData({
        zuixinorzuire: value,
        ss_xx: [],
        // ss_xx1: [], // Keep top list, do not refresh
        kong: false
      }, () => {
        // Call jiazai after setData callback to ensure view is updated
        this.jiazai()
      })
    }
  },



  // 预览图片
  previewImg: function (e) {
    //获取当前图片的下标
    var index1 = e.currentTarget.dataset.index1
    var index = e.currentTarget.dataset.tp[1];
    //所有图片
    var imgs = e.currentTarget.dataset.tp[1];

    console.log(index1)
    wx.previewImage({
      //当前显示图片
      current: index[index1],
      //所有图片
      urls: imgs
    })
  },



  //下拉动作-刷新
  onPullDownRefresh: function () {
    this.shuaxin()
    //setTimeout(function (){wx.stopPullDownRefresh({})},'2000')
  },

  //处理点赞数据

  async love(e) {
    //console.log(e)
    var l = e.length
    for (var i = 0; i < l; i++) {
      var yn = e[i].ss_xx.dianzanid.indexOf(app.userInfo._id)
      //console.log(yn)
      if (yn == -1) {
        e[i].love = false
      } else {
        e[i].love = true
      }
    }
    return e
  },

  //点赞帖子(这里得加index)
  dianzan(e) {
    var _id = app.userInfo._id
    var id, index;
    if (e.detail && e.detail.item) {
      id = e.detail.item._id;
      index = e.detail.index;
    } else {
      id = e.currentTarget.dataset.id
      index = e.currentTarget.dataset.index
    }

    console.log(e.currentTarget.dataset)

    var obj = wx.getLaunchOptionsSync()
    console.log('启动小程序的路径:', obj.path)
    console.log('启动小程序的场景值:', obj.scene)
    console.log('启动小程序的 query 参数:', obj.query)
    console.log('来源信息:', obj.shareTicket)
    console.log('来源信息参数appId:', obj.referrerInfo.appId)
    console.log('来源信息传过来的数据:', obj.referrerInfo.extraData)

    if (obj.scene == 1154) {
      wx.showToast({
        title: '前往小程序👇',
        icon: 'none',
        duration: 2000,
      })
      return
    }

    if (app.userInfo.userinfo.login != true) {
      wx.showModal({
        title: '提示',
        content: '登录后才可进行此操作！是否进行授权登录？',
        showCancel: true,
        confirmText: '是',
        confirmColor: '#000000',
        cancelText: '否',
        cancelColor: '#FF4D49',
        success(res) {
          if (res.confirm) {
            console.log('用户点击确定')
            wx.switchTab({ url: "../my/wd/wd" })
            return
          } else if (res.cancel) {
            console.log('用户点击取消')
            return
          }
        }
      })
      return
    }

    // Get notification data
    var time = new Date().getTime()
    var name = app.userInfo.userinfo.username
    var photo = app.userInfo.userinfo.userphoto
    var lzid = this.data.ss_xx[index]._openid
    var ywnr = this.data.ss_xx[index].ss_xx.nr

    wx.cloud.callFunction({
      name: "dianzan",
      data: {
        id: id,
        dzrid: _id,
        type: 'ss',
        name: name,
        photo: photo,
        time: time,
        lzid: lzid,
        ywnr: ywnr
      }
    })
    var ss_xx = this.data.ss_xx
    if (this.data.ss_xx[index].love) {
      ss_xx[index].love = false
      ss_xx[index].ss_xx.dianzannb--
    } else {
      ss_xx[index].love = true
      ss_xx[index].ss_xx.dianzannb++
    }
    this.setData({
      ss_xx: ss_xx
    })
  },




  //图片预加载zhi ss图预加载
  imageOnLoad2(e) {
    //console.log("一次")
    var index0 = (e.detail && e.detail.index0 !== undefined) ? e.detail.index0 : e.currentTarget.dataset.index0;
    var index1 = (e.detail && e.detail.index1 !== undefined) ? e.detail.index1 : e.currentTarget.dataset.index1;
    //console.log("打印id",id)
    var xx = 'ss_xx[' + index0 + '].ss_xx.tp2[' + index1 + '].loaded'
    this.setData({
      [xx]: true
    })
  },
  //图片预加载失败
  imageOnLoadError(e) {
    console.log("预加载失败：", e)
  },
  //上传此次登陆的时间
  logintime() {
    var now = new Date().getTime()
    console.log(app.userInfo._id)
    db.collection('users').doc(app.userInfo._id).update({
      data: {
        logintime: now
      }
    })
  },




  //回到首页////
  blackindex() {

    wx.switchTab({

      url: '/pages/index/index'

    });
  },

  guanlifengtiezi(e) {
    console.log('guanlifengtiezi longpress', e);
  },

  mazhu(e) {
    console.log('mazhu tap', e);
  },


})
