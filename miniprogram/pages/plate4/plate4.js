const app = getApp()
const db = wx.cloud.database()
const _ = db.command
const { callCloudFunction } = require('../../utils/cloud-call')

Page({
  timer: null, // Debounce timer

  //页面的初始数据！！！！！！！！！！！！！！
  data: {

    loading: this,
    loadingTip: "hhhhhh",
    showList: false,
    loadingHidden: false,
    ss_xx: [],
    ss_xx1: [],
    _ss_xx: [],
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
    hotsearckeys: "",
    scwidth: 0,
    kong: false,
    zhankaisearch2: true,
    searchcache: "",
    suggestionList: [],
    showSuggestions: false,

    gonggao: {
      title: "版本更新",

    },
    hottext: '',
    guznzhugzh: false,
    option11111: ["A", "B", "C", "D", "E"],

    cancelanniu: true,
    ////////////////////////////////
    page_show: false,
    navHeight: '',
    menuButtonInfo: {},
    searchMarginTop: 0, // 搜索框上边距
    searchWidth: 0, // 搜索框宽度
    searchHeight: 0,// 搜索框高度
    istrue: false,


    indicatorDots: true, // 是否显示指示点
    autoplay: true, // 是否自动切换
    interval: 1000, // 自动切换时间间隔
    duration: 100, // 滑动动画时长

  },





  // 展开搜索

  zhankaisearch() {

    this.setData({
      zhankaisearch2: true,
      search: "",
    })
  },
  Backoff() {

    wx.navigateBack({
      delta: 1 // 返回的层级，1表示返回上一页
    });

  },


  zhankaisearchoff() {

    this.setData({
      zhankaisearch2: true,
      search: "",
    })

  },




  //生命周期函数--监听页面加载！！！！！！！！！！！！！！
  onLoad: function (options) {
    var systeminfo = wx.getWindowInfo()
    console.log(options)
    var choosetitle = JSON.parse(options.choosetitle);
    var hotsearckeys = JSON.parse(options.hotsearckeys);
    var mysearch1 = app.userInfo.search.slice().reverse()
    var mysearch = mysearch1.slice(0, 10)
    console.log("lllllll", hotsearckeys)
    this.setData({
      mysearch,
      movehight: systeminfo.windowHeight,
      movehight2: systeminfo.windowHeight - 80,
      menuButtonInfo: wx.getMenuButtonBoundingClientRect(),
      choosetitle,
      hotsearckeys
    })

    // 获取每个热门标签的帖子数量
    this.getTagPostCounts();

  },





  // 获取滚动条当前位置！！！！！！！！！！！！！！
  onPageScroll: function (e) {
    //console.log(e)
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





  //管理封帖子

  guanlifengtiezi(e) {


    console.log(e.currentTarget.dataset)
    if (app.userInfo.userinfo.login != true) {
      return//没登录
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
    var mine = false
    var myid = app.userInfo._id
    for (var ii = 0; ii < app.glids.length; ii++) {
      if (app.glids[ii] == myid) {
        mine = true
        break
      }
    }
    if (mine == true) {
      wx.setClipboardData({
        data: e.currentTarget.dataset.ids,
        success(res) {
          console.log("复制成功")
        }
      })
      // var that=this
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
            var ssid = e.currentTarget.dataset.id//取到ssid
            var cc = e.currentTarget.dataset.nr
            if (cc.length == 0) {
              cc = '分享的' + e.currentTarget.dataset.tp + '张图片'
            }
            console.log("cc:", cc)
            wx.cloud.callFunction({
              name: "jubaoplus",
              data: {
                id: ssid,
                time: new Date().getTime(),//发布时间
                ywnr: cc,//这里没有判断空文本的情况！！！
                jbrid: app.userInfo._id,//举报人
                type: 'ss'
              }
            })
            wx.showToast({
              title: '封了',
              icon: 'none',
              duration: 3000
            })
            // setTimeout(that.shuaxin,2000)
          } else if (res.cancel) { console.log('用户点击取消') }
        }
      })
    }

  },





  //回到顶部！！！！！！！！！！！！！！
  goTop: function (e) {  // 一键回到顶部
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





  //刷新！！！！！！！！！！！！！！
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


  //生命周期函数--监听页面初次渲染完成
  onReady: function () {
    //写出一周前的时间戳
    var now = new Date().getTime()//现在的时间
    var yizhou = (now - 3600 * 7000 * 24)
    console.log("现在：", now)
    console.log("一周：", yizhou)
    this.setData({
      yizhou: yizhou
    })



    setTimeout(() => {
      this.setData({
        showList: true,
        loadingHidden: true,
      });
    }, 1500);




  },


  //生命周期函数--监听页面显示！！！！！！！！！！！！！！
  onShow: function () {

    //点赞页面返回更新点赞评论浏览状态
    var index = this.data.index
    var ss_xx = this.data.ss_xx
    var reping = app.ssinfo.reping


    //console.log("index::::",index)
    if (index >= 0 && reping == 2222) {
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
        index: -1,

      })
    }




  },






  //生命周期函数--监听页面隐藏
  onHide: function () {
    this.cancelSuggestionRequest()
  },

  //生命周期函数--监听页面卸载
  onUnload: function () {
    this.cancelSuggestionRequest()
  },






  //页面上拉触底事件的处理函数！！！！！！！！！！！！！！
  onReachBottom: function () {

    // if(this.data.jiazaizhong==false){
    // this.setData({
    //   jiazaizhong:true
    // })
    this.jiazai()

    // }
  },



  //跳转传参，传递板块名！！！！！！！！！！！！！！
  //跳转传参，传递板块名！！！！！！！！！！！！！！
  tiaozhuan(e) {
    //console.log(bankuai.currentTarget.dataset.ku)
    var choosetitle = e.currentTarget.dataset.choosetitle
    app.choosetitle1 = this.data.choosetitle
    console.log("ccccvvvvvvv", choosetitle)
    wx.navigateTo({
      url: "../plate1/plate1?choosetitle=" + choosetitle
    })
  },






  //加载数据(刷新状态下，data内ss_xx数组重新赋值)！！！！！！！！！！！！！！

  jiazai(shuaxin) {
    // wx.showLoading({
    //   title: '加载中...',
    //   mask:true
    // })
    var zuixinorzuire = this.data.zuixinorzuire
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
      //按照时间排取消时间限制，
      zuixinorzuire = "time"
      var yizhou = 0
      var openlocationtitle = db.command.neq("111")
    } else {
      //搜索派单信息
      zuixinorzuire = "time"
      var yizhou = this.data.yizhou
      var openlocationtitle = db.command.neq("")


    }



    db.collection('ss').where({
      'ss_xx.jubao.1': db.command.lte(19),
      time: db.command.gt(yizhou),
      "ss_xx.orderdetail.openlocationtitle": openlocationtitle

    }).orderBy(zuixinorzuire, 'desc')
      .skip(head).get().then(async (res) => {
        // console.log(res.data)


        //这里已经取到了相应的数组
        if (res.data == "") {
          this.setData({
            kong: true,
            // jiazaizhong:false
          })
          wx.stopPullDownRefresh({})
          wx.hideLoading({})

          return
        } else if (shuaxin == true) {
          //真刷新状态
          //var ss_xx=res.data
          //var ss_xx=await this.read(res.data)
          var ss_xx = await this.love(res.data)
          // console.log("😄1",ss_xx)
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


        for (var i = postStartIndex; i < ss_xx.length; i++) {
          var plxx = ss_xx[i].ss_xx.huifunr
          plxx.sort(function (a, b) {
            return b.pldianzannb - a.pldianzannb
          });
        }





        //写进本地
        this.setData({
          // ss_xx1:ss_xx1,
          ss_xx: ss_xx,
          kong: true,
          // jiazaizhong:false,
          zhankaisearch2: false
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





  //点击跳到详情！！！！！！！！！！！！！！
  xiangqing(e) {
    //console.log(id.currentTarget.dataset.id)
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

      var type = e.currentTarget.dataset.type
      wx.navigateTo({
        url: '/pages/bannerDetail/bannerDetail?title=' + title + "&type=" + type
      })

    } else {


      console.log("index:", index)
      if (love) {
        love = 'true'
      } else {
        love = 'false'
      }
      wx.navigateTo({
        url: "../plate2/plate2?id=" + id + "&fenxiang=false&liuyan=false&love=" + love + "&reping=" + reping + "&openid=" + openid + "&lzid=" + lzid + "&takeorderid=" + takeorderid + "&openlocationtitle=" + openlocationtitle + "&DONOT=000",
      })
      this.setData({
        index: index
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




  //点击热门标签
  // 点击热门搜索或历史记录
  hotkeys(e) {
    console.log(e.currentTarget.dataset.hotkeys)
    var a = e.currentTarget.dataset.hotkeys
    this.setData({
      search: a,
      zhankaisearch2: false // Hide search UI when clicked
    })
    this.search({ detail: { value: a } });
  },



  //搜索shijian
  search(e) {
    this.cancelSuggestionRequest()

    var searchcache = this.data.searchcache

    if (searchcache == "") {
      var searchcache = this.data.ss_xx
    }

    //查询值
    //console.log(e.detail.value)

    if (this.data.hottext) {


      var keywords = this.data.hottext
      var keywordsArray = keywords.split(' ').filter(Boolean); // 拆分关键词并过滤掉空字符串
      var text = keywordsArray.map(keyword => `.*${keyword}.*`).join('|'); // 生成正则表达式模式



      this.setData({
        shuaxin: keywords,
        search: keywords,
        hottext: ''
      })

    }
    else {
      var keywords = e.detail.value
      var keywordsArray = keywords.split(' ').filter(Boolean); // 拆分关键词并过滤掉空字符串
      var text = keywordsArray.map(keyword => `.*${keyword}.*`).join('|'); // 生成正则表达式模式

      this.setData({
        shuaxin: e.detail.value,
        search: e.detail.value,
        hottext: '',
        suggestionList: [], // Clear suggestions
        showSuggestions: false
      })

    }



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
    db.collection("ss").where(_.and([
      _.or([
        {
          "ss_xx.nr": {
            $regex: '.*' + text,
            $options: 'i'
          }
        },
        {
          "ss_xx.huifunr": _.elemMatch({
            wbnr: {
              $regex: '.*' + text,
              $options: 'i'
            }
          })
        }
      ]),
      {
        time: _.gt(yizhou)
      }

    ])).orderBy('time', 'desc').get().then(async (res) => {
      console.log(res.data)//这里一下取回了所有

      callCloudFunction('login', { action: 'recordSearch', keyword: keywords }).then(updateRes => {
        console.log('搜索记录已保存', updateRes)
        console.log('用户搜索记录已更新', updateRes);

        // Update Local Cache immediately
        if (!app.userInfo.search) { app.userInfo.search = []; }

        // Add to local app.userInfo if not exists
        if (app.userInfo.search.indexOf(keywords) === -1) {
          app.userInfo.search.push(keywords);
        }

        // Update Page Data (Recent Search List)
        // Reverse a copy for display, slice top 10
        const updatedMySearch = app.userInfo.search.slice().reverse().slice(0, 10);
        this.setData({
          mysearch: updatedMySearch
        });

      }).catch(updateErr => {
        console.error('保存搜索记录失败', updateErr);
      });



      wx.hideLoading({})
      var xx = await this.love(res.data)
      if (xx.length > 0) {
        this.setData({
          ss_xx: xx,
          zhankaisearch2: false,
        })

        wx.showToast({
          title: '搜索完毕',
          icon: "none"
        })
      } else {
        this.setData({
          // ss_xx:searchcache,
          // zhankaisearch2:true,

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

    this.goTop()
  },

  clearinput() {
    this.cancelSuggestionRequest()
    this.setData({
      zhankaisearch2: true,
      search: '',
      suggestionList: [],
      showSuggestions: false
    })
  },

  cancelSuggestionRequest() {
    if (this.suggestionTimer) {
      clearTimeout(this.suggestionTimer)
      this.suggestionTimer = null
    }
    this.suggestionRequestId = (this.suggestionRequestId || 0) + 1
  },


  // 生成高亮富文本
  generateRichText(keyword, searchText) {
    if (!keyword || !searchText) return [{ name: 'span', attrs: { class: 'suggestion-text' }, children: [{ type: 'text', text: keyword }] }];

    const output = [];
    const lowerKey = keyword.toLowerCase();
    const lowerSearch = searchText.toLowerCase();

    // Check if keyword starts with search text (Prefix match)
    if (lowerKey.startsWith(lowerSearch)) {
      // Matched prefix (Red)
      output.push({
        name: 'span',
        attrs: { style: 'color: #ff2442; font-weight: 500;' }, // Red Highlight
        children: [{ type: 'text', text: keyword.substring(0, searchText.length) }]
      });
      // Remaining text (Normal)
      output.push({
        name: 'span',
        attrs: { style: 'color: #333;' },
        children: [{ type: 'text', text: keyword.substring(searchText.length) }]
      });
    } else {
      // Fallback (shouldn't happen with strict prefix match, but just in case)
      output.push({
        name: 'span',
        attrs: { style: 'color: #333;' },
        children: [{ type: 'text', text: keyword }]
      });
    }
    return output;
  },

  // 获取本地匹配的联想词 (0延时)
  getLocalSuggestions(keyword) {
    if (!keyword || !keyword.trim()) return [];

    const lowerKey = keyword.toLowerCase();
    let matches = [];

    // 1. 搜索历史 (My Search)
    const myHistory = this.data.mysearch || [];
    myHistory.forEach(item => {
      const str = String(item);
      if (str.toLowerCase().startsWith(lowerKey)) {
        matches.push({
          keyword: str,
          count: 9999,
          type: 'history',
          richText: this.generateRichText(str, keyword) // Generate Rich Text
        });
      }
    });

    // 2. 热门搜索 (Hot Keys)
    // hotsearckeys structure check: wxml uses item._id
    const hotKeys = this.data.hotsearckeys || [];
    hotKeys.forEach(item => {
      const str = item._id || item; // adaption
      if (String(str).toLowerCase().startsWith(lowerKey)) {
        // Avoid duplicates from history
        if (!matches.find(m => m.keyword === String(str))) {
          matches.push({
            keyword: String(str),
            count: 8888,
            type: 'hot',
            richText: this.generateRichText(String(str), keyword) // Generate Rich Text
          });
        }
      }
    });

    return matches.slice(0, 5); // Limit local results
  },

  getValue(event) {
    const val = event.detail.value;
    this.cancelSuggestionRequest();
    const currentReqId = this.suggestionRequestId;

    this.setData({
      search: val,
      zhankaisearch2: true // Reset to search mode (hide results) when typing
    });

    if (!val || !val.trim()) {
      this.setData({ suggestionList: [], showSuggestions: false });
      return;
    }

    // 1. Immediate Local Feedback (0ms)
    const localResults = this.getLocalSuggestions(val);
    this.setData({
      suggestionList: localResults,
      showSuggestions: true
    });

    // 2. Debounced Cloud Fetch (300ms)
    this.suggestionTimer = setTimeout(() => {
      this.suggestionTimer = null;
      this.getSuggestions(val, currentReqId);
    }, 300);
  },

  // 获取云端联想词 (异步补充)
  getSuggestions(keyword, reqId) {
    if (!keyword || !keyword.trim()) return;

    wx.cloud.callFunction({
      name: 'getSearchSuggestions',
      data: { keyword: keyword }
    }).then(res => {
      // Race Condition Check: If newer input exists, discard this result
      if (reqId !== this.suggestionRequestId) {
        console.log('Discarding outdated cloud result', reqId);
        return;
      }

      console.log('Cloud API Result:', res.result);
      if (res.result && res.result.list) {
        const cloudList = res.result.list;
        const localList = this.data.suggestionList; // Current local results

        // Merge: Local + Cloud (Deduplicate)
        // Keep local (they are instant/high relevance), append cloud if not exists
        let mergedList = [...localList];
        cloudList.forEach(cloudItem => {
          const exists = mergedList.find(localItem => localItem.keyword === cloudItem.keyword);
          if (!exists) {
            // Generate Rich Text for Cloud Items
            cloudItem.richText = this.generateRichText(cloudItem.keyword, keyword);
            mergedList.push(cloudItem);
          } else {
            // Optional: update count if needed, or keep local high-priority metadata
          }
        });

        // Final Limit
        mergedList = mergedList.slice(0, 10);

        this.setData({
          suggestionList: mergedList,
          showSuggestions: true
        });
      }
    }).catch(err => {
      if (reqId === this.suggestionRequestId) {
        console.error('云联想失败', err);
      }
    });
  },

  // 点击联想词
  tapSuggestion(e) {
    const keyword = e.currentTarget.dataset.keyword;
    this.setData({
      search: keyword,
      showSuggestions: false
    });
    // Trigger search directly
    this.search({ detail: { value: keyword } });
  },

  // 搜索框聚焦
  onSearchFocus(e) {
    this.setData({
      zhankaisearch2: true
    });
    // If text exists, trigger suggestions immediately
    if (this.data.search && this.data.search.trim()) {
      const localResults = this.getLocalSuggestions(this.data.search);
      this.setData({
        suggestionList: localResults,
        showSuggestions: true
      });
    }
  },

  // 搜索框失焦
  onSearchBlur(e) {
    // Delay hiding to allow tap event to process
    setTimeout(() => {
      this.setData({ showSuggestions: false });
    }, 200);
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
    var id = e.currentTarget.dataset.id
    var index = e.currentTarget.dataset.index

    console.log(e.currentTarget.dataset)

    var obj = wx.getLaunchOptionsSync()
    // console.log('启动小程序的路径:',obj.path)
    // console.log('启动小程序的场景值:', obj.scene)
    // console.log('启动小程序的 query 参数:', obj.query)
    // console.log('来源信息:', obj.shareTicket)
    // console.log('来源信息参数appId:', obj.referrerInfo.appId)
    // console.log('来源信息传过来的数据:', obj.referrerInfo.extraData)

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
        title: '💡',
        content: '登录可进行操作，是否授权登录？',
        showCancel: true,
        confirmText: '是',
        confirmColor: '#20e606',
        cancelText: '否',
        cancelColor: '#8d8d8d',
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

  // 获取热门标签的帖子数量
  // 获取热门标签的帖子数量
  getTagPostCounts: function () {
    var that = this;
    var choosetitle = this.data.choosetitle;

    console.log("getTagPostCounts 开始执行");
    console.log("原始 choosetitle:", choosetitle);
    console.log("choosetitle 类型:", typeof choosetitle);
    console.log("choosetitle 是否为数组:", Array.isArray(choosetitle));

    // 将类似数组的对象转换为真正的数组
    var choosetitleArray = [];
    if (!Array.isArray(choosetitle) && typeof choosetitle === 'object') {
      // 如果是类似数组的对象（有数字键），转换为数组
      var keys = Object.keys(choosetitle).sort(function (a, b) {
        return parseInt(a) - parseInt(b); // 按数字顺序排序
      });

      for (var i = 0; i < keys.length; i++) {
        if (choosetitle.hasOwnProperty(keys[i])) {
          choosetitleArray.push(choosetitle[keys[i]]);
        }
      }
    } else if (Array.isArray(choosetitle)) {
      choosetitleArray = choosetitle;
    }

    console.log("转换后的数组:", choosetitleArray);

    if (choosetitleArray.length === 0) {
      console.log('没有找到有效的标签');
      return;
    }

    // 提取标签名称
    var tagsArray = choosetitleArray.map(function (item) {
      console.log("处理标签项:", item);
      return item.title11 || item;
    });

    console.log("提取的标签数组:", tagsArray);

    wx.cloud.callFunction({
      name: 'getTagPostCount',
      data: {
        tags: tagsArray
      },
      success: function (res) {
        console.log('云函数调用成功');
        console.log('云函数返回结果:', res);
        console.log('result 数据:', res.result);

        if (res.result && typeof res.result === 'object') {
          // 为每个标签项添加帖子数量
          var updatedChoosetitleArray = choosetitleArray.map(function (item) {
            var tagName = item.title11 || item;
            var tagData = res.result[tagName] || { total: 0, normal: 0, reported: 0 };
            console.log('标签:', tagName, '统计数据:', tagData);
            return {
              ...item,
              postCount: tagData.normal,  // 显示正常帖子数量
              totalCount: tagData.total,  // 总数量
              reportedCount: tagData.reported // 被举报数量
            };
          });

          // 将更新后的数组转换回原来的对象结构
          var updatedChoosetitle = {};
          for (var i = 0; i < updatedChoosetitleArray.length; i++) {
            updatedChoosetitle[i] = updatedChoosetitleArray[i];
          }

          console.log('更新后的 choosetitle:', updatedChoosetitle);
          that.setData({
            choosetitle: updatedChoosetitle
          });
        } else {
          console.log('云函数返回的数据格式不正确');
        }
      },
      fail: function (err) {
        console.error('获取标签帖子数量失败：', err);
      }
    });
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
    // mazhu is not defined in plate4.js, so we do nothing or could implement it if needed.
    console.log("mazhu tapped", e.detail);
    if (this.mazhu) {
      this.mazhu(e);
    }
  },
  // Debugging logger for suggestion list
  logSuggestionList(list) {
    console.log("Found suggestion list:", list);
    list.forEach((item, index) => {
      console.log(`Item ${index}: ${item.keyword}, Count: ${item.count}`);
    });
  },

})
