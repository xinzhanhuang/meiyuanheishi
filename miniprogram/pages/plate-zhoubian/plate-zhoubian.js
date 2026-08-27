var db = wx.cloud.database()
var app = getApp()
var _ = db.command
var utils = require('../../utils/util.js')
Page({
  //页面的初始数据
  data: {
    alldibutitle: ['发帖前先搜索，是黑市的基本礼仪哦～', '遇到感兴趣的帖子可以先马住～', '评论可以发图，甚至是GIF动图哦～', '举报到一定数值，帖子自动粉碎哦～',],
    star_data: [{
      id: 1,
      src: "cloud://tafaheishi-1gs4bxsvcf864035.7461-tafaheishi-1gs4bxsvcf864035-1316611774/标签/starnull.png"
    },
    {
      id: 2,
      src: "cloud://tafaheishi-1gs4bxsvcf864035.7461-tafaheishi-1gs4bxsvcf864035-1316611774/标签/starnull.png"
    },
    {
      id: 3,
      src: "cloud://tafaheishi-1gs4bxsvcf864035.7461-tafaheishi-1gs4bxsvcf864035-1316611774/标签/starnull.png"
    },
    {
      id: 4,
      src: "cloud://tafaheishi-1gs4bxsvcf864035.7461-tafaheishi-1gs4bxsvcf864035-1316611774/标签/starnull.png"
    },
    {
      id: 5,
      src: "cloud://tafaheishi-1gs4bxsvcf864035.7461-tafaheishi-1gs4bxsvcf864035-1316611774/标签/starnull.png"
    }

    ],

    font_count: '0/140',

    showModal: false,
    id: "",
    ss_xx: {},
    wbnr: "",
    star_num: "",
    remark_num: "",
    _openid: "9999999",
    _id: "9999999",
    zhoubianfenxiang: "false",
    //glopenid:"9999",
    glid: "9999",
    dianzan: false,
    input: "留下你的评论吧",
    xx: "",
    liuyan: false,
    ku: 'tianmeizhoubian',
    isAdmin: false,
    show: false,
    sortMethod: true,
    showDialog: false,
    groups: [],
    imgs: [],
    Imgs: [],
    focus: false,
    isKeyboardOpen: false,
    activeReplyId: '',
    voteNumberPerPerson111: 1,
    voteNumberPerPerson111: 1,
    option111: "A",
    istrue: false,
    istrue1: false,
    modalHidden111: true,
    cancelanniu: true,

    // 回首页按钮
    movehight: 500,
    movehight2: 500,

    // 键盘弹起

    statsuBarHeight: app.globalData.statsuBarHeight,
    headHeight: 40,
    chatListHeight: 0,
    keyboardHeight: 0,
    messageList: [],
    inutPanelHeight: 50,
    toView: "item0",
    curMessage: "",
    // theme:"",
    showKeyboardMask: false,
    isInputFocused: false, // Input focus state for UI visibility
  },


  //生命周期函数--监听页面加载
  onLoad: function (options) {
    const target = utils.getPostTarget(options, 'zhoubian');
    this.commentId = target.commentId;
    var id = target.postId;
    const isSharedEntry = options.zhoubianfenxiang === 'true' || options.zhoubianfenxiang === 'ture';

    console.log(options)
    app.fxssid = target.postId
    app.zhoubianfenxiang = options.zhoubianfenxiang
    var love = options.love
    var liuyan = options.liuyan
    if (liuyan == 'true') {
      console.log('留言真')
      this.setData({
        liuyan: true,
        ku: 'tj'
      })
    }

    console.log(liuyan)
    console.log(love)
    if (love == 'true') {
      var dianzan = true
    } else if (love == 'false') {
      var dianzan = false
    } else {
      var dianzan = false
    }

    if (app.zuiress_xx1) {
      var zuiress_xx1 = app.zuiress_xx1;
    }


    this.setData({
      zuiress_xx1,
      fenxiang: options.zhoubianfenxiang,
      dianzan: dianzan,
      id: target.postId
    })

    // Initialization logic from plate2.js
    var that = this;
    let alldibutitle = this.data.alldibutitle;
    if (alldibutitle) {
      let randomIndex = Math.floor(Math.random() * alldibutitle.length);
      var dibutitle = alldibutitle[randomIndex];
    } else {
      var dibutitle = '发帖前先搜索，是黑市的基本礼仪哦～';
    }

    // Heishi Group Chat
    if (options.heishiweixin) {
      var heishiweixin = options.heishiweixin;
    } else {
      var heishiweixin = app.heishiweixin;
    }

    // Banner List
    if (isSharedEntry && options.bannerList2) {
      var bannerList2 = JSON.parse(decodeURIComponent(options.bannerList2));
    } else {
      var bannerList1 = app.bannerList2;
      if (bannerList1) {
        var bannerList2 = bannerList1.sort(() => Math.random() - 0.5);
      } else {
        var bannerList2 = false;
      }
    }

    this.setData({
      bannerList2,
      dibutitle,
      heishiweixin,
      msgnb: app.userInfo.msgnb || [0, 0],
    });

    wx.onKeyboardHeightChange(res => {

      if (res.height > 0) {
        this.setData({
          keyboardHeight: res.height,
          showKeyboardMask: true  // 键盘弹起，显示遮罩
        });
      } else {
        this.setData({
          keyboardHeight: res.height,
          activeReplyId: '',  // 键盘关闭，清除高亮
          showKeyboardMask: false  // 键盘收起，隐藏遮罩
        });
      }

      this.setChatListHeight();
    });


    var systeminfo = wx.getSystemInfoSync()
    //console.log(systeminfo.windowHeight)
    this.setData({
      movehight: systeminfo.windowHeight,
      movehight2: systeminfo.windowHeight - 80
    })

    //判断是否为分享来的！！！！！！！！！！！！！
    if (isSharedEntry) {
      this.jiazai(id)
      if (app.userInfo._openid) {
        this.setData({ _openid: app.userInfo._openid, id, _id: app.userInfo._id })
      } else {
        wx.cloud.callFunction({
        name: 'login',
        data: {}
      }).then((res) => {
        return db.collection("users").where({
          _openid: res.result.openid
        })
      }).then((res) => {
        if (res.data[0]) app.userInfo = Object.assign(app.userInfo, res.data[0])
        if (app.userInfo._openid) {
          this.setData({ _openid: app.userInfo._openid, id, _id: app.userInfo._id })
          return
        }
        app.setPendingPostTarget({ postId: id, postType: 'zhoubian', commentId: this.commentId, source: 'share', liuyan: liuyan === 'true' })
        wx.showToast({ title: '还未登录', icon: 'none', duration: 1500 })
        app.zhoubianfenxiang = "true"
      }).catch((err) => {
        console.warn('周边分享入口登录状态读取失败', err)
      })
      }
    } else {
      var _openid = app.userInfo._openid
      this.setData({
        _openid: _openid,
        _id: app.userInfo._id
      })
      //console.log("iddd",options.id)
      wx.cloud.callFunction({
        name: "look",
        data: {
          id: id,
          type: 'ss'
        }
      });
      this.jiazai(id)
    }

    //判断是否有了glid
    if (app.glid == "9999") {
      db.collection('system').where({ '_id': '001' })
        .get().then((res) => {
          //console.log(res.data[0].tp)
          this.setData({
            glid: res.data[0].glid
          })
          app.glid = res.data[0].glid
        })
    } else {
      this.setData({
        glid: app.glid

      })
    }
    //判断是否是管理员
    if (app.userInfo && app.glids) {
      var mine = false
      var myid = app.userInfo._id
      for (var ii = 0; ii < app.glids.length; ii++) {
        if (app.glids[ii] == myid) {
          mine = true
          break
        }
      }
      this.setData({
        isAdmin: mine
      })
    }
  },
  //加载对应说说id的内容
  jiazai(id) {
    if (!id) {
      this.setData({ ss_xx: 0 })
      return
    }
    var ku = this.data.ku
    //console.log("哭哭哭：",ku)
    db.collection(ku).where({ '_id': id }).get().then(async (res) => {
      console.log("加载的：", res.data[0])


      if (res.data[0] != undefined) {
        //var ss_xx=await this.read(res.data[0])//读缓存图
        var ss_xx = await this.readd(utils.normalizePost(res.data[0]))//处理超长名

        // Initialize tp2 for main post images
        if (ss_xx.ss_xx.tp && ss_xx.ss_xx.tp.length > 0) {
          let oldPost = this.data.ss_xx && this.data.ss_xx.ss_xx;
          ss_xx.ss_xx.tp2 = utils.createImageLoadStates(ss_xx.ss_xx.tp, oldPost);
        }

        // Initialize tp2 for comments and replies
        if (ss_xx.ss_xx.huifunr && ss_xx.ss_xx.huifunr.length > 0) {
          let oldHuifunr = this.data.ss_xx && this.data.ss_xx.ss_xx && this.data.ss_xx.ss_xx.huifunr;
          ss_xx.ss_xx.huifunr.forEach((item, index) => {
            // PATCH: Add pinglunID/like fields for legacy comments to show UI
            if (!item.pinglunID) {
              // Generate a stable synthetic ID for UI rendering
              item.pinglunID = (ss_xx._id || id) + "_" + index;
              if (!item.dianzhanID) item.dianzhanID = [];
              if (!item.pldianzannb) item.pldianzannb = 0;
            }

            let oldItem = oldHuifunr ? oldHuifunr[index] : null;
            if (item.tp && item.tp.length > 0) {
              item.tp2 = utils.createImageLoadStates(item.tp, oldItem, false);
            }
            if (item.huifu && item.huifu.length > 0) {
              item.huifu.forEach((subItem, subIdx) => {
                let oldSubItem = oldItem && oldItem.huifu && oldItem.huifu[subIdx];
                if (subItem.tp && subItem.tp.length > 0) {
                  subItem.tp2 = utils.createImageLoadStates(subItem.tp, oldSubItem, false);
                }
              });
            }
          });

          // PATCH: Check like status for current user
          this.pllove(ss_xx.ss_xx.huifunr);
          var xx = ss_xx.ss_xx.huifunr;
          // 评论排序
          xx.sort(function (a, b) {
            return a.pldianzannb - b.pldianzannb;
          });
        }
        var dianzan = this.data.dianzan
        var genxinid = ss_xx._id
        console.log("hahhahahahah", genxinid)
        if (dianzan != -1 && this.data.liuyan == false) {
          //非总列表进入
          console.log("非列表进入")
          console.log("全部id", ss_xx.ss_xx.dianzanid, ss_xx)
          console.log(this.data._openid)

          var yn = ss_xx.ss_xx.dianzanid.indexOf(app.userInfo._id)
          console.log("非列表进入", yn)

          if (yn != -1) {
            this.setData({
              dianzan: true
            })
          } else {
            this.setData({
              dianzan: false
            })
          }
        }

        if (this.data.liuyan == false) {
          app.ssinfo.lovenb = ss_xx.ss_xx.dianzannb
          app.ssinfo.plnb = ss_xx.ss_xx.huifunb
          app.ssinfo.looknb = ss_xx.ss_xx.look
          app.ssinfo.remark_num = ss_xx.ss_xx.remark_num
          app.ssinfo.huifunr = ss_xx.ss_xx.huifunr
          app.ssinfo.ss_xx = ss_xx
          app.ssinfo.tp = ss_xx.ss_xx.tp
          if (!ss_xx.ss_xx.jg) {
            app.ssinfo.jg = "刚刚在天美社区看到个帖子，真是绝了！"
          } else {
            app.ssinfo.jg = ss_xx.ss_xx.jg
          }

          if (res.data[0].ss_xx.jubao[1] < 10) {
            this.setData({
              ss_xx: ss_xx
            }, () => utils.jumpToComment(this, this.commentId))
          } else {
            this.setData({
              ss_xx: 0
            })
          }
        } else {
          this.setData({
            ss_xx: ss_xx
          }, () => utils.jumpToComment(this, this.commentId))
        }

      } else {
        this.setData({
          ss_xx: 0
        })
      }
    }).catch((err) => {
      console.error('加载周边帖子失败', err)
      this.setData({ ss_xx: 0 })
      wx.showToast({ title: '加载失败，请稍后重试', icon: 'none' })
    })
  },

  // 图片加载成功回调
  imageOnLoad(e) {
    const index = e.currentTarget.dataset.index;
    const updateKey = `ss_xx.ss_xx.tp2[${index}].loaded`;
    this.setData({
      [updateKey]: true
    });
  },

  // 评论图片加载成功回调
  imageOnLoadComment(e) {
    const index0 = e.currentTarget.dataset.index0;
    const index1 = e.currentTarget.dataset.index1;
    if (index1 !== undefined) {
      const updateKey = `ss_xx.ss_xx.huifunr[${index0}].huifu[${index1}].tp2[0].loaded`;
      this.setData({
        [updateKey]: true
      });
    } else {
      const updateKey = `ss_xx.ss_xx.huifunr[${index0}].tp2[0].loaded`;
      this.setData({
        [updateKey]: true
      });
    }
  },

  // 跳转广告详情
  toBannerDetail(e) {
    const { appid, type, title } = e.currentTarget.dataset;
    if (type === 'miniprogram') {
      wx.navigateToMiniProgram({
        appId: appid,
        path: '',
        success(res) {
          console.log('Opened mini program successfully');
        }
      });
    } else {
      // Handle other types if necessary
      console.log('Banner clicked:', appid, type, title);
    }
  },

  /**
   * 通用输入绑定
   */
  bindFieldInput(e) {
    const field = e.currentTarget.dataset.field;
    const value = e.detail.value;
    const path = `ss_xx.ss_xx.orderdetail.${field}`;
    this.setData({
      [path]: value
    });
  },

  /**
   * 修改信息提交
   */
  async changewbnrtijiao() {
    // 获取当前数据
    const detail = this.data.ss_xx.ss_xx.orderdetail;
    const textwbnr = this.data.ss_xx.ss_xx.nr;

    // 构造值对象
    const biaodan = {
      lianxi: detail && detail.lianxi,
      weixin: detail && detail.weixin,
      jg: detail && detail.jg,
      ordertitle: detail && detail.ordertitle,
      changewbnr: textwbnr
    };

    var ordertitle = biaodan.ordertitle;
    var phone = biaodan.lianxi;
    var jg = biaodan.jg;
    var weixin = biaodan.weixin;
    var openlocationtitle = this.data.ss_xx.ss_xx.orderdetail.openlocationtitle;
    var that = this;

    if (!this.checkFullLogin()) return;

    // 检测账号是否被封
    var ban = app.userInfo.ban;
    if (ban == true) {
      wx.showToast({
        title: '账号被封！',
        icon: 'none',
        duration: 7000
      });
      return;
    }

    wx.showLoading({
      title: '传送中...',
      mask: true
    });
    // use existing checkStr
    var text = textwbnr + (ordertitle || '') + (weixin || '');
    var checkOk = await this.checkStr(text);
    // 审核不通过
    if (!checkOk) {
      wx.hideLoading({});
      wx.showToast({
        title: '含有违法违规内容',
        icon: 'none',
        duration: 4000,
      });
      return;
    }
    wx.showLoading({
      title: '快送到了...',
      mask: true
    });

    if (!openlocationtitle) {
      if (textwbnr.length == 0) {
        wx.showToast({
          title: '再多说点吧！',
          icon: 'none',
          duration: 800,
        });
        return;
      }

      db.collection(this.data.ku).doc(that.data.id).update({
        data: {
          'ss_xx.nr': textwbnr
        }
      }).then(res => {
        wx.showToast({
          title: '修改成功',
        });
        that.setData({
          "ss_xx.ss_xx.nr": textwbnr,
          istrue: false
        });
        app.shuaxin = true;
      });
    }

    if (openlocationtitle) {
      if (!phone && !weixin) {
        wx.showToast({
          title: '至少一个联系方式',
          icon: 'none',
          duration: 800,
        });
        return;
      } else if (ordertitle.length < 1) {
        wx.showToast({
          title: '标题',
          icon: 'none',
          duration: 800,
        });
        return;
      } else if (jg <= 2 && jg == "") {
        wx.showToast({
          title: '赏金不小于2元',
          icon: 'none',
          duration: 800,
        });
        return;
      }

      db.collection(this.data.ku).doc(that.data.id).update({
        data: {
          'ss_xx.nr': textwbnr,
          'ss_xx.orderdetail.ordertitle': ordertitle,
          'ss_xx.orderdetail.phone': phone,
          'ss_xx.orderdetail.jg': jg,
          'ss_xx.orderdetail.weixin': weixin,
        }
      }).then(res => {
        wx.showToast({
          title: '修改成功',
        });

        that.setData({
          'ss_xx.ss_xx.nr': textwbnr,
          'ss_xx.ss_xx.orderdetail.ordertitle': ordertitle,
          'ss_xx.ss_xx.orderdetail.phone': phone,
          'ss_xx.ss_xx.orderdetail.jg': jg,
          'ss_xx.ss_xx.orderdetail.weixin': weixin,
          istrue: false
        });

        app.shuaxin = true;
      });
    }
  },

  /**
   * 打开修改信息弹窗
   */
  openchangeinformation() {
    console.log("openchangeinformation called");
    var _id = app.userInfo._id;
    // 检测是否是自己的
    var mine = this.data.isAdmin;

    // 条件：2.自己的帖子。3.自己是管理员
    var postLzid = this.data.ss_xx && this.data.ss_xx.ss_xx ? this.data.ss_xx.ss_xx.lzid : '';

    if (mine == true || (_id && postLzid && _id == postLzid)) {
      console.log("Permission granted, opening dialog");
      var s = this.data.ss_xx.ss_xx.nr ? this.data.ss_xx.ss_xx.nr.length : 0;
      var y = s + "/" + 599;

      this.setData({
        show: false,
        istrue: true,
        istrue1: true,
        sy: y
      });
    } else {
      console.log("Permission denied");
      wx.showToast({
        title: '不是你的帖子',
        icon: 'none',
        duration: 800
      });
      this.setData({
        show: false,
      });
    }
  },

  /**
   * 实时获取input,写到data中储存为wbnr
   */
  changewbnr(e) {
    var s = e.detail.value.length;
    var y = s + "/" + 599;
    this.setData({
      changewbnr: e.detail.value,
      'ss_xx.ss_xx.nr': e.detail.value,
      sy: y
    });
  },

  modalConfirm: function () {
    this.setData({
      modalHidden111: true
    });
  },

  // 提示关注公众号
  noticet() {
    this.setData({
      modalHidden111: false
    });
  },



  //点击跳转到详情进行阅读
  tiaozhuan(e) {
    //console.log(e.currentTarget.dataset.address)
    var address = e.currentTarget.dataset.address
    var id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '../tuijian/detail/detail?address=' + address,
    })

    //添加浏览数
    wx.cloud.callFunction({
      name: "look",
      data: {
        id: id,
        type: 'tj'
      }
    })
  },


  //   打开地图导航
  openLocation(e) {
    var latitude = Number(e.currentTarget.dataset.latitude)
    var longitude = Number(e.currentTarget.dataset.longitude)
    var weizhi = e.currentTarget.dataset.weizhi
    wx.openLocation({
      latitude: latitude,
      longitude: longitude,
      scale: 18,
      name: weizhi
    })
  },

  // 预览图片
  previewImg: function (e) {
    //获取当前图片的下标
    //console.log(e.currentTarget.dataset.tp)
    var index = e.currentTarget.dataset.tp[0];
    //所有图片
    var imgs = e.currentTarget.dataset.tp[1];

    wx.previewImage({
      //当前显示图片
      current: imgs[index],
      //所有图片
      urls: imgs
    })
  },


  //删除评论



  //文本内容合法性检测
  async checkStr(text) {
    try {
      var res = await wx.cloud.callFunction({
        name: 'checkStr',
        data: {
          text: text,
        }
      });
      //console.log(res.result.errCode);
      if (res.result.errCode == 0)
        return true;
      return false;
    } catch (err) {
      console.log(err);
      return false;
    }


  },






  /**
   * 文本内容合法性检测
   */
  async checkStr(text) {
    try {
      var res = await wx.cloud.callFunction({
        name: 'checkStr',
        data: {
          text: text,
        }
      });
      if (res.result.errCode == 0)
        return true;
      return false;
    } catch (err) {
      console.log(err);
      return false;
    }
  },

  /**
   * 发送评论 (Adapted from Plate2)
   */
  async fasong() {
    // 1. 未登录检测
    // if (!this.checkFullLogin()) return; // Assuming checkFullLogin exists or add it

    var text = this.data.wbnr;
    var imgs = this.data.imgs;

    if (text.length == 0 && imgs.length == 0) {
      wx.showToast({
        title: '没说什么',
        icon: 'none',
        duration: 800,
      });
      return;
    }

    // 检测账号是否被封
    if (app.userInfo.ban == true) {
      wx.showToast({
        title: '账号被封！',
        icon: 'none',
        duration: 7000
      });
      return;
    }

    wx.showLoading({
      title: '传送中...',
      mask: true
    });

    // 2. 文本审核
    if (text.length != 0) {
      var checkOk = await this.checkStr(text);
      if (!checkOk) {
        wx.hideLoading({});
        wx.showToast({
          title: '含有违法违规内容',
          icon: 'none',
          duration: 4000,
        });
        return;
      }
    }

    // 3. 图片审核
    var img = this.data.imgs;
    var that = this;
    that.setData({ Imgs: [] });

    if (img.length != 0) {
      var index = img[0].lastIndexOf(".");
      var ext = img[0].substring(index + 1);
      var imageformat = (ext.toLowerCase() === "gif");

      var imgok;
      if (!imageformat) {
        imgok = await that.imgcheck();
        if (!imgok) {
          wx.hideLoading({});
          wx.showToast({ title: '图片检测出现问题', icon: 'none', duration: 2000 });
          return;
        }
      } else {
        imgok = await that.GIFimgcheck();
        if (!imgok) {
          wx.hideLoading({});
          wx.showToast({ title: '动图检测出现问题', icon: 'none', duration: 2000 });
          return;
        }
      }
    }

    wx.showLoading({
      title: '快送到了..',
      mask: true
    });

    // 4. 准备评论数据
    var louzhu = false;
    var niming = false;
    if (app.userInfo._id == this.data.ss_xx.ss_xx.lzid) {
      louzhu = true;
      niming = this.data.ss_xx.ss_xx.niming1;
    }

    var pinglunguode = await this.fasongqian(app.userInfo._id);
    var first = JSON.stringify(pinglunguode).includes(this.data.id);

    var name = (app.userInfo._id == this.data.ss_xx.ss_xx.lzid) ? "楼主" : app.userInfo.userinfo.username;
    var star_num = this.data.star_num;
    var star_data = this.data.star_data;
    console.log("this.data.ss_xx.ss_xx.zilei", this.data.ss_xx.ss_xx.zilei)
    var pinglunnr = {
      isorder: this.data.ss_xx.ss_xx.orderdetail && this.data.ss_xx.ss_xx.orderdetail.ordertitle ? true : false,
      dianzhanID: [],
      pldianzannb: 0,
      pinglunID: this.data.id + new Date().getTime(),
      liuyan: this.data.liuyan,
      zbtitle: this.data.ss_xx.ss_xx.zbtitle,
      zilei: this.data.ss_xx.ss_xx.zilei,
      photo: app.userInfo.userinfo.userphoto,
      name: name,
      time: new Date().getTime(),
      plrid: app.userInfo._id,
      wbnr: text,
      zhuanye: app.userInfo.userinfo.zhuanye,
      ywnr: this.data.ss_xx.ss_xx.nr,
      star_num: star_num,
      star_data: star_data,
      louzhu: louzhu,
      niming: niming,
      ssid: this.data.id,
      lzid: this.data.ss_xx.ss_xx.lzid,
      lv: 0,
      huifu: [],
      tp: [],
      path: "/pages/plate-zhoubian/plate-zhoubian?id=" + this.data.id + "&zhoubianfenxiang=true&liuyan=" + this.data.liuyan
    };

    if (this.data.liuyan == true) {
      pinglunnr.ywnr = "【推文】" + this.data.ss_xx.title;
    }
    if (!pinglunnr.ywnr || pinglunnr.ywnr.length == 0) {
      pinglunnr.ywnr = '分享的' + (this.data.ss_xx.ss_xx.tp ? this.data.ss_xx.ss_xx.tp.length : 0) + '张图片';
    }

    var pd = [first, "", ""];
    var riqi = utils.dateFormat(pinglunnr.time, "yyyy-MM-dd hh:mm");
    pinglunnr.riqi = riqi;

    var xx = this.data.xx;
    if (xx && xx != "") {
      pd[1] = xx.lv0;
      pd[2] = xx.time;
      var lv = xx.lv;
      pinglunnr.bhfpl = xx.wbnr;
      pinglunnr.bhfid = xx.id;
      if (lv == 0) {
        pinglunnr.lv = 1;
        var index = this.data.index;
        var zhankai = "ss_xx.ss_xx.huifunr[" + index + "].zhankai";
        this.setData({ [zhankai]: true });
      } else {
        pinglunnr.lv = 2;
        pinglunnr.yuanname = pinglunnr.name;
        pinglunnr.name = pinglunnr.name + " 回复 " + xx.name;
      }
    }

    // 5. 上传图片 (Plate2 style with Imgs check)
    var Imgs = that.data.Imgs;
    if (Imgs && Imgs.length != 0) {
      var fileID = [];
      var time = new Date().getTime();
      const uploadPromises = Imgs.map((filePath, i) => {
        return new Promise((resolve, reject) => {
          let ext = filePath.substring(filePath.lastIndexOf(".") + 1).toLowerCase();
          if (!ext || ext.length > 4) ext = "jpg";
          const cloudPath = "ss_img1/" + app.userInfo._id + "-" + time + "-" + i.toString() + "." + ext;

          wx.cloud.uploadFile({
            cloudPath: cloudPath,
            filePath: filePath,
            success: res => {
              console.log('上传成功：', res);
              resolve(res.fileID);
            },
            fail: err => {
              console.error("上传失败：", err);
              reject(err);
            }
          });
        });
      });

      try {
        fileID = await Promise.all(uploadPromises);
        pinglunnr.tp = fileID;
        this.fbzbpj(pinglunnr, pd); // Use existing fbzbpj
      } catch (err) {
        wx.hideLoading();
        wx.showToast({ title: '图片上传失败', icon: 'none' });
        return;
      }
    } else {
      this.fbzbpj(pinglunnr, pd);
    }

    wx.hideLoading({});

    // 6. 更新本地 UI
    var huifunr = this.data.ss_xx.ss_xx.huifunr;
    app.ssinfo.plnb++;
    var xx_data = this.data.ss_xx;
    xx_data.ss_xx.huifunb = app.ssinfo.plnb;
    this.setData({ ss_xx: xx_data });

    if (pd[1] != "") {
      var index = this.data.index;
      huifunr[index].huifu.push(pinglunnr);
      huifunr[index].huifunb++;
    } else {
      huifunr.push(pinglunnr);
    }

    this.setData({
      "ss_xx.ss_xx.huifunr": huifunr,
      wbnr: "",
      xx: "",
      imgs: [], // Clear images
      input: "留下你的评论吧",
      activeReplyId: '',  // 清空高亮
      focus: false  // 收起键盘
    }, () => {
      // 推送订阅弹窗
      // 订阅通知
      var _this = this;
      wx.showModal({
        title: '',
        content: '评论成功👏',
        showCancel: false,
        confirmText: 'ok',
        confirmColor: '#FF4D49',
        cancelText: '否',
        cancelColor: '#8b8b8b',
        success(res) {
          if (res.confirm) {
            // console.log('用户点击确定')
            _this.allowup();
            return true;
          } else if (res.cancel) {
            // console.log('用户点击取消')
            return false;
          }
        }
      });
    });


    //console.log(this.data.ss_xx)
    if (star_num > 0) {
      var huifunrnum = app.ssinfo.huifunr.length
      var star_num = Number(this.data.star_num) // 获取用户新评分
      var ss_xx = app.ssinfo.ss_xx
      var genxinid = ss_xx._id

      // console.log("😄hahhahahahah",huifunrnum,star_num)
      if (huifunrnum == 1) {
        var remark_num123 = star_num.toPrecision(3)// 所有评分之和除以总评论次数（含小数点）
        var int = Math.floor(remark_num123);  // 向下取整-得到整颗星的个数
        var percent = (remark_num123 - int) * 100;  // 非整颗星的百分比 

        // console.log("hahhahahahah",genxinid)

        db.collection("tianmeizhoubian").doc(genxinid).update({
          data: {
            "ss_xx.remark_num": remark_num123,
            "ss_xx.percent": percent,
            "ss_xx.int": int,
          }
        }).then(res => {
          console.log('更新成功')
          // this.setData({
          // 	number: 2,
          // 	num: 2,
          // })
        }).catch(err => {
          console.log('更新失败', err)//失败提示错误信息
        })

      } else if (huifunrnum > 1) {
        var remark_num = app.ssinfo.remark_num// 回复人数 0、1、2
        var huifunrnum1 = Number(huifunrnum) - 1
        var remark_num1 = Number(remark_num)     // 获取的评分
        var totalstar_num = remark_num1 * huifunrnum1// 之前所有评分之和
        var newstar_num = Number(totalstar_num) + star_num // 之前评分和+新用户评分
        var gengxin = newstar_num / huifunrnum;      // 所有评分之和除以总评论次数
        var remark_num123 = gengxin.toPrecision(3)    // 所有评分之和除以总评论次数（含小数点）
        var int = Math.floor(remark_num123);  // 向下取整-得到整颗星的个数
        var percent = (remark_num123 - int) * 100;  // 非整颗星的百分比

        // console.log("3成功hahahaha", int,percent)
        // console.log("😄哈哈哈哈哈哈哈哈",remark_num123,newstar_num,remark_num,huifunrnum1,star_num,this.data._id)
        // console.log("hahhahahahah",genxinid)

        db.collection("tianmeizhoubian").doc(genxinid).update({
          data: {
            "ss_xx.remark_num": remark_num123,
            "ss_xx.percent": percent,
            "ss_xx.int": int,
          }
        }).then(res => {
          console.log('更新成功')
          // this.setData({
          // 	number: 2,
          // 	num: 2,
          // })
        }).catch(err => {
          console.log('更新失败', err)//失败提示错误信息
        })
      }
    }

    app.shuaxin = true
  },



  /**
   * 增加授权
   */
  allowup(e) {
    var dier = 'hs60e8rl8z2e_dMIRqBgT5izdt7qw_e9O3Y8xWFh9pY';
    var tmplIds = this.data.tmplIds;

    var that = this;
    wx.requestSubscribeMessage({
      tmplIds: tmplIds,
      success(res) {
        console.log("订阅消息API调⽤成功：", res, "up");

        var msgnb = that.data.msgnb;
        console.log(res[dier]);

        if (res[dier] == 'accept') {
          // 第二个模板,回复
          msgnb[1]++;
        } else if (res[dier] == 'reject') {
          wx.showToast({
            title: '您拒绝回复通知',
            icon: 'none',
            duration: 1000
          });
        }

        db.collection('users').doc(app.userInfo._id).update({
          data: {
            msgnb: msgnb,
            // allow:allow
          }
        });
        console.log('增加了所有授权');
      },

      fail(res) {
        console.log("订阅消息API调⽤失败：", res);
        var errCode = res.errCode;
        if (errCode == 20004) {
          wx.showToast({
            title: '您拒绝接收消息',
            icon: 'none'
          });
          this.turrenoff();
        }
      }
    });
  },


  /**
   * 弹出框蒙层截断touchmove事件
   */
  preventTouchMove: function () {
  },




  //发送前刷新内容
  async fasongqian(e) {
    //console.log(e)
    return db.collection('users').doc(e).field({ pinglunguode: true }).get().then((res) => {
      // 只获取 pinglunguode 字段，不再覆盖整个 app.userInfo
      return res.data ? res.data.pinglunguode || [] : [];
    }).catch(() => []);
  },




  //回复别人的评论1
  huifu(e) {
    //console.log("index:",e.currentTarget.dataset.index)
    //console.log("index1:",e.currentTarget.dataset.index1)
    //console.log(e.currentTarget.dataset.xx)//这是评论的全部内容


    var index1 = e.currentTarget.dataset.index1
    var xx = e.currentTarget.dataset.xx
    var xx1 = e.currentTarget.dataset.xx1
    console.log("xx:", e.currentTarget.dataset.xx)
    console.log("xx1:", e.currentTarget.dataset.xx1)
    if (index1 == undefined) {
      //这是回复lv0
      var name = xx.name
      xx.id = xx.plrid
      xx.lv0 = xx.plrid
    } else {
      xx.wbnr = xx1.wbnr
      xx.id = xx1.plrid
      xx.lv0 = xx.plrid

      //这是回复lv1,2
      console.log("q", xx.lv)
      xx.lv = xx1.lv
      console.log("h", xx.lv)
      if (xx1.lv == 1) {
        var name = xx1.name
        console.log("333")
      } else {
        var name = xx1.yuanname
        console.log("444")
      }
    }

    xx.name = name//此处特殊整合信息！！！
    console.log("存下：", xx)

    //拉起键盘进行回复
    this.setData({
      input: "回复 " + name,
      focus: true,//拉起键盘
      huifukuang: true,//显示回复框   
      xx: xx,
      index: e.currentTarget.dataset.index,
    })
  },

  //失去焦点，收起键盘
  //键盘收起
  setChatListHeight() {
    this.setData({

      chatListHeight: app.globalData.sysHeight - app.globalData.statsuBarHeight - this.data.headHeight - this.data.keyboardHeight - this.data.inutPanelHeight
    })
  },
  hideKeyboard() {
    wx.hideKeyboard();
    this.hideMediaPanel();
  },
  // 点击键盘遮罩，收起键盘
  hideKeyboard() {
    // 判断输入框是否有内容
    const hasContent = this.data.wbnr && this.data.wbnr.trim().length > 0;

    // 如果输入框没有内容，且处于回复状态（placeholder包含"回复"），清空回复相关内容
    if (!hasContent && this.data.input && this.data.input.includes('回复')) {
      this.setData({
        focus: false,  // 移除输入框焦点，收起键盘
        input: '留下你的评论吧',  // 恢复默认placeholder
        xx: null,  // 清空回复对象
        index: null,  // 清空回复索引
        activeReplyId: ''  // 清空高亮
      });
    } else {
      // 只收起键盘，不清空回复状态
      this.setData({
        focus: false  // 移除输入框焦点，收起键盘
      });
    }
  },

  getInput(e) {
    let value = e.detail.value;
    this.setData({
      curMessage: value
    });
  },
  send() {
    let curMessage = this.data.curMessage;
    if (curMessage.trim() === "") {
      wx.showToast({
        title: '请输入聊天内容',
        duration: 2000,
        icon: "none"
      })
      return;
    }
    let messageList = this.data.messageList;
    messageList.push(curMessage);
    this.setData({
      curMessage: "",
      messageList: messageList
    })
  },








  //展开评论
  zhankai(e) {
    console.log(e.currentTarget.dataset.index)//该条评论所在数组的下表
    var index = e.currentTarget.dataset.index
    var zhankai = "ss_xx.ss_xx.huifunr[" + index + "].zhankai"
    //console.log(zhankai)
    this.setData({
      [zhankai]: true,
    })
  },
  //收起评论
  shouqi(e) {
    console.log(e.currentTarget.dataset.index)//该条评论所在数组的下表
    var index = e.currentTarget.dataset.index
    var zhankai = "ss_xx.ss_xx.huifunr[" + index + "].zhankai"
    //console.log(zhankai)
    this.setData({
      [zhankai]: false,
    })
  },



  //用云函数发表评论
  async fbzbpj(pinglunnr, pd) {
    try {
      var res = await wx.cloud.callFunction({
        name: 'fbzbpj',
        data: {
          pinglunnr: pinglunnr,
          pd: pd
        }
      });
      console.log(res);
      return res.result
    } catch (err) {
      console.log(err);
      return false;
    }

  },



  //实时获取input,写到data中储存为wbnr
  wbnr(e) {
    //console.log(e.detail.value)
    this.setData({
      wbnr: e.detail.value
    })
  },


  //长名字显示处理
  async readd(e) {
    var nr = e
    //先循环每一个ss
    var chang = nr.ss_xx.huifunr.length
    //判断评论!=""则进行下面
    if (chang != 0) {
      var huifunr = nr.ss_xx.huifunr
      //对huifunr循环查询判断name长度超长就加。。。11个为上限
      for (var ii = 0; ii < huifunr.length; ii++) {
        var l = huifunr[ii].name.length
        //console.log("长命自检测3",l,huifunr[ii].name)
        //console.log("path:",path)
        if (l > 11) {
          console.log("改了", nr.ss_xx.huifunr[ii].name)
          nr.ss_xx.huifunr[ii].name = nr.ss_xx.huifunr[ii].name.substring(0, 11) + "..."
          console.log("改了", nr.ss_xx.huifunr[ii].name)
        }
        if (huifunr[ii].huifu.length > 0) {
          //有回复的回复
          for (var iii = 0; iii < huifunr[ii].huifu.length; iii++) {
            var l = huifunr[ii].huifu[iii].name.length
            console.log(iii, "长命自检测", l, huifunr[ii].huifu[iii].name)
            if (l > 15) {
              //总长度超长，如果为回复类型要截取两者name
              console.log("改了", nr.ss_xx.huifunr[ii].huifu[iii].name)
              var name = nr.ss_xx.huifunr[ii].huifu[iii].name
              var yuanname = nr.ss_xx.huifunr[ii].huifu[iii].yuanname
              var wz = name.indexOf("回复")
              console.log("😄😁", name.indexOf("回复"))
              if (wz > 4) {
                //需要对前面修剪
                console.log("位置", wz)
                var qian = name.substring(0, 4) + "...回复 color:'red'"
                var hou = name.substr(wz + 2, l - wz)

                console.log("前", qian)
                console.log("后", hou)
                name = qian + hou
                //加上再修剪
                if (name.length > 15) {
                  nr.ss_xx.huifunr[ii].huifu[iii].name = name.substring(0, 15) + "..."
                } else {
                  nr.ss_xx.huifunr[ii].huifu[iii].name = name
                }

              } else {
                nr.ss_xx.huifunr[ii].huifu[iii].name = nr.ss_xx.huifunr[ii].huifu[iii].name.substring(0, 15) + "..."
                console.log("改了hhhhxxxx", nr.ss_xx.huifunr[ii].huifu[iii].name)
              }

            }

          }
        }
      }
    }

    //console.log(nr)
    return nr
  },



  // Download File Logic
  downloadFile: function (e) {
    const that = this;

    // 1. If Downloaded -> Open
    if (this.data.isDownloaded && this.data.downloadedFilePath) {
      wx.openDocument({
        filePath: this.data.downloadedFilePath,
        showMenu: true,
        success: function () { console.log('打开文档成功'); },
        fail: function () { wx.showToast({ title: '文件不存在或已失效', icon: 'none' }); }
      });
      return;
    }

    // 2. If Downloading -> Cancel
    if (this.data.isDownloading) {
      if (this.downloadTask) {
        this.downloadTask.abort();
      }
      this.setData({
        isDownloading: false,
        downloadProgress: 0
      });
      wx.showToast({ title: '已取消', icon: 'none' });
      return;
    }

    // 3. Start Download
    const file = e.currentTarget.dataset.file;
    if (!file || !file.fileID) {
      wx.showToast({ title: '文件不存在', icon: 'none' });
      return;
    }

    this.setData({
      isDownloading: true,
      downloadProgress: 0
    });

    this.downloadTask = wx.cloud.downloadFile({
      fileID: file.fileID,
      success: res => {
        if (res.statusCode === 200) {
          that.setData({
            isDownloading: false,
            isDownloaded: true,
            downloadedFilePath: res.tempFilePath
          });
          // Auto Open? User said "Click download place shows Completed". 
          // Then clicking it opens it.
          // Optional: Auto open on finish. 
          // For now I follow "Shows Completed".

          // Increment Download Count
          db.collection('tianmeizhoubian').doc(that.data.id).update({
            data: {
              'ss_xx.downloads': _.inc(1)
            }
          }).then(res => {
            console.log("Download count incremented");
            // Update local state
            let current = that.data.ss_xx.ss_xx.downloads || 0;
            that.setData({
              'ss_xx.ss_xx.downloads': current + 1
            });
          }).catch(err => {
            console.error("Failed to increment download count", err);
          });
        } else {
          that.setData({ isDownloading: false });
          wx.showToast({ title: '下载失败', icon: 'none' });
        }
      },
      fail: err => {
        // Abort also triggers fail with specific errorMsg usually
        if (err.errMsg && err.errMsg.indexOf('abort') !== -1) {
          console.log('Download Aborted');
          return;
        }
        console.error("下载出错", err);
        that.setData({ isDownloading: false });
        wx.showToast({ title: '下载出错', icon: 'none' });
      }
    });

    this.downloadTask.onProgressUpdate((res) => {
      // Throttle updates or just set
      that.setData({
        downloadProgress: res.progress
      });
    });
  },


  //用户转发
  onShareAppMessage: function () {
    console.log("path:/pages/plate-zhoubian/plate-zhoubian?id=" + this.data.id)
    return {
      title: app.ssinfo.jg,
      imageUrl: app.ssinfo.tp[0],
      path: "/pages/plate-zhoubian/plate-zhoubian?id=" + this.data.id + "&postId=" + this.data.id + "&postType=zhoubian&source=share&zhoubianfenxiang=true&liuyan=" + this.data.liuyan
    }
  },
  //用户转发
  onShareTimeline: function () {
    return {
      title: app.ssinfo.jg,
      imageUrl: app.ssinfo.tp[0],
      query: "id=" + this.data.id + "&postId=" + this.data.id + "&postType=zhoubian&source=share&zhoubianfenxiang=true&liuyan=" + this.data.liuyan
    }
  },





  //点赞帖子
  dianzan(e) {
    //判断是否举报过
    //console.log("点赞id",e.currentTarget.dataset.dianzanid)
    //var dianzanid=e.currentTarget.dataset.dianzanid//取到dianzan数组
    var id = app.userInfo._id
    var ssid = e.currentTarget.dataset.id
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

    if (id == "") {
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
    var time = new Date().getTime();
    var name = app.userInfo.userinfo.username;
    var photo = app.userInfo.userinfo.userphoto;
    var lzid = this.data.ss_xx._openid;
    var ywnr = this.data.ss_xx.ss_xx.nr;
    var zbtitle = this.data.ss_xx.ss_xx.zbtitle;
    var zilei = this.data.ss_xx.ss_xx.zilei;



    wx.cloud.callFunction({
      name: "dianzan",
      data: {
        id: ssid,
        dzrid: id,//点赞人id
        type: 'tianmeizhoubian',
        name: name,
        photo: photo,
        time: time,
        lzid: lzid,
        ywnr: ywnr,
        zilei: zilei,
        zbtitle: zbtitle
      }
    })
    var ss_xx = this.data.ss_xx
    if (this.data.dianzan) {
      ss_xx.ss_xx.dianzannb--
      app.ssinfo.lovenb = ss_xx.ss_xx.dianzannb
      this.setData({
        dianzan: false,
        ss_xx: ss_xx
      })
      app.loveinfo = 'false'
      app.ssinfo.reping = 2222
    } else {
      ss_xx.ss_xx.dianzannb++
      app.ssinfo.lovenb = ss_xx.ss_xx.dianzannb
      this.setData({
        dianzan: true,
        ss_xx: ss_xx
      })
      app.loveinfo = 'true'
      app.ssinfo.reping = 2222
    }

  },
  //判断登录,返回true或false
  async islogin() {
    var _id = this.data._id
    if (_id != "") {
      return true
    } else {
      return false
    }
  },

  // 打开主要评论（带评价）
  openMainComment() {
    this.setData({
      xx: null, // 清空回复对象
      input: "留下你的精彩评论吧",
      focus: true, // 唤起键盘
      istrue: false // 确保弹窗关闭
    });
  },

  // 星星点击
  change_star: function (event) {
    var obj = wx.getLaunchOptionsSync()
    if (obj.scene == 1154) {
      wx.showToast({
        title: '前往小程序👇',
        icon: 'none',
        duration: 2000,
      })
      return
    }

    var that = this;
    var sid = event.currentTarget.dataset.sid;
    var star_num = sid;
    var star_list = this.data.star_data;
    var src1 = "cloud://tafaheishi-1gs4bxsvcf864035.7461-tafaheishi-1gs4bxsvcf864035-1316611774/标签/starnull.png"
    var src2 = "cloud://tafaheishi-1gs4bxsvcf864035.7461-tafaheishi-1gs4bxsvcf864035-1316611774/标签/starall.png"
    for (var i in star_list) {
      star_list[i].src = src1;
      if (star_list[i].id <= sid) {
        star_list[i].src = src2;
      }
    }
    that.setData({
      star_data: star_list,
      star_num: star_num
    })
    console.log("评分更新:", star_num)
    // Removed that.openDialog(); to keep input panel visible
  },


  //  显示弹窗


  // 隐藏弹窗
  closeDialog: function () {
    this.setData({
      istrue: false
    })
  },

  // Input Focus Handler
  onInputFocus(e) {
    this.setData({
      isInputFocused: true,
      showKeyboardMask: true // Sync mask state just in case
    });
  },

  // Input Blur Handler
  onInputBlur(e) {
    this.setData({
      isInputFocused: false,
      showKeyboardMask: false // Sync mask state
    });
  },

  data_Input: function (e) {
    var evaluation_text = this.data.evaluation_text;
    console.log(e.detail.value.length)
    if (e.detail.value.length <= 140) {
      evaluation_text = e.detail.value
    }
    this.setData({
      evaluation_text: evaluation_text,
      font_count: evaluation_text.length + '/140'
    })
  },
  //回到首页////
  blackindex() {

    wx.switchTab({
      url: '/pages/index/index'
    });
  },




  /**
   * 统一身份验证
   */
  checkFullLogin() {

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
            wx.switchTab({
              url: "/pages/my/wd/wd"
            });
          }
        }
      });
      return false;
    }
    return true;
  },

  /**
   * 右上角弹窗
   */
  show: function () {
    if (this.data.show) {
      this.setData({ show: false });
    } else {
      this.setData({ show: true });
    }
  },

  /**
   * 状态修改 (删除/活动结束)
   */
  deleteistrue: function () {
    var _id = app.userInfo._id;
    var mine = this.data.isAdmin;

    if (mine == true || _id == this.data.ss_xx.ss_xx.lzid) {
      let groups = [];
      const openlocationtitle = this.data.ss_xx.ss_xx.orderdetail && this.data.ss_xx.ss_xx.orderdetail.openlocationtitle;

      // Add "Modify Content" option
      groups.push({
        text: '修改内容',
        value: 'modify_content'
      });

      if (openlocationtitle) {
        const isTaken = this.data.ss_xx.ss_xx.orderdetail.takeorder;
        groups.push({
          text: isTaken ? '恢复派单' : '派单结束',
          value: 'toggle_status'
        });
      } else {
        const isOver = this.data.ss_xx.ss_xx.isover;
        groups.push({
          text: isOver ? '活动恢复' : '活动结束',
          value: 'toggle_status'
        });
      }
      groups.push({ text: '删除帖子', type: 'warn', value: 'delete_post' });

      this.setData({
        showDialog: true,
        groups: groups,
        show: false
      });
    } else {
      this.show();
      wx.showToast({
        title: '无权修改',
        icon: 'none',
        duration: 800
      });
    }
  },

  /**
  * 菜单点击处理
  */
  btnClick(e) {
    const { value } = e.detail;
    this.setData({ showDialog: false });

    if (value === 'reply') {
      this.handleMenuReply();
    } else if (value === 'copy') {
      this.handleMenuCopy();
    } else if (value === 'delete') {
      this.handleMenuDelete();
    } else if (value === 'toggle_status') {
      this.oderover();
    } else if (value === 'delete_post') {
      this.deletethisone();
    } else if (value === 'modify_content') {
      this.xiugai();
    }
  },

  /**
   * 删除帖子
   */
  deletethisone() {
    var that = this;
    wx.showModal({
      title: '提示💡',
      content: '删除后无法恢复',
      showCancel: true,
      confirmText: '确认删除',
      confirmColor: '#FF4D49',
      cancelText: '取消',
      cancelColor: '#000000',
      success(res) {
        if (res.confirm) {
          that.setData({ ss_xx: 0 });
          wx.showToast({ title: '已删除', icon: "none" });

          db.collection(that.data.ku).doc(that.data.id).get().then((res) => {
            var tp = res.data.ss_xx.tp;
            if (tp && tp.length > 0) {
              wx.cloud.deleteFile({ fileList: tp });
            }
            db.collection(that.data.ku).doc(that.data.id).remove();
          });
        }
      }
    });
  },

  /**
  * 活动结束/恢复
  */
  oderover(e) {
    var _id = app.userInfo._id;
    var mine = this.data.isAdmin;

    if (mine == true || _id == this.data.ss_xx.ss_xx.lzid) {
      const openlocationtitle = this.data.ss_xx.ss_xx.orderdetail && this.data.ss_xx.ss_xx.orderdetail.openlocationtitle;

      if (openlocationtitle) {
        // Order Logic
        var isover = this.data.ss_xx.ss_xx.orderdetail.takeorder;
        if (!isover) {
          db.collection(this.data.ku).doc(this.data.id).update({
            data: { 'ss_xx.orderdetail.takeorder': true }
          }).then(res => {
            wx.showToast({ title: '结束' });
            this.setData({ "ss_xx.ss_xx.orderdetail.takeorder": true });
            app.shuaxin = true;
          });
        } else {
          db.collection(this.data.ku).doc(this.data.id).update({
            data: {
              'ss_xx.orderdetail.takeorder': false,
              'ss_xx.orderdetail.takeorderid': "",
              'ss_xx.orderdetail.takeorderphone': "",
            }
          }).then(res => {
            wx.showToast({ title: '已恢复' });
            this.setData({ "ss_xx.ss_xx.orderdetail.takeorder": false });
            app.shuaxin = true;
          });
        }
      } else {
        // Activity Logic
        var isover = this.data.ss_xx.ss_xx.isover;
        if (!isover) {
          db.collection(this.data.ku).doc(this.data.id).update({
            data: { 'ss_xx.isover': true }
          }).then(res => {
            wx.showToast({ title: '已结束' });
            this.setData({ "ss_xx.ss_xx.isover": true });
          });
        } else {
          db.collection(this.data.ku).doc(this.data.id).update({
            data: { 'ss_xx.isover': false }
          }).then(res => {
            wx.showToast({ title: '已恢复' });
            this.setData({ "ss_xx.ss_xx.isover": false });
          });
        }
      }
    }
  },

  /**
  * 拨打电话
  */
  callphone: function (e) {
    let phone = e.currentTarget.dataset.phone;
    wx.makePhoneCall({
      phoneNumber: phone,
    });
  },

  /**
   * 接单按钮
   */
  kaishixuanze(e) {
    if (!this.checkFullLogin()) return;
    var _id = app.userInfo._id;
    if (_id != this.data.ss_xx.ss_xx.lzid) {
      db.collection(this.data.ku).doc(this.data.id).get().then((res) => {
        var takeorder = res.data.ss_xx.orderdetail.takeorder;
        if (takeorder) {
          this.setData({ 'ss_xx.ss_xx.orderdetail.takeorder': true });
          wx.showToast({ title: '已接单', icon: 'none' });
          return;
        } else {
          var phone = app.userInfo.phone;
          wx.showModal({
            title: "接单人联系方式",
            editable: true,
            placeholderText: '请输入你的电话',
            content: phone,
            success: res => {
              if (res.confirm) {
                var takeorderphone = res.content;
                var takeordername = app.userInfo.userinfo.username;
                db.collection(this.data.ku).doc(this.data.id).update({
                  data: {
                    'ss_xx.orderdetail.takeorder': true,
                    'ss_xx.orderdetail.takeorderid': _id,
                    'ss_xx.orderdetail.takeorderphone': takeorderphone,
                    'ss_xx.orderdetail.takeordername': takeordername
                  }
                }).then(res => {
                  wx.showToast({ title: '接单成功！' });
                });
                app.shuaxin = true;
                this.setData({ 'ss_xx.ss_xx.orderdetail.takeorder': true });
                // Notification logic omitted for brevity, can be added if needed
              }
            }
          });
        }
      })
    } else {
      wx.showToast({ title: '自己不能接单', icon: 'none' });
    }
  },



  /**
  * 举报
  */
  jubao(e) {
    var jubao = e.currentTarget.dataset.jubao;
    var id = app.userInfo._id;
    this.setData({ show: false });
    if (!this.checkFullLogin()) return;

    var yn = JSON.stringify(jubao[0]).includes(id);
    if (yn) {
      wx.showToast({ title: "举报过了", icon: "none" });
      return;
    }
    var that = this;
    wx.showModal({
      title: '提示',
      content: '确认举报？(恶意举报将会封号)',
      showCancel: true,
      confirmText: '确认举报',
      confirmColor: '#FF4D49',
      success(res) {
        if (res.confirm) {
          var ssid = e.currentTarget.dataset.id;
          var cc = that.data.ss_xx.ss_xx.nr || '分享内容';
          wx.cloud.callFunction({
            name: "jubao",
            data: {
              id: ssid,
              time: new Date().getTime(),
              ywnr: cc,
              jbrid: app.userInfo._id,
              type: that.data.ku // Use current collection name type
            }
          });
          var ss_xx = that.data.ss_xx;
          ss_xx.ss_xx.jubao[0].push(id);
          ss_xx.ss_xx.jubao[1]++;
          that.setData({ ss_xx: ss_xx });
          wx.showToast({ title: '举报成功', icon: "none" });
        }
      }
    });
  },

  /**
  * 评论点赞
  */
  pldianzan(e) {
    if (!this.checkFullLogin()) return;
    var _id = app.userInfo._id;
    var id = e.currentTarget.dataset.id;
    var plid = e.currentTarget.dataset.plid;
    var index0 = e.currentTarget.dataset.index0;
    var pllzid = e.currentTarget.dataset.pllzid;
    var plnr = e.currentTarget.dataset.plnr;
    var zilei = e.currentTarget.dataset.zilei;

    console.log("pldianzan Debug - Dataset:", e.currentTarget.dataset);
    console.log("pldianzan Debug - Zilei value:", zilei);

    var time = new Date().getTime();
    var name = app.userInfo.userinfo.username;
    var photo = app.userInfo.userinfo.userphoto;

    wx.cloud.callFunction({
      name: "dianzan",
      data: {
        id: id,
        dzrid: _id,
        plid: plid,
        type: 'sspinglun', // Using general comment like type
        collection: 'tianmeizhoubian',
        zilei: zilei,
        name: name,
        photo: photo,
        time: time,
        pllzid: pllzid,
        plnr: plnr
      }
    });

    var ss_xx = this.data.ss_xx;
    if (ss_xx.ss_xx.huifunr[index0].pllove) {
      ss_xx.ss_xx.huifunr[index0].pllove = false;
      ss_xx.ss_xx.huifunr[index0].pldianzannb--;
    } else {
      ss_xx.ss_xx.huifunr[index0].pllove = true;
      ss_xx.ss_xx.huifunr[index0].pldianzannb++;
    }
    this.setData({ ss_xx: ss_xx });
  },

  /**
   * 检查用户 (跳转个人主页)
   */
  checkuser(e) {
    if (this.data.isAdmin) {
      wx.navigateTo({ url: "../checkuser/checkuser?id=" + e.currentTarget.dataset.id });
    }
  },

  /**
  * 通知
  */
  noticet() {
    this.setData({ modalHidden111: false });
  },
  modalConfirm: function () {
    this.setData({ modalHidden111: true });
  },

  /**
  * 轮播图详情
  */
  toBannerDetail(e) {
    // Basic implementation
    var title = e.currentTarget.dataset.title;
    // ... (simplified)
  },

  // 展开/收起评论 (Existing ones are fine, but adding shouqi just in case or ensure existing ones work with new layout attributes)
  // plate-zhoubian already has zhankai/shouqi.
  // Input handlers
  onInputFocus() {
    this.setData({ isKeyboardOpen: true, focus: true });
  },
  onInputBlur() {
    this.setData({ isKeyboardOpen: false, focus: false });
  },


  /**
   * 通用输入绑定
   */
  bindFieldInput(e) {
    const field = e.currentTarget.dataset.field;
    const value = e.detail.value;
    // Map field to correct data path based on field name
    let path = `ss_xx.ss_xx.${field}`;
    this.setData({
      [path]: value
    });
  },

  /**
   * 绑定内容输入框 (Textarea)
   */
  changewbnr(e) {
    this.setData({
      "ss_xx.ss_xx.nr": e.detail.value,
      sy: e.detail.value.length + "/599"
    });
  },

  // 打开修改弹窗
  xiugai() {
    this.setData({
      istrue: true,
      istrue1: true
    });
  },

  // 关闭修改弹窗
  closeDialog() {
    this.setData({
      istrue1: false
    });
    setTimeout(() => {
      this.setData({
        istrue: false
      });
    }, 200);
  },

  // 阻止遮罩层滚动
  preventTouchMove() { },

  /**
   * 修改信息提交
   */
  async changewbnrtijiao() {
    // 获取当前数据
    const ss_xx = this.data.ss_xx.ss_xx;
    const id = this.data.id;

    // 基础更新数据
    let updateData = {
      'ss_xx.zbtitle': ss_xx.zbtitle,
      'ss_xx.nr': ss_xx.nr
    };

    // 根据 zilei 添加特定字段
    // 0: 资料, 2: 课程 -> link, lianxi
    if (ss_xx.zilei == 0 || ss_xx.zilei == 2) {
      updateData['ss_xx.link'] = ss_xx.link;
      updateData['ss_xx.lianxi'] = ss_xx.lianxi;
    }
    // 1: 店铺 -> weizhi, lianxi, latitude, longitude
    else if (ss_xx.zilei == 1) {
      updateData['ss_xx.weizhi'] = ss_xx.weizhi;
      updateData['ss_xx.lianxi'] = ss_xx.lianxi;
      // Only update coordinates if they are present/changed
      if (ss_xx.latitude) updateData['ss_xx.latitude'] = ss_xx.latitude;
      if (ss_xx.longitude) updateData['ss_xx.longitude'] = ss_xx.longitude;
    }

    if (!this.checkFullLogin()) return;

    // 内容安全检测
    wx.showLoading({ title: '传送中...', mask: true });

    // 拼接所有文本进行检测
    let checkText = (ss_xx.zbtitle || '') + (ss_xx.nr || '') + (ss_xx.weizhi || '') + (ss_xx.lianxi || '');
    var checkOk = await this.checkStr(checkText);

    if (!checkOk) {
      wx.hideLoading();
      wx.showToast({
        title: '含有违法违规内容',
        icon: 'none',
        duration: 4000,
      });
      return;
    }

    wx.showLoading({ title: '更新中...', mask: true });

    // 更新数据库 (使用当前集合 data.ku)
    db.collection(this.data.ku).doc(id).update({
      data: updateData
    }).then(res => {
      wx.hideLoading();
      wx.showToast({
        title: '修改成功',
      });
      this.closeDialog();
      // 可选: 触发上级页面刷新
      app.shuaxin = true;
    }).catch(err => {
      wx.hideLoading();
      console.error(err);
      wx.showToast({
        title: '修改失败',
        icon: 'none'
      });
    });
  },


  /**
   * 选择位置
   */
  chooseLocation: function () {
    var that = this;
    wx.chooseLocation({
      success: function (res) {
        that.setData({
          "ss_xx.ss_xx.weizhi": res.name,
          "ss_xx.ss_xx.latitude": res.latitude,
          "ss_xx.ss_xx.longitude": res.longitude
        });
        if (res.name == '') {
          wx.showToast({ title: '未选择位置', icon: 'error' });
        }
      },
      fail: function (res) {
        // Handle failure/auth
        wx.getSetting({
          success(res) {
            if (!res.authSetting['scope.userLocation']) {
              wx.showModal({
                title: '提示',
                content: '需要获取您的地理位置，请前往设置开启',
                success: function (tip) {
                  if (tip.confirm) {
                    wx.openSetting({
                      success: function (data) {
                        if (data.authSetting["scope.userLocation"] === true) {
                          wx.showToast({ title: '授权成功', icon: 'success' });
                        }
                      }
                    })
                  }
                }
              })
            }
          }
        })
      }
    });
  },

  /**
   * 添加图片
   */
  chooseImg: function (e) {
    var that = this;
    var imgs = that.data.imgs || [];
    var count = 1 - imgs.length;

    wx.chooseMedia({
      count: count, // 剩余可选数量
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      sizeType: ['compressed'],
      success: async function (res) {
        var tempFiles = res.tempFiles;
        var imgs = that.data.imgs;

        wx.showLoading({
          title: '图片处理中...',
          mask: true
        });

        // 并行处理所有图片
        const processPromises = tempFiles.map(async (file) => {
          if (imgs.length + tempFiles.length > 9) return null;

          let filePath = file.tempFilePath;
          console.log("开始处理图片：", filePath);

          try {
            const imageInfo = await new Promise((resolve, reject) => {
              wx.getImageInfo({
                src: filePath,
                success: resolve,
                fail: reject
              })
            });

            if (imageInfo.type === 'gif') {
              console.log("检测到GIF，跳过压缩");
              return filePath;
            } else {
              // 非GIF图片进行压缩，质量 0.6，最大边长 800
              let compressedPath = await that.yasuo(filePath, 0.6, 800);
              if (compressedPath != -1) {
                return compressedPath;
              } else {
                console.log("压缩失败，使用原图");
                return filePath;
              }
            }
          } catch (err) {
            console.error("获取图片信息失败，尝试通过扩展名判断", err);
            let ext = filePath.substring(filePath.lastIndexOf(".") + 1).toLowerCase();
            if (ext === 'gif') {
              console.log("检测到GIF (扩展名)，跳过压缩");
              return filePath;
            } else {
              let compressedPath = await that.yasuo(filePath, 0.6, 800);
              if (compressedPath != -1) {
                return compressedPath;
              }
              return filePath;
            }
          }
        });

        const processedPaths = await Promise.all(processPromises);

        // Filter out null and add to imgs
        for (const path of processedPaths) {
          if (path && imgs.length < 9) {
            imgs.push(path);
          }
        }

        that.setData({
          imgs: imgs
        });

        wx.hideLoading();
      }
    });
  },

  /**
   * 删除图片
   */
  deleteImg: function (e) {
    var imgs = this.data.imgs;
    var index = e.currentTarget.dataset.index;
    imgs.splice(index, 1);
    this.setData({
      imgs: imgs
    });
  },

  checkFullLogin() {
    if (!app.userInfo || !app.userInfo.userinfo || app.userInfo.userinfo.login !== true) {
      wx.showModal({
        title: '提示',
        content: '登录后才可进行此操作！是否进行授权登录？',
        success(res) {
          if (res.confirm) {
            wx.switchTab({ url: "../my/wd/wd" });
          }
        }
      });
      return false;
    }
    return true;
  },

  // 处理点赞数据
  async pllove(e) {
    console.log(e);
    var l = e.length;
    for (var i = 0; i < l; i++) {
      // Safe check for dianzhanID array
      if (!e[i].dianzhanID) e[i].dianzhanID = [];
      var yn = e[i].dianzhanID.indexOf(app.userInfo._id);
      if (yn == -1) {
        e[i].pllove = false;
      } else {
        e[i].pllove = true;
      }
    }
    return e;
  },



  // 回复评论
  huifu(e) {
    var index1 = e.currentTarget.dataset.index1;
    var xx = e.currentTarget.dataset.xx;
    var xx1 = e.currentTarget.dataset.xx1;

    if (index1 == undefined) {
      // 回复 lv0
      var name = xx.name;
      xx.id = xx.plrid;
      xx.lv0 = xx.plrid;
    } else {
      // 回复 lv1, lv2
      xx.wbnr = xx1.wbnr;
      xx.id = xx1.plrid;
      xx.lv0 = xx.plrid;
      xx.lv = xx1.lv;
      if (xx1.lv == 1) {
        var name = xx1.name;
      } else {
        var name = xx1.yuanname;
      }
    }

    xx.name = name;

    // Setup reply UI
    const replyIndex0 = e.currentTarget.dataset.index;
    const replyIndex1 = e.currentTarget.dataset.index1;
    let activeReplyId = replyIndex1 == undefined ?
      'comment-content-' + replyIndex0 :
      'sub-comment-' + replyIndex0 + '-' + replyIndex1;

    this.setData({
      input: "回复 " + name,
      focus: true,
      xx: xx, // Store reply context
      index: e.currentTarget.dataset.index,
      activeReplyId: activeReplyId,
      wbnr: ''
    });
  },

  // 显示评论操作菜单
  showCommentMenu(e) {
    if (!this.checkFullLogin()) return;
    const item = e.currentTarget.dataset.item;
    let groups = [];
    groups.push({ text: '回复', value: 'reply' });
    groups.push({ text: '复制', value: 'copy' });

    var _id = app.userInfo._id;
    var mine = this.data.isAdmin;
    var isMyComment = (item.plrid == _id);
    var isMyPost = (this.data.ss_xx.ss_xx.lzid == _id);

    if (isMyComment || isMyPost || mine) {
      groups.push({ text: '删除', type: 'warn', value: 'delete' });
    }

    this.setData({
      showDialog: true,
      groups: groups,
      selectedComment: { ...e.currentTarget.dataset }
    });
  },

  // 菜单点击处理
  btnClick(e) {
    const { value } = e.detail;
    this.setData({ showDialog: false }); // Close dialog first

    if (value === 'reply') {
      this.handleMenuReply();
    } else if (value === 'copy') {
      this.handleMenuCopy();
    } else if (value === 'delete') {
      this.handleMenuDelete();
    } else if (value === 'toggle_status') {
      this.oderover();
    } else if (value === 'delete_post') {
      this.deletethisone();
    } else if (value === 'modify_content') {
      this.xiugai();
    }
  },

  handleMenuReply() {
    const { item, index0, type, index1, parentitem } = this.data.selectedComment;
    const dataset = type === 'main' ?
      { xx: item, index: index0 } :
      { xx: parentitem, xx1: item, index: index0, index1: index1 };

    this.huifu({ currentTarget: { dataset } });
  },

  handleMenuCopy() {
    const { item } = this.data.selectedComment;
    wx.setClipboardData({
      data: item.wbnr,
      success: () => wx.showToast({ title: '已复制', icon: 'none' })
    });
  },

  handleMenuDelete() {
    const { item, index0, index, type, index1, parentitem } = this.data.selectedComment;
    const dataset = type === 'main' ? {
      id0: item.plrid,
      index: index0,
      time: item.time,
      huifunb: item.huifunb
    } : {
      id0: parentitem.plrid,
      index: index, // Use 'index' for sub-comments as set in WXML (data-index)
      time: parentitem.time,
      index1: index1,
      id1: item.plrid,
      time1: item.time
    };
    this.changanshanchu({ currentTarget: { dataset } });
  },

  // 删除评论
  changanshanchu(e) {
    var _id = app.userInfo._id;
    var pdwb = e.currentTarget.dataset.id1 || e.currentTarget.dataset.id0;
    var mine = this.data.isAdmin;

    if (pdwb == _id || mine == true) {
      var that = this;
      wx.showModal({
        title: '提示💡',
        content: '删除后无法恢复！',
        confirmText: '确认删除',
        confirmColor: '#FF4D49',
        success(res) {
          if (res.confirm) {
            var id = e.currentTarget.dataset.id0;
            var index = e.currentTarget.dataset.index;
            var ss_xx = that.data.ss_xx.ss_xx;
            var index1 = e.currentTarget.dataset.index1;

            if (index1 == undefined) {
              ss_xx.huifunr.splice(index, 1);
            } else {
              ss_xx.huifunr[index].huifu.splice(index1, 1);
            }

            that.setData({ "ss_xx.ss_xx": ss_xx });
            wx.showToast({ title: '删除成功', icon: "none" });

            // Invoke cloud delete
            var _data = {
              id0: id,
              id1: e.currentTarget.dataset.id1 || "", // Ensure empty string if undefined for main comments
              time: e.currentTarget.dataset.time,
              time1: e.currentTarget.dataset.time1 || "",
              id: that.data.id,
              liuyan: that.data.liuyan,
              type111: that.data.ku, // existing logic
              collection: that.data.ku, // explicitly specify collection
              tableName: that.data.ku, // alias
              type: that.data.ku // alias
            };
            wx.cloud.callFunction({
              name: 'delete',
              data: { _data },
            });
          }
        }
      });
    } else {
      wx.showToast({ title: '无权删除', icon: 'none' });
    }
  },

  // 排序切换
  changeSortMethod(e) {
    var ss_xx = this.data.ss_xx;
    var xx = ss_xx.ss_xx.huifunr;
    var value = e.currentTarget.dataset.value;

    if (value == 1) {
      // 评论排序
      xx.sort(function (a, b) {
        return a.pldianzannb - b.pldianzannb;
      });

      this.setData({
        ss_xx: ss_xx,
        sortMethod: true
      });
    } else {
      // 按时间近到晚远排序
      xx.sort(function (a, b) {
        return a.time - b.time;
      });
      this.setData({
        ss_xx: ss_xx,
        sortMethod: false
      });
    }
  },

  // 展开评论
  zhankai(e) {
    var index = e.currentTarget.dataset.index;
    var zhankai = "ss_xx.ss_xx.huifunr[" + index + "].zhankai";
    this.setData({
      [zhankai]: true,
    });
  },

  // 收起评论
  shouqi(e) {
    var index = e.currentTarget.dataset.index;
    var zhankai = "ss_xx.ss_xx.huifunr[" + index + "].zhankai";
    this.setData({
      [zhankai]: false,
    });
  },

  // Helper functions from plate2.js
  /**
   * 图片内容合法性检测
   */
  async checkImg(media) {
    console.log("要检测的buffer", media);
    try {
      var res = await wx.cloud.callFunction({
        name: 'checkImg',
        data: {
          media
        }
      });
      console.log("云检测结果", res.result);
      return res.result.errCode;
    } catch (err) {
      console.log("云检测错误", err);
      return 1;
    }
  },

  /**
   * 图片取buffer
   */
  async qubuffer(media) {
    return new Promise((resolve, reject) => {
      wx.getFileSystemManager().readFile({
        filePath: media,
        success: res => {
          resolve(res.data);
        }
      });
    });
  },

  /**
   * 图片压缩 (Canvas 2D)
   */
  async yasuo(media, number, max) {
    console.log("要压缩的地址", media);
    var that = this;
    return new Promise((resolve) => {
      wx.getImageInfo({
        src: media,
        success(res) {
          console.log("图片宽高：", res.width, res.height);

          // 计算压缩后的尺寸
          var canvasWidth = res.width;
          var canvasHeight = res.height;
          if (canvasWidth > canvasHeight) {
            if (canvasWidth > max) {
              canvasHeight = Math.trunc(max * canvasHeight / canvasWidth);
              canvasWidth = max;
            }
          } else {
            if (canvasHeight > max) {
              canvasWidth = Math.trunc(max * canvasWidth / canvasHeight);
              canvasHeight = max;
            }
          }

          console.log("画布宽高：", canvasWidth, canvasHeight);
          that.setData({
            Cwidth: canvasWidth,
            Cheight: canvasHeight
          });

          // 使用 Canvas 2D
          const query = wx.createSelectorQuery();
          query.select('#huabu')
            .fields({ node: true, size: true })
            .exec((res2) => {
              if (!res2[0] || !res2[0].node) {
                console.error("Canvas 节点未找到");
                resolve(-1);
                return;
              }

              const canvas = res2[0].node;
              const ctx = canvas.getContext('2d');

              // 设置画布尺寸
              canvas.width = canvasWidth;
              canvas.height = canvasHeight;

              // 创建图片对象
              const img = canvas.createImage();
              img.src = media;
              img.onload = () => {
                // 清除画布并绘制图片
                ctx.clearRect(0, 0, canvasWidth, canvasHeight);
                ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight);

                // 导出图片
                setTimeout(() => {
                  wx.canvasToTempFilePath({
                    canvas: canvas,
                    fileType: 'jpg',
                    quality: number,
                    success: function (res) {
                      console.log("压缩成功", res.tempFilePath);
                      resolve(res.tempFilePath);
                    },
                    fail: function (err) {
                      console.log("压缩失败：", err);
                      resolve(-1);
                    }
                  });
                }, 100);
              };

              img.onerror = (err) => {
                console.error("图片加载失败", err);
                resolve(-1);
              }
            });
        },
        fail(err) {
          console.log("获取图片信息失败", err);
          resolve(-1);
        }
      });
    });
  },

  // 图片压缩及审核
  async GIFimgcheck() {
    try {
      var imgs = this.data.imgs;
      var that = this;

      wx.showLoading({
        title: '动图审核...',
        mask: true
      });

      // 并行执行图片内容检测
      const checkPromises = imgs.map(async (filePath) => {
        const buffer = await that.qubuffer(filePath);
        return that.checkImg(buffer);
      });

      const results = await Promise.all(checkPromises);

      for (const checkOk of results) {
        if (checkOk == 87014 || checkOk == -604102) {
          // 图片检测出现问题
          return false;
        }
      }

      that.setData({
        Imgs: imgs
      });
      return true;

    } catch (err) {
      console.log("GIFimgcheck错误", err);
      return false;
    }
  },

  // 图片压缩及审核
  async imgcheck() {
    // 审核图片
    try {
      var imgs = this.data.imgs;
      var tp = imgs; // 直接使用已压缩的图片
      var that = this;

      // need
      // --------经过上面过程已经压缩完毕，再整体取buffer检测
      wx.showLoading({
        title: '图片审核...',
        mask: true
      });

      // 直接使用已压缩的图片进行检测
      // 并行执行图片内容检测
      const checkPromises = imgs.map(async (filePath) => {
        const buffer = await that.qubuffer(filePath);
        return that.checkImg(buffer);
      });

      const results = await Promise.all(checkPromises);

      for (const checkOk of results) {
        if (checkOk == 87014 || checkOk == -604102) {
          // 图片检测出现问题
          return false;
        }
      }

      that.setData({
        Imgs: tp
      });
      return true;
      // --------返回结果
    } catch (err) {
      console.log("imgcheck错误", err);
      return false;
    }
  },

  onUnload: function () {
    if (this.downloadTask) {
      this.downloadTask.abort();
    }
  },

  /**
   * Copy Text to Clipboard
   */
  copyText(e) {
    var text = e.currentTarget.dataset.text;
    wx.setClipboardData({
      data: text,
      success: () => wx.showToast({ title: '已复制', icon: 'none' })

    })
  },

})
