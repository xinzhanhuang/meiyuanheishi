var db = wx.cloud.database()
var app = getApp()
Page({
  //页面的初始数据
  data: {
    ss_xx: [],
    _ss_xx: [],
    bankuai: "",
    yincang: true,
    zuixinorzuire: 0,
    index: -1,
    searchcache: "",
    kong: false,
    istrue: false,
    option11111: ["A", "B", "C", "D", "E"]
  },
  //跳转到详情！！！！！！！！！！！
  // xiangqing(){
  //   wx.navigateTo({
  //     url:"../plate2/plate2"
  //   })
  // },


  // 搜索
  search(e) {

    var searchcache = this.data.searchcache

    if (searchcache == "") {
      var searchcache = this.data.ss_xx
    }

    //查询值
    //console.log(e.detail.value)
    var text = e.detail.value
    this.setData({
      shuaxin: e.detail.value,
      search: e.detail.value
    })
    if (text == "") {
      wx.showToast({
        title: '不能为空',
        icon: "none",
      })
      return
    }

    var yizhou = 0
    /////////////////
    wx.showLoading({
      title: '搜索中',
      mask: true
    })
    //console.log("查询")//
    db.collection("ss").where({
      'ss_xx.choosetitle': this.data.choosetitle,
      "ss_xx.nr": {
        $regex: '.*' + text,
        $options: 'i'
      },
      time: db.command.gt(yizhou),
      // "ss_xx.orderdetail.openlocationtitle": openlocationtitle
    }).orderBy('time', 'desc').get().then(async (res) => {
      console.log(res.data)//这里一下取回了所有
      wx.hideLoading({})
      var xx = await this.love(res.data)
      if (xx.length > 0) {
        this.setData({
          ss_xx: xx,
          kong: true
        })

        wx.showToast({
          title: '搜索完毕',
          icon: "none"
        })
      } else {
        this.setData({
          // ss_xx:searchcache,

        })

        wx.showToast({
          title: '啥也没有',
          icon: "none"

        })

      }



    })
    //这个查询就是查询all表中 字段为name中 like你传的值的所有数据
    //后面的$options:'i' 代表这个like的条件不区分大小写
    //这个模糊查询基本够用了;

  },
  //刷新！！！！！！！！！！
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
  // 获取滚动条当前位置！！！！！！！！！！！！！！
  onPageScroll: function (e) {
    const yincang = e.scrollTop <= 200
    if (this.data.yincang !== yincang) {
      this.setData({ yincang });
    }
  },
  //生命周期函数--监听页面加载！！！！！！！！！！！！
  onLoad: function (options) {
    let logined = app.userInfo.userinfo.login;
    const systeminfo = wx.getWindowInfo()
    const menuButtonInfo = wx.getMenuButtonBoundingClientRect()

    this.setData({
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
      searchWidth: right - width - 20// 胶囊按钮右边坐标 - 胶囊按钮宽度 = 按钮左边可使用宽度
    })




    if ((options.fenxiang === "true" || options.fenxiang === "ture") && logined != true) {
      /*调用云函数登录*/
      //   wx.showLoading({
      //     title: '检查登录',
      //     mask:true
      //   })
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
            /*如果没有登录信息则跳转到wd*/
            //wx.switchTab({url:"../my/wd/wd"})
            //如果没有登录信息则提示未登录
            // wx.showToast({
            //   title: '未登录只可浏览',
            //   icon:'none',
            //   duration:3000
            // })
          } else {
            //登录上了就监听user

            console.log("已经登录，开启监听user")
            var _id = app.userInfo._id
            var that = this
            this.watcher = db.collection('users').doc(_id).watch({
              onChange: function (e) {
                console.log('监听user数据变化：', e.docs[0])
                app.userInfo = e.docs[0]
                var message = e.docs[0].message//message数组
                app.message = message
                // that.jiantingchuli(message)

                console.log('长度', message.length)

              },
              onError: function (err) {
                console.error('监听出现问题！', err)
              }
            })
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
    var choosetitle1 = JSON.parse(options.choosetitle1);
    var choosetitle = options.choosetitle

    this.setData({
      choosetitle: String(choosetitle),
      choosetitle1,

      choosetitlezhuanfa: options.choosetitle1,
      movehight: systeminfo.windowHeight,
      movehight2: systeminfo.windowHeight - 100
    })

    this.jiazai()
  },



  //加载数据(刷新状态下，data内ss_xx数组重新赋值)！！！！！！！！！！！！
  jiazai(shuaxin) {
    //console.log(shuaxin)
    var zuixinorzuire = this.data.zuixinorzuire
    if (shuaxin) {
      // wx.showLoading({
      //   title: '正在刷新',
      //   mask:true
      // })
      var head = 0
      //console.log("toushi0")
    } else {
      // wx.showLoading({
      //   title: '正在加载',
      //   mask:true
      // })
      var head = this.data.ss_xx.length
    }

    /////////////////////
    if (zuixinorzuire == 0) {
      //按照时间排取消时间限制，
      zuixinorzuire = "time"
      var yizhou = 0
    } else {
      //按照热度排行
      zuixinorzuire = "ss_xx.dianzannb"
      var yizhou = this.data.yizhou
    }
    /////////////////

    db.collection('ss').where({
      'ss_xx.choosetitle': this.data.choosetitle,
      'ss_xx.jubao.1': db.command.lte(19),
      time: db.command.gt(yizhou)
    }).orderBy(zuixinorzuire, 'desc').skip(head).get().then(async (res) => {
      console.log(res)//这里已经取到了相应的数组
      if (res.data == "") {
        this.setData({
          kong: true
        })
        wx.stopPullDownRefresh({})
        // wx.hideLoading({})
        wx.showToast({
          title: '没有更多了',
          icon: 'none',
          duration: 800
        })
        return
      } else if (shuaxin) {

        var ss_xx = await this.love(res.data)

      } else {
        var ss_xx = this.data.ss_xx

        var xx = await this.love(res.data)
        ss_xx.push.apply(ss_xx, xx)
      }
      //////循环评论
      for (var i = 0; i < ss_xx.length; i++) {
        var plxx = ss_xx[i].ss_xx.huifunr
        plxx.sort(function (a, b) {
          return b.pldianzannb - a.pldianzannb
        });
        plxx.forEach(function (item) { })

        ss_xx[i].ss_xx.huifunr.push.apply(plxx)
      }


      this.setData({
        ss_xx: ss_xx,
        kong: true
      })
      if (shuaxin) {
        wx.stopPullDownRefresh({})
        wx.showToast({
          title: '刷新成功',
          icon: 'none',
          duration: 800
        })
      } else {
      }
    })
  },

  //生命周期函数--监听页面初次渲染完成
  onReady: function () {
    //写出一周前的时间戳
    var now = new Date().getTime()//现在的时间
    var yizhou = (now - 3600 * 7000 * 24)
    this.setData({
      yizhou: yizhou
    })
  },
  //生命周期函数--监听页面显示
  onShow: function () {
    //点赞页面返回更新点赞评论浏览状态
    var index = this.data.index
    var ss_xx = this.data.ss_xx
    console.log("index::::", index)
    if (index >= 0) {
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
  onUnload: function () {
    if (this.watcher) {
      this.watcher.close();
      this.watcher = null;
    }
  },
  //页面相关事件处理函数--监听用户下拉动作
  onPullDownRefresh: function () { },
  //页面上拉触底事件的处理函数！！！！！！！！！！！！！！！
  onReachBottom: function () {
    this.jiazai()
  },

  //点击跳到详情！！！！！！！！！！！！！！！！
  xiangqing(e) {

    //console.log(id.currentTarget.dataset.id)
    var id = e.currentTarget.dataset.id
    var love = e.currentTarget.dataset.love
    var index = e.currentTarget.dataset.index
    var choosetitle1 = JSON.stringify(this.data.choosetitle1)
    var zuiress_xx1 = false

    wx.cloud.callFunction({
      name: "look",
      data: {
        id: id,
        type: 'ss'
      }
    })


    if (love) {
      love = 'true'
    } else {
      love = 'false'
    }


    wx.navigateTo({
      url: "../plate2/plate2?id=" + id + "&fenxiang=false&liuyan=false&love=" + love + "&choosetitle1=" + choosetitle1 + "&DONOT=111" + "&zuiress_xx1=" + zuiress_xx1
    })

    this.setData({
      index: index
    })


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


  //返回组件Tabs的监听
  changetitle(e) {
    var title = e.currentTarget.dataset.title;
    var zuixinorzuire = this.data.zuixinorzuire
    if (title != zuixinorzuire) {
      //暂存待机位
      var zhongjian = this.data._ss_xx
      //赋值待机位
      var _ss_xx = this.data.ss_xx
      var ss_xx = zhongjian
      this.setData({
        zuixinorzuire: e.detail,
        ss_xx: ss_xx,
        _ss_xx: _ss_xx
      })
      console.log(ss_xx)
      if (ss_xx.length == 0) {
        this.setData({
          kong: false
        })
        console.log("数组空，加载")
        this.jiazai()
      }
    } else {
      this.shuaxin()
    }
    this.setData({
      show: false
    })
  },


  /////////////////右上角弹窗
  show: function () {

    //如果show值为true，则更改为false  反之设置true
    if (this.data.show) {
      this.setData({
        show: false
      })
    } else {
      this.setData({
        show: true
      })
    }
  },


  //下拉动作-刷新
  onPullDownRefresh: function () {
    this.shuaxin()
    //setTimeout(function (){wx.stopPullDownRefresh({})},'2000')
  },
  //处理点赞数据
  async love(e) {
    console.log(e)
    var l = e.length
    for (var i = 0; i < l; i++) {
      var yn = e[i].ss_xx.dianzanid.indexOf(app.userInfo._id)
      console.log(yn)
      if (yn == -1) {
        e[i].love = false
      } else {
        e[i].love = true
      }
    }
    return e
  },


  //图片预加载zhi ss图预加载
  imageOnLoad2(e) {
    //console.log("一次")
    var index0 = e.currentTarget.dataset.index0;
    var index1 = e.currentTarget.dataset.index1;
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


  //点赞帖子(这里得加index)
  dianzan(e) {
    var _id = app.userInfo._id
    var id = e.currentTarget.dataset.id
    var index = e.currentTarget.dataset.index

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

  ////////////////////////////
  // 发布新帖
  addnews() {
    var choosetitle = this.data.choosetitlezhuanfa
    var choosetitle111 = this.data.choosetitle
    var tctitle = "选择话题"
    var posttitle = "说说今天的新鲜事 "

    console.log("hhjhhhhh", choosetitle)
    wx.navigateTo({
      url: '../post/post?choosetitle=' + choosetitle + "&tctitle=" + tctitle + "&posttitle=" + posttitle + "&choosetitle111=" + choosetitle111
    })

  },

  //回到首页////
  blackindex() {
    var obj = wx.getLaunchOptionsSync()
    if (obj.scene == 1154) {
      wx.showToast({
        title: '前往小程序👇',
        icon: 'none',
        duration: 2000,
      })
      return
    }
    wx.switchTab({

      url: '/pages/index/index'

    });
  },



  onShareTimeline: function () {
    return {
      title: this.data.choosetitle + "...合集",
      path: "/pages/index/index"
    }
  },


  onShareAppMessage: function () {

    var choosetitle1 = this.data.choosetitlezhuanfa
    var choosetitle = this.data.choosetitle

    return {
      title: choosetitle + "...合集",
      path: "/pages/plate1/plate1?&choosetitle1=" + choosetitle1 + "&choosetitle=" + choosetitle + "&fenxiang=ture"
    }
  },

  // Adapter methods for post-item component
  onPostTap(e) {
    const { item, index } = e.detail;
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
    if (this.guanlifengtiezi) {
      this.guanlifengtiezi({
        currentTarget: { dataset }
      });
    } else {
      console.log("guanlifengtiezi not defined in plate1.js");
    }
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

  onPostMazhu(e) {
    if (this.mazhu) {
      this.mazhu(e);
    }
  },

})
