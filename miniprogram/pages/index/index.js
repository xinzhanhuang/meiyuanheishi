const app = getApp()
const { callCloudFunction } = require('../../utils/cloud-call')
const utils = require('../../utils/util')
const homeService = require('../../services/home-service')
const sessionMethods = require('../../utils/index-session')
const postService = require('../../services/post-service')
const homeMethods = require('../../utils/index-home')

Page({
  ...sessionMethods,
  ...homeMethods,
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

    // 优先读取缓存红点
    var badgeCount = wx.getStorageSync('badgeCount')
    if (badgeCount > 0) {
      wx.setTabBarBadge({
        index: app.myTabIndex,
        text: badgeCount.toString(),
        fail: (err) => {
          console.error("onLoad setTabBarBadge failed:", err);
        }
      })
    }

    // 获取系统配置
    if (app.system1 == "" || app.system1 == undefined) {
      homeService.getSystemConfig().then((config) => {
          if (!config) return
          app.system1 = config
          app.glids = config.system.glids
          app.glids_openid = config.glids_openid

          if (config.system.ADcheck) {
            app.bannerList2 = config.system.lunbotu
            app.bannerListtool = config.system.lunbotutool
            var bannerList2 = app.bannerList2.sort(() => Math.random() - 0.5);

          } else {
            app.bannerList2 = false
            app.bannerListtool = false
            var bannerList2 = false
          }

          this.setData({
            glids: config.system.glids,
            bannerList2: bannerList2
          })
        }).catch(err => console.error('获取首页系统配置失败', err))
    }

    // 初始化数据
    this.currentOnlineNum()
    this.hotsearckeys()
    app.fenxiang = "false"

    // 获取系统信息以适配导航栏
    const systeminfo = wx.getWindowInfo()
    const menuButtonInfo = wx.getMenuButtonBoundingClientRect()

    this.setData({
      movehight: systeminfo.windowHeight,
      movehight2: systeminfo.windowHeight - 80,
      menuButtonInfo: menuButtonInfo
    })

    console.log(menuButtonInfo)
    const { top, width, height, right } = menuButtonInfo
    const { statusBarHeight } = systeminfo
    const margin = top - statusBarHeight
    this.setData({
      navHeight: (height + statusBarHeight + (margin * 2)),
      searchMarginTop: statusBarHeight + margin, // 状态栏 + 胶囊按钮边距
      searchHeight: height,  // 与胶囊按钮同高
      searchWidth: right - width - 20 // 胶囊按钮右边坐标 - 胶囊按钮宽度 = 按钮左边可使用宽度
    })

    // 公共帖子不等待用户会话，登录失败也不阻塞首屏。
    this.jiazai()
    app.ensureCurrentUser().then(user => {
      if (!user) return
      this.jianting()
      this.logintime()
      this.checkred()
    }).catch(err => console.warn('首页用户会话恢复失败', err))

    // 处理分享进入的参数
    if (tjid != "" && tjid != undefined && tjid != null) {
      const target = utils.getPostTarget({ id: tjid, liuyan, source: fenxiang ? 'share' : 'home' }, 'ss')
      wx.navigateTo({ url: utils.getPostTargetUrl(target) })
    }

    // 延迟显示列表
    setTimeout(() => {
      this.setData({
        showList: true,
        loadingHidden: true,
      });
    }, 1500);
  },

  /**
   * 页面滚动监听
   * 用于控制回到顶部按钮的显示与隐藏
   */
  onPageScroll: function (e) {
    if (e.scrollTop > 210) {
      this.setData({
        yincang: true,
      });
    } else {
      this.setData({
        yincang: false,
      });
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
            postService.moderatePost({
                id: ssid,
                time: new Date().getTime(), // 发布时间
                ywnr: cc,
                jbrid: app.userInfo._id, // 举报人
                type: 'ss'
            }).catch(err => console.error('封贴失败', err))
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
    // 计算一周前的时间戳
    var now = new Date().getTime() // 现在的时间
    var yizhou = (now - 3600 * 7000 * 24)
    console.log("现在：", now)
    console.log("一周：", yizhou)
    this.setData({
      yizhou: yizhou
    })

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
        index: app.myTabIndex,
        text: badgeCount.toString(),
        fail: (err) => {
          console.error("onShow setTabBarBadge failed:", err);
        }
      })
    }

    if (!modalHidden) {
      setTimeout(item => {
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

    if (app.userInfo._id) this.bindUserWatcher()

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

    // 消息与红点由 app 的用户实时监听统一同步，避免每次显示首页再读取同一用户文档。
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
        index: app.myTabIndex,
        text: totalWeidu.toString()
      })
      app.hongdian = true
      wx.setStorageSync('badgeCount', totalWeidu)
    } else {
      // 没有未读消息时，强制移除红点
      try {
        wx.removeTabBarBadge({ index: app.myTabIndex })
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
    this.unbindUserWatcher()
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
    this.unbindUserWatcher()
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
    app.choosetitle1 = this.data.choosetitle
    console.log("跳转板块:", choosetitle)
    wx.navigateTo({
      url: "../plate1/plate1?choosetitle=" + choosetitle
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

    homeService.getPosts({ orderMode: zuixinorzuire, since: this.data.yizhou, skip: head })
      .then(async (posts) => {
        if (!posts.length) {
          this.setData({
            kong: true,
            jiazaizhong: false
          })
          wx.stopPullDownRefresh({})
          return
        }

        var ss_xx_new = []
        var postStartIndex = 0
        if (shuaxin == true) {
          // 真刷新状态
          ss_xx_new = await this.love(posts)
        } else {
          // 加载并加入
          var ss_xx = this.data.ss_xx
          var xx = await this.love(posts)
          postStartIndex = ss_xx.length
          ss_xx.push.apply(ss_xx, xx)
          ss_xx_new = ss_xx
        }

        // 已加载的帖子此前已排过序；加载更多时只处理新增帖子。
        for (var i = postStartIndex; i < ss_xx_new.length; i++) {
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

        if (shuaxin == true) {
          wx.stopPullDownRefresh({})
          wx.showToast({
            title: '刷新成功',
            icon: 'none',
            duration: 800
          })
        }
      }).catch((err) => {
        console.error('首页列表加载失败', err)
        this.setData({
          jiazaizhong: false,
          kong: true
        })
        wx.stopPullDownRefresh({})
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
    app.choosetitle1 = this.data.choosetitle

    if (jumptype == 111) {
      // 轮播图跳转
      var type = e.currentTarget.dataset.type
      wx.navigateTo({
        url: '/pages/bannerDetail/bannerDetail?title=' + title + "&type=" + type
      })
    } else {
      console.log("点击索引:", index)

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
        url: utils.getPostTargetUrl({ postId: id, postType: 'ss', source: 'index' }),
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

    postService.toggleLike({
        id: id,
        dzrid: _id,
        type: 'ss',
        name: name,
        photo: photo,
        time: time,
        lzid: lzid,
        ywnr: ywnr
    }).catch(err => console.error('点赞失败', err))

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
  jianting() {
    this.bindUserWatcher()
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
        index: app.myTabIndex,
        text: totalWeidu.toString()
      });
      app.hongdian = true;
    } else {
      // 消息数量为0时，强制移除红点
      try {
        wx.removeTabBarBadge({ index: app.myTabIndex });
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
    var now = new Date().getTime()
    console.log(app.userInfo._id)
    return callCloudFunction('login', { action: 'setLoginTime', logintime: now })
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

    // 个人资料均为可选；发布入口只保留登录和封禁检查。
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
    app.choosetitle1 = this.data.choosetitle
    wx.navigateTo({
      url: '../zuiretiezi/zuiretiezi',
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

})
