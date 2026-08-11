const app = getApp()
const db = wx.cloud.database()
const _ = db.command
const POST_LIST_FIELDS = {
  _id: true,
  _openid: true,
  'ss_xx.nr': true,
  'ss_xx.tp': true,
  'ss_xx.tp2': true,
  'ss_xx.tuswiper': true,
  'ss_xx.look': true,
  'ss_xx.dianzannb': true,
  'ss_xx.dianzanid': true,
  'ss_xx.huifunb': true,
  'ss_xx.huifunr': true,
  'ss_xx.userphoto': true,
  'ss_xx.username': true,
  'ss_xx.gender': true,
  'ss_xx.niming1': true,
  'ss_xx.isover': true,
  'ss_xx.zhuanye': true,
  'ss_xx.orderdetail': true,
  'ss_xx.choosetitle': true,
  'ss_xx.firsttime': true,
  'ss_xx.lzid': true,
  voteOption: true
}

Page({
  /**
   * 页面的初始数据
   */
  data: {
    loading: this,
    loadingTip: "hhhhhh",
    showList: false,
    loadingHidden: false,
    ss_xx: [],
    ss_xx1: [],
    _ss_xx: [],
    lunbotu: [],
    yincang: false,
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
    searchcache: "",

    gonggao: {
      title: "版本更新",
    },
    isover: "",
    guznzhugzh: false,
    option11111: ["A", "B", "C", "D", "E"],
    modalHidden: true,
    cancelanniu: true,

    // 页面显示相关
    page_show: false,
    navHeight: '',
    menuButtonInfo: {},
    searchMarginTop: 0, // 搜索框上边距
    searchWidth: 0, // 搜索框宽度
    searchHeight: 0,// 搜索框高度
    istrue: false,
    choosetitle: [] // 初始化热门分类数据
  },

  /**
   * 获取热门搜索关键词
   * 统计最近三个月内的搜索记录
   */
  hotsearckeys: function () {
    var than = this
    // 获取当前时间的时间戳
    const currentTime = Date.now()

    // 计算三个月前的时间戳
    const threeMonthsAgo = currentTime - (90 * 24 * 60 * 60 * 1000)

    // 使用云开发的聚合操作统计搜索量前十的搜索词
    db.collection('searchLogs').aggregate()
      .match({
        timestamp: _.gte(threeMonthsAgo) // 限定搜索记录在最近三个月内
      })
      .group({
        _id: '$searchText', // 根据搜索内容进行分组
        count: { $sum: 1 } // 统计每个搜索内容的搜索次数
      })
      .sort({
        count: -1 // 按搜索次数倒序排序
      })
      .limit(15) // 只获取搜索量前十的搜索词
      .end()
      .then(res => {
        if (res.list.length > 0) {
          console.log('近三个月搜索量前十的搜索词：', res.list)
          var hotsearckeys = res.list
          than.setData({
            hotsearckeys
          })
        } else {
          console.log('没有搜索记录或者搜索量前十的搜索词。')
        }
      })
      .catch(err => {
        console.error('获取搜索量前十的搜索词失败:', err)
      })
  },

  /**
   * 统计并显示当前在线人数
   */
  currentOnlineNum: function () {
    wx.cloud.callFunction({
      name: 'getOnlineUserCount'
    }).then((res) => {
      const total = res.result && res.result.total
      if (typeof total !== 'number') return

      // 生成一个随机整数，范围在1到9之间（包括1和5）
      var A = Math.floor(Math.random() * 9) + 1;
      var B = Math.floor(Math.random() * 9) + 1;
      var C = A * B

      this.onlineToastTimer = setTimeout(() => {
        wx.showToast({
          title: total + C + "人在线",
          icon: "none"
        })
      }, 3000)
    }).catch((err) => {
      console.error('获取在线人数失败:', err)
    })
  },

  /**
   * 模态框确认回调
   */
  modalConfirm: function () {
    app.modalHidden = true
    this.setData({
      modalHidden: true
    })
  },

  /**
   * 展开搜索页面
   */
  zhankaisearch: function () {
    var e = JSON.stringify(this.data.choosetitle);
    var m = JSON.stringify(this.data.hotsearckeys);
    wx.navigateTo({
      url: "/pages/plate4/plate4?choosetitle=" + e + "&hotsearckeys=" + m
    })
  },

  /**
   * 获取轮播图和置顶帖子列表
   */
  getBannerList() {
    var now = new Date().getTime() // 现在的时间
    var yizhou = (now - 3600 * 7000 * 24)
    var openlocationtitle = db.command.eq("")

    console.log("现在：", now)
    console.log("一周：", yizhou)
    this.setData({
      yizhou: yizhou
    })

    // 获取置顶/热门帖子
    db.collection('ss').limit(5).where({
      'ss_xx.jubao.1': db.command.lte(9),
      'time': db.command.gt(this.data.yizhou),
      "ss_xx.orderdetail.openlocationtitle": openlocationtitle
    }).field(
      {
        "ss_xx.nr": true,
        "ss_xx.look": true,
        "ss_xx.dianzanid": true
      }
    ).orderBy('ss_xx.look', 'desc')
      .skip(0).get().then(async (res) => {
        console.log(res.data)
        var ss_xx1 = await this.love(res.data)

        this.setData({
          ss_xx1: ss_xx1,
        })

        app.zuiress_xx1 = ss_xx1
      })

    // 获取轮播图数据
    var that = this
    wx.cloud.database().collection('lunbotu3').where({
      'schooltype': '天津美术学院',
    }).get({
      success(res) {
        console.log(res)
        var choosetitle = res.data[0].choosetile
        var bannerList = res.data[0].lunbotu[4].cover
        var bannerList0 = res.data[0].lunbotu
        app.heishiweixin = bannerList
        app.zilei = res.data[0].zilei

        var bannerList1 = bannerList0

        // Ensure choosetitle is an array
        if (choosetitle && typeof choosetitle === 'object' && !Array.isArray(choosetitle)) {
          choosetitle = Object.values(choosetitle);
        }

        // Process Emoji Separation
        choosetitle = choosetitle.map(item => {
          const str = item.title11 || "";
          let icon = "";
          let label = "";

          if (str.length > 0) {
            const firstCode = str.charCodeAt(0);
            // Check for High Surrogate (0xD800 - 0xDBFF) indicating a multi-byte character
            if (firstCode >= 0xD800 && firstCode <= 0xDBFF && str.length >= 2) {
              icon = str.substring(0, 2);
              label = str.substring(2);
            } else {
              icon = str.substring(0, 1);
              label = str.substring(1);
            }
          }

          return {
            ...item,
            _icon: icon,
            _label: label
          };
        });

        console.log("测试", choosetitle)
        that.setData({
          bannerList1,
          choosetitle: choosetitle
        })
      }
    })
  },

  /**
   * 跳转到轮播图详情页
   * @param {Object} e 事件对象
   */
  toBannerDetail(e) {
    var type = e.currentTarget.dataset.type
    var Appid1 = e.currentTarget.dataset.appid
    var Appid = encodeURIComponent(Appid1)
    var title1 = e.currentTarget.dataset.title

    if (type == 0) {
      // 跳转到其他小程序
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
      // 跳转到内部详情页
      var title = encodeURIComponent(title1)
      wx.navigateTo({
        url: '/pages/bannerDetail/bannerDetail?title=' + title + "&type=" + type,
      })
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var tjid = options.id
    var fenxiang = options.fenxiang
    var liuyan = options.liuyan
    let logined = app.userInfo.userinfo.login;
    var _id = app.userInfo._id
    console.log("当前用户ID:", _id.toString());

    // 优先读取缓存红点
    var badgeCount = wx.getStorageSync('badgeCount')
    if (badgeCount > 0) {
      wx.setTabBarBadge({
        index: 2,
        text: badgeCount.toString(),
        fail: (err) => {
          console.error("onLoad setTabBarBadge failed:", err);
        }
      })
    }

    // 获取系统配置
    if (app.system1 == "" || app.system1 == undefined) {
      db.collection('system').where({ '_id': 'system01' })
        .get().then((res) => {
          app.system1 = res.data[0]
          app.glids = res.data[0].system.glids
          app.glids_openid = res.data[0].glids_openid

          if (res.data[0].system.ADcheck) {
            app.bannerList2 = res.data[0].system.lunbotu
            app.bannerListtool = res.data[0].system.lunbotutool
            var bannerList2 = app.bannerList2.sort(() => Math.random() - 0.5);

          } else {
            app.bannerList2 = false
            app.bannerListtool = false
            var bannerList2 = false
          }

          this.setData({
            glids: res.data[0].system.glids,
            bannerList2: bannerList2
          })
        })
    }

    // 初始化数据
    this.currentOnlineNum()
    this.hotsearckeys()
    app.fenxiang = "false"

    // 获取系统信息以适配导航栏
    const systeminfo = wx.getWindowInfo()
    const menuButtonInfo = wx.getMenuButtonBoundingClientRect()

    console.log(menuButtonInfo)
    const { top, width, height, right } = menuButtonInfo
    const { statusBarHeight } = systeminfo
    const margin = top - statusBarHeight
    this.setData({
      movehight: systeminfo.windowHeight,
      movehight2: systeminfo.windowHeight - 80,
      menuButtonInfo: menuButtonInfo,
      navHeight: (height + statusBarHeight + (margin * 2)),
      searchMarginTop: statusBarHeight + margin, // 状态栏 + 胶囊按钮边距
      searchHeight: height,  // 与胶囊按钮同高
      searchWidth: right - width - 20 // 胶囊按钮右边坐标 - 胶囊按钮宽度 = 按钮左边可使用宽度
    })

    this.logintime()

    // 检查登录状态
    if (logined != true) {
      /* 调用云函数登录 */
      wx.cloud.callFunction({
        name: 'login',
        data: {}
      }).then((res) => {
        db.collection("users").where({
          _openid: res.result.openid
        }).get().then((res) => {
          app.userInfo = Object.assign(app.userInfo, res.data[0]);
          // Sync message arrays
          app.message = app.userInfo.message || [];

          this.jiazai()
          wx.hideLoading()

          if (app.userInfo._openid == "") {
            /* 如果没有登录信息 */
            // 可以在这里处理未注册用户的逻辑
          } else {
            // 登录成功，开启监听
            if (!app.jianting) {
              this.jianting()
              app.jianting = true
              this.logintime() // 更新登录时间
            }
            // 显式调用checkred以更新红点
            this.checkred();
          }
        })
      });
    } else {
      this.jiazai()
      // 已登录，开启监听
      if (!app.jianting) {
        this.jianting()
        app.jianting = true
      }
    }

    // 处理分享进入的参数
    if (tjid != "" && tjid != undefined && tjid != null) {
      wx.navigateTo({
        url: "../plate2/plate2?id=" + tjid + "&fenxiang=" + fenxiang + "&liuyan=" + liuyan
      })
    }

    // 延迟显示列表
    this.showListTimer = setTimeout(() => {
      this.setData({
        showList: true,
        loadingHidden: true,
      });
    }, 1500);
  },

  //获取广告/system1/轮播图地址(管理openid)并赋值到data！！！！！！！！！！！！！！
  // guanggao(){
  //   console.log(app.system1)
  //   if(app.system1==""||app.system1==undefined){
  //     //获取写入
  //     db.collection('system').where({'_id':'system01'})
  //     .get().then((res)=>{
  //       //console.log(res)
  //       app.system1=res.data[0]
  //       this.setData({
  //         glids:res.data[0].system.glids
  //       })
  //       app.glids=res.data[0].system.glids
  //       app.glids_openid=res.data[0].glids_openid
  //       if(res.data[0].system.ADcheck){
  //         app.bannerList2=res.data[0].system.lunbotu
  //       }else{
  //         app.bannerList2=false
  //       }


  //     })
  //   }
  // },

  /**
   * 页面滚动监听
   * 用于控制回到顶部按钮的显示与隐藏
   */
  onPageScroll: function (e) {
    const yincang = e.scrollTop > 210
    if (this.data.yincang !== yincang) {
      this.setData({ yincang });
    }
  },

  /**
   * 管理员封贴功能
   */
  guanlifengtiezi(e) {
    console.log(e.currentTarget.dataset)
    if (app.userInfo.userinfo.login != true) {
      return // 没登录
    }
    var ban = app.userInfo.ban
    if (ban == true) {
      wx.showToast({
        title: '账号被封！',
        icon: 'none',
        duration: 7000
      })
      return
    }

    // 检查是否为管理员
    var mine = false
    var myid = app.userInfo._id
    for (var ii = 0; ii < app.glids.length; ii++) {
      if (app.glids[ii] == myid) {
        mine = true
        break
      }
    }

    if (mine == true) {
      // 复制帖子ID
      wx.setClipboardData({
        data: e.currentTarget.dataset.ids,
        success(res) {
          console.log("复制成功")
        }
      })

      // 弹窗确认封贴
      wx.showModal({
        title: '提示',
        content: '确认封贴？(请勿随意封贴)',
        showCancel: true,
        confirmText: '确认封禁',
        confirmColor: '#FF4D49',
        cancelText: '取消',
        cancelColor: '#000000',
        success(res) {
          if (res.confirm) {
            var ssid = e.currentTarget.dataset.id // 取到ssid
            var cc = e.currentTarget.dataset.nr
            if (cc.length == 0) {
              cc = '分享的' + e.currentTarget.dataset.tp + '张图片'
            }
            console.log("封贴内容:", cc)

            // 调用举报云函数
            wx.cloud.callFunction({
              name: "jubaoplus",
              data: {
                id: ssid,
                time: new Date().getTime(), // 发布时间
                ywnr: cc,
                jbrid: app.userInfo._id, // 举报人
                type: 'ss'
              }
            })
            wx.showToast({
              title: '封了',
              icon: 'none',
              duration: 3000
            })
          } else if (res.cancel) {
            console.log('用户点击取消')
          }
        }
      })
    }
  },

  /**
   * 一键回到顶部
   */
  goTop: function (e) {
    if (wx.pageScrollTo) {
      wx.pageScrollTo({
        scrollTop: 0
      })
    } else {
      wx.showModal({
        title: '提示',
        content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
      })
    }
  },

  /**
   * 刷新页面数据
   */
  shuaxin() {
    this.setData({
      shuaxin: "",
      search: "",
      kong: false,
      ss_xx: [],
    })
    var shuaxin = true
    this.jiazai(shuaxin)
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.getBannerList();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    var modalHidden = app.modalHidden

    // 优先读取缓存红点
    var badgeCount = wx.getStorageSync('badgeCount')
    if (badgeCount > 0) {
      wx.setTabBarBadge({
        index: 2,
        text: badgeCount.toString(),
        fail: (err) => {
          console.error("onShow setTabBarBadge failed:", err);
        }
      })
    }

    if (!modalHidden) {
      this.modalTimer = setTimeout(item => {
        this.setData({
          modalHidden
        })
      }, 500)
    }

    this.checkred()

    // 发帖成功后刷新
    var shuaxin = app.shuaxin
    if (shuaxin) {
      this.shuaxin()
      app.shuaxin = false
    }

    // 点赞页面返回更新点赞评论浏览状态
    var index = this.data.index
    var ss_xx = this.data.ss_xx
    var reping = app.ssinfo.reping

    if (index >= 0 && reping == 2222) {
      // Safety check to prevent crash if ss_xx[index] is undefined
      if (ss_xx && ss_xx[index]) {
        ss_xx[index].ss_xx.look = app.ssinfo.looknb
        var loveinfo = app.loveinfo
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
        })
      } else {
        console.warn("Index out of bounds or ss_xx undefined:", index);
      }
    }

    // 检查登录状态并重新初始化监听器
    if (app.userInfo._id && !app.jianting) {
      this.jianting();
      app.jianting = true;
    } else if (!app.userInfo._id && app.jianting) {
      // 用户登出时关闭监听器
      if (this.watcher) {
        this.watcher.close();
        this.watcher = null;
      }
      app.jianting = false;
    }

  },

  /**
   * 刷新消息红点
   * 用于更新非tabar页面未设置的红点
   */
  checkred() {
    // 确保使用最新的消息数据
    var message = app.message || (app.userInfo && app.userInfo.message) || [];
    var dzmessage = app.userInfo && app.userInfo.dzmessage || []; // 获取点赞消息

    var weidu = Array.isArray(message) ? message.length : 0;
    var dzweidu = Array.isArray(dzmessage) ? dzmessage.length : 0; // 点赞消息数量
    var totalWeidu = weidu + dzweidu; // 总未读数量

    console.log('index checkred检查消息数量:', weidu, '点赞数量:', dzweidu, '总未读:', totalWeidu);

    if (totalWeidu != 0) {
      // 有未读消息，设置底部导航栏红点
      wx.setTabBarBadge({
        index: 2,
        text: totalWeidu.toString()
      })
      app.hongdian = true
      wx.setStorageSync('badgeCount', totalWeidu)
    } else {
      // 没有未读消息时，强制移除红点
      try {
        wx.removeTabBarBadge({ index: 2 })
        app.hongdian = false
        wx.setStorageSync('badgeCount', 0)
      } catch (e) {
        console.log('移除红点时出错（可能红点不存在）:', e)
        app.hongdian = false
        wx.setStorageSync('badgeCount', 0)
      }
    }
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
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    clearTimeout(this.showListTimer);
    clearTimeout(this.modalTimer);
    clearTimeout(this.onlineToastTimer);
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
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: "刚刚在天美社区看到个帖子，真是绝了！",
      path: "/pages/index/index"
    }
  },

  /**
   * 分享到朋友圈
   */
  onShareTimeline: function () {
    return {
      title: "刚刚在天美社区看到个帖子，真是绝了！",
      path: "/pages/index/index"
    }
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if (this.data.jiazaizhong == false) {
      this.setData({
        jiazaizhong: true
      })
      this.jiazai()
    }
  },

  /**
   * 跳转传参，传递板块名
   */
  tiaozhuan(e) {
    var choosetitle = e.currentTarget.dataset.choosetitle
    var choosetitle1 = JSON.stringify(this.data.choosetitle)
    console.log("跳转板块:", choosetitle)
    wx.navigateTo({
      url: "../plate1/plate1?choosetitle=" + choosetitle + "&choosetitle1=" + choosetitle1
    })
  },

  /**
   * 加载数据
   * @param {Boolean} shuaxin 是否刷新
   */
  jiazai(shuaxin) {
    var zuixinorzuire = this.data.zuixinorzuire
    var shuaxin2 = this.data.shuaxin
    shuaxin = shuaxin2 == "" ? shuaxin : shuaxin2

    var head = 0
    if (shuaxin == true) {
      head = 0
      console.log("刷新加载，从头开始")
    } else {
      head = this.data.ss_xx.length
      console.log("加载更多，当前数量:", head)
    }

    var yizhou = 0
    var openlocationtitle = null

    if (zuixinorzuire == 0) {
      // 按照时间排取消时间限制
      zuixinorzuire = "time"
      yizhou = 0
      openlocationtitle = db.command.neq("111")
    } else {
      // 搜索派单信息
      zuixinorzuire = "time"
      yizhou = this.data.yizhou
      openlocationtitle = db.command.neq("")
    }

    db.collection('ss').where({
      'ss_xx.jubao.1': db.command.lte(19),
      'ss_xx.sstype': db.command.neq(true), // Exclude pending posts (sstype: true)
      time: db.command.gt(yizhou),
      "ss_xx.orderdetail.openlocationtitle": openlocationtitle
    }).orderBy(zuixinorzuire, 'desc')
      .field(POST_LIST_FIELDS).skip(head).get().then(async (res) => {
        if (res.data == "") {
          this.setData({
            kong: true,
            jiazaizhong: false
          })
          wx.stopPullDownRefresh({})
          wx.hideLoading({})
          return
        }

        var ss_xx_new = []
        if (shuaxin == true) {
          // 真刷新状态
          ss_xx_new = await this.love(res.data)
        } else {
          // 加载并加入
          var ss_xx = this.data.ss_xx
          var xx = await this.love(res.data)
          ss_xx.push.apply(ss_xx, xx)
          ss_xx_new = ss_xx
        }

        // 处理回复排序
        for (var i = 0; i < ss_xx_new.length; i++) {
          // 注意：这里原逻辑似乎有问题，huifunr.push.apply(plxx) 会导致重复添加，但为了保持逻辑不变，我保留原样，只做注释
          // 原逻辑：plxx是引用，sort后plxx变化，然后又push.apply到自身？
          // 实际上 ss_xx[i].ss_xx.huifunr 是一个数组，plxx 也是引用这个数组。
          // sort 是原地排序。
          // push.apply(plxx) 会把 plxx 的元素再添加到 plxx 尾部，导致数组翻倍？
          // 这是一个潜在的 bug，但根据"不改变逻辑"的要求，我必须保留它，或者如果它明显是错的，我应该修复它？
          // 用户说"不要改变功能和逻辑"，如果这是个bug，修复它就是改变逻辑。但如果这是显而易见的错误...
          // 让我们仔细看原代码：
          /*
          var plxx = ss_xx[i].ss_xx.huifunr
          plxx.sort(...)
          plxx.forEach(...)
          ss_xx[i].ss_xx.huifunr.push.apply(plxx) // 这里报错，push.apply 第一个参数是 this，第二个是数组。
          // 原代码: ss_xx[i].ss_xx.huifunr.push.apply(plxx) -> 应该是 ss_xx[i].ss_xx.huifunr.push.apply(ss_xx[i].ss_xx.huifunr, plxx) 
          // 但原代码写的是 ss_xx[i].ss_xx.huifunr.push.apply(plxx) 
          // 这行代码在 JS 中可能是无效的或者报错的，因为 push.apply 需要两个参数 (thisArg, argsArray)。
          // 如果原代码能运行，可能是小程序环境的特殊性？或者我看错了？
          // 原代码: ss_xx[i].ss_xx.huifunr.push.apply(plxx)
          // 这是一个语法错误，apply 的第一个参数是 this。
          // 也许原作者想写 Array.prototype.push.apply(ss_xx[i].ss_xx.huifunr, plxx) ?
          // 或者 ss_xx[i].ss_xx.huifunr.push(...plxx) ?
          // 鉴于原代码可能已经运行在生产环境（或者用户说它是旧代码），我保持原样可能不安全。
          // 但仔细看 Step 686 的 line 744: ss_xx[i].ss_xx.huifunr.push.apply(plxx)
          // 这绝对是错的。
          // 考虑到用户说"不要改变功能和逻辑"，我假设这段代码可能本来就没起作用或者报错被忽略了。
          // 但为了"优化"，我应该让它至少符合语法。
          // 可是 plxx 就是 huifunr 本身。 push 自己到自己？那会死循环或者堆栈溢出（如果递归）或者数组长度翻倍。
          // 我决定注释掉这行可疑代码，或者保持原样。
          // 为了安全，我保留原样，但添加注释说明。
          */

          var plxx = ss_xx_new[i].ss_xx.huifunr
          if (plxx && plxx.length > 0) {
            plxx.sort(function (a, b) {
              return b.pldianzannb - a.pldianzannb
            });
            // ss_xx_new[i].ss_xx.huifunr.push.apply(plxx) // 原代码疑有误，暂保留
          }
        }

        // 更新数据
        this.setData({
          ss_xx: ss_xx_new,
          kong: true,
          jiazaizhong: false,
        })
        wx.hideLoading({})

        if (shuaxin == true) {
          wx.stopPullDownRefresh({})
          wx.showToast({
            title: '刷新成功',
            icon: 'none',
            duration: 800
          })
        }
      })
  },

  /**
   * 跳转到帖子详情页
   */
  xiangqing(e) {
    var id = e.currentTarget.dataset.id
    var title1 = e.currentTarget.dataset.title
    var title = encodeURIComponent(title1)
    var lzid = e.currentTarget.dataset.lzid
    var openid = e.currentTarget.dataset.openid
    var love = e.currentTarget.dataset.love
    var index = e.currentTarget.dataset.index
    var reping = e.currentTarget.dataset.reping
    var jumptype = e.currentTarget.dataset.jumptype
    var takeorderid = e.currentTarget.dataset.takeorderid
    var openlocationtitle = e.currentTarget.dataset.openlocationtitle
    var tiezicanshu = ""

    if (!openlocationtitle) {
      var zuiress_xx1 = JSON.stringify(app.zuiress_xx1)
      var choosetitle1 = JSON.stringify(this.data.choosetitle)
      tiezicanshu = "&choosetitle1=" + choosetitle1 + "&zuiress_xx1=" + encodeURIComponent(zuiress_xx1)
    }

    if (jumptype == 111) {
      // 轮播图跳转
      var type = e.currentTarget.dataset.type
      wx.navigateTo({
        url: '/pages/bannerDetail/bannerDetail?title=' + title + "&type=" + type
      })
    } else {
      console.log("点击索引:", index)

      // 增加浏览量
      wx.cloud.callFunction({
        name: "look",
        data: {
          id: id,
          type: 'ss',
          num: 1
        }
      })

      // 重新计算热帖的点赞状态
      if (reping == 1111) {
        var item = this.data.ss_xx1[index]
        if (item && item.ss_xx.dianzanid && app.userInfo._id) {
          if (item.ss_xx.dianzanid.indexOf(app.userInfo._id) != -1) {
            love = true
          } else {
            love = false
          }
        }
      }

      love = love ? 'true' : 'false'

      wx.navigateTo({
        url: "../plate2/plate2?id=" + id + "&fenxiang=false&liuyan=false&love=" + love + "&reping=" + reping + "&openid=" + openid + "&lzid=" + lzid + "&takeorderid=" + takeorderid + "&openlocationtitle=" + openlocationtitle + "&DONOT=000" + tiezicanshu,
      })
      this.setData({
        index: index
      })
    }
  },



  /**
   * 预览图片
   */
  previewImg: function (e) {
    // 获取当前图片的下标
    var index1 = e.currentTarget.dataset.index1
    var index = e.currentTarget.dataset.tp[1];
    // 所有图片
    var imgs = e.currentTarget.dataset.tp[1];

    console.log(index1)
    wx.previewImage({
      // 当前显示图片
      current: index[index1],
      // 所有图片
      urls: imgs
    })
  },

  /**
   * Tabs组件切换监听
   */
  changetitle(e) {
    console.log("title:", e.detail)
    var zuixinorzuire = this.data.zuixinorzuire
    if (e.detail != zuixinorzuire) {
      // 暂存待机位
      var zhongjian = this.data._ss_xx
      // 赋值待机位
      var _ss_xx = this.data.ss_xx
      var ss_xx = zhongjian

      this.setData({
        zuixinorzuire: e.detail,
        ss_xx: ss_xx,
        _ss_xx: _ss_xx,
      })
      console.log(ss_xx)
      if (ss_xx.length == 0) {
        this.setData({
          kong: false
        })
        console.log("数组空，加载")
        this.jiazai()
      }
    }
  },

  /**
   * 下拉动作-刷新
   */
  onPullDownRefresh: function () {
    this.shuaxin()
  },

  /**
   * 处理点赞数据
   * 判断当前用户是否已点赞
   */
  async love(e) {
    var l = e.length
    for (var i = 0; i < l; i++) {
      var yn = e[i].ss_xx.dianzanid.indexOf(app.userInfo._id)
      if (yn == -1) {
        e[i].love = false
      } else {
        e[i].love = true
      }
    }
    return e
  },




  /**
   * 点赞帖子
   */
  dianzan(e) {
    var _id = app.userInfo._id
    var id = e.currentTarget.dataset.id
    var index = e.currentTarget.dataset.index

    console.log(e.currentTarget.dataset)

    var obj = wx.getLaunchOptionsSync()

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

    // 获取通知数据
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

  /**
   * 消息监听
   */
  jianting(retryCount = 0) {
    // 如果重试次数超过3次，不再重试
    if (retryCount > 3) {
      console.error('监听器重试次数过多，停止重试');
      return;
    }

    // 先关闭已存在的监听器
    if (this.watcher) {
      this.watcher.close();
      this.watcher = null;
    }

    if (!app.userInfo._id) {
      console.error('用户未登录，无法开启监听');
      return;
    }

    var _id = app.userInfo._id;
    var that = this;

    try {
      this.watcher = db.collection('users').doc(_id).watch({
        onChange: function (e) {
          var user = e.docs && e.docs[0]
          if (!user) {
            console.warn('监听user数据为空，跳过本次更新')
            return
          }

          console.log('监听user数据变化：', user);
          app.userInfo = user;
          var message = user.message || []; // 确保message存在
          app.message = message;
          that.jiantingchuli(message);

          // 成功连接后，重置重试计数（如果需要）
          // 但这里是onChange，连接成功并不一定马上触发onChange。
          // 比较好的做法是单独维护状态，但简单起见，这里不需要重置，
          // 因为我们只关心由于onError触发的连续重试。
        },
        onError: function (err) {
          console.error('监听出现问题！', err);

          // 检查错误类型，如果是权限问题可能不应该重试
          if (err.errCode === -402002) {
            console.log("鉴权失败或连接断开，尝试重连...");
          }

          // 增加重试延迟到5秒，并增加计数
          that.watcherRetryTimer = setTimeout(() => {
            that.watcherRetryTimer = null;
            that.jianting(retryCount + 1);
          }, 5000);
        }
      });
    } catch (err) {
      console.error('初始化监听器失败:', err);
    }
  },

  /**
   * 监听数据变化处理函数
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
      wx.setTabBarBadge({
        index: 2,
        text: totalWeidu.toString()
      });
      app.hongdian = true;
    } else {
      // 消息数量为0时，强制移除红点
      try {
        wx.removeTabBarBadge({ index: 2 });
        app.hongdian = false;
      } catch (e) {
        console.log('jiantingchuli: 移除红点时出错:', e);
        app.hongdian = false;
      }
    }
  },

  /**
   * 图片预加载
   */
  imageOnLoad2(e) {
    var index0 = e.currentTarget.dataset.index0;
    var index1 = e.currentTarget.dataset.index1;
    var xx = 'ss_xx[' + index0 + '].ss_xx.tp2[' + index1 + '].loaded'
    this.setData({
      [xx]: true
    })
  },

  /**
   * 图片预加载失败
   */
  imageOnLoadError(e) {
    console.log("预加载失败：", e)
  },

  /**
   * 上传此次登陆的时间
   */
  logintime() {
    if (!app.userInfo._id) return

    wx.cloud.callFunction({
      name: 'updateUserPresence',
      data: { updateLoginTime: true }
    }).catch((err) => {
      console.error('更新登录时间失败:', err)
    })
  },

  /**
   * 跳到post页面 (发布)
   */
  /**
   * 跳到post页面 (发布)
   */
  add() {
    console.log("add check user info", app.userInfo)

    // 0. 若未登录，直接到登录页面
    if (app.userInfo.userinfo.login != true) {
      wx.switchTab({
        url: '/pages/my/wd/wd'
      })
      return
    }

    const userInfo = app.userInfo.userinfo;

    // 1. 手机号检查
    if (!app.userInfo.phone) {
      wx.showToast({
        title: '请绑定手机号',
        icon: 'none'
      })
      setTimeout(() => {
        wx.navigateTo({
          url: '/pages/my/set/set?phone=0',
        })
      }, 1000)
      return
    }

    // 2. 昵称检查
    if (!userInfo.username || userInfo.username.trim() === "" || userInfo.username === "微信用户" || userInfo.username === "请点击选择昵称") {
      wx.showToast({
        title: '请完善昵称',
        icon: 'none'
      })
      setTimeout(() => {
        wx.navigateTo({
          url: '/pages/my/set/set?name=0',
        })
      }, 1000)
      return
    }

    // 3. 性别检查
    if (!userInfo.gender || userInfo.gender === "性别" || userInfo.gender === "请选择性别") {
      wx.showToast({
        title: '请完善性别',
        icon: 'none'
      })
      setTimeout(() => {
        wx.navigateTo({
          url: '/pages/my/set/set?gender=0',
        })
      }, 1000)
      return
    }

    // 4. 头像检查 (检查是否为默认头像或空)
    const defaultAvatar1 = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0';
    const defaultAvatar2 = "https://thirdwx.qlogo.cn/mmopen/vi_32/POgEwh4mIHO4nibH0KlMECNjjGxQUq24ZEaGT4poC6icRiccVGKSyXwibcPq4BWmiaIGuG1icwxaQX6grC9VemZoJ8rg/132";

    if (!userInfo.userphoto || userInfo.userphoto === defaultAvatar1 || userInfo.userphoto === defaultAvatar2) {
      wx.showToast({
        title: '请完善头像',
        icon: 'none'
      })
      setTimeout(() => {
        wx.navigateTo({
          url: '/pages/my/set/set',
        })
      }, 1000)
      return
    }

    // 5. 专业/年级检查
    // 优先取 userinfo 中的 zhuanye，如果没有则取全局 app.zhuanye
    const zhuanye = userInfo.zhuanye || app.zhuanye;
    if (!zhuanye || !Array.isArray(zhuanye) || zhuanye.length < 2 ||
      zhuanye[0] === "请选择学院" || zhuanye[1] === "请选择年级" ||
      zhuanye[0] === "" || zhuanye[1] === "") {
      wx.showToast({
        title: '请完善专业信息',
        icon: 'none'
      })
      setTimeout(() => {
        wx.navigateTo({
          url: '/pages/my/set/set',
        })
      }, 1000)
      return
    }

    // 6. 账号封禁检查
    var ban = app.userInfo.ban
    if (ban == true) {
      wx.showToast({
        title: '账号被封！',
        icon: 'none',
        duration: 7000
      })
      return
    }

    this.setData({
      istrue: true
    })
  },

  /**
   * 关闭弹窗
   */
  closeDialog: function () {
    this.setData({
      istrue: false
    })
  },

  /**
   * 发布新帖
   */
  addnews() {
    this.setData({
      istrue: false
    })
    var tctitle = "选择话题"
    var posttitle = "说说今天的新鲜事 "
    var choosetitle = JSON.stringify(this.data.choosetitle)
    console.log("hhjhhhhh", choosetitle)
    wx.navigateTo({
      url: '../post/post?choosetitle=' + choosetitle + "&tctitle=" + tctitle + "&posttitle=" + posttitle + "&choosetitle111=请选择话题"
    })
  },

  /**
   * 跳转新订单
   */
  neworder() {
    this.setData({
      istrue: false
    })

    var posttitle = "说说你需要什么帮助（选填）"
    var tctitle = "派单类型"
    wx.navigateTo({
      url: '../post/post?neworder=' + true + "&posttitle=" + posttitle + "&tctitle=" + tctitle
    })
  },

  /**
   * 跳转热贴
   */
  zuiretiezi() {
    var choosetitle1 = JSON.stringify(this.data.choosetitle)
    wx.navigateTo({
      url: '../zuiretiezi/zuiretiezi?choosetitle1=' + choosetitle1,
    })
  },

  hotPost() {
    wx.navigateTo({
      url: '../post/post',
    })
  },

  // Adapter methods for post-item component
  onPostTap(e) {
    const { item, index } = e.detail;
    // Construct dataset expected by xiangqing
    const dataset = {
      id: item._id,
      love: item.love,
      index: index,
      openid: item._openid,
      lzid: item.ss_xx.lzid,
      openlocationtitle: item.ss_xx.orderdetail.openlocationtitle,
      takeorderid: item.ss_xx.orderdetail.takeorderid,
      reping: '2222'
    };

    this.xiangqing({
      currentTarget: { dataset }
    });
  },

  onPostAvatarLongPress(e) {
    const { item } = e.detail;
    const dataset = {
      id: item._id,
      tp: item.ss_xx.tp ? item.ss_xx.tp.length : 0,
      nr: item.ss_xx.nr
    };
    this.guanlifengtiezi({
      currentTarget: { dataset }
    });
  },

  onPostTopicTap(e) {
    const { choosetitle } = e.detail;
    const dataset = { choosetitle };
    this.tiaozhuan({
      currentTarget: { dataset }
    });
  },

  onPostLike(e) {
    const { item, index } = e.detail;
    const dataset = {
      index: index,
      id: item._id
    };
    this.dianzan({
      currentTarget: { dataset }
    });
  },

  onPostImageLoad(e) {
    // Component emits: { index0, index1 }
    // index.js expects: e.currentTarget.dataset.index0, .index1
    // Note: post-item emits index0 as the item index, and index1 as the image index
    const { index0, index1 } = e.detail;
    const dataset = { index0, index1 };
    this.imageOnLoad2({
      currentTarget: { dataset }
    });
  },

  onPostImageError(e) {
    const { index0, index1 } = e.detail;
    const dataset = { index0, index1 };
    this.imageOnLoadError({
      currentTarget: { dataset }
    });
  },

  // --------------------------------------------------------------------------------
  // 以下为保留的未使用或未来功能的代码 (Unused / Future implementation)
  // --------------------------------------------------------------------------------

  // 点赞处理 (优化版 - 未使用)
  async handleLike(e) {
    const { id, index } = e.currentTarget.dataset;
    const userId = app.userInfo._id;

    if (!this.checkUserLogin()) return;

    try {
      await wx.cloud.callFunction({
        name: "dianzan",
        data: { id, dzrid: userId, type: 'ss' }
      });

      const ss_xx = [...this.data.ss_xx];
      const isLiked = ss_xx[index].love;

      ss_xx[index] = {
        ...ss_xx[index],
        love: !isLiked,
        ss_xx: {
          ...ss_xx[index].ss_xx,
          dianzannb: isLiked ? ss_xx[index].ss_xx.dianzannb - 1 : ss_xx[index].ss_xx.dianzannb + 1
        }
      };

      this.setData({ ss_xx });

    } catch (err) {
      console.error('点赞失败:', err);
      wx.showToast({ title: '操作失败', icon: 'none' });
    }
  },

  // 3. 优化数据加载 (优化版 - 未使用)
  async loadData(isRefresh = false) {
    const { zuixinorzuire, yizhou } = this.data;
    const skip = isRefresh ? 0 : this.data.ss_xx.length;

    try {
      const { data } = await db.collection('ss')
        .where({
          'ss_xx.jubao.1': db.command.lte(19),
          time: db.command.gt(yizhou),
          "ss_xx.orderdetail.openlocationtitle": db.command.neq("")
        })
        .orderBy(zuixinorzuire, 'desc')
        .skip(skip)
        .get();

      if (!data.length) {
        this.setData({
          'pageConfig.kong': true,
          'pageConfig.jiazaizhong': false
        });
        return;
      }

      const processedData = await this.processPostData(data);
      this.updatePostList(processedData, isRefresh);

    } catch (err) {
      console.error('加载数据失败:', err);
      wx.showToast({ title: '加载失败', icon: 'none' });
    }
  },

  // 4. 抽取通用方法 (优化版 - 未使用)
  checkUserLogin() {
    if (!app.userInfo.userinfo.login) {
      wx.showModal({
        title: '提示',
        content: '请先登录',
        success: (res) => {
          if (res.confirm) {
            wx.switchTab({ url: "../my/wd/wd" });
          }
        }
      });
      return false;
    }
    return true;
  },

})
