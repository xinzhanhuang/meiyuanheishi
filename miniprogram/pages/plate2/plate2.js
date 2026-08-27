const db = wx.cloud.database();
const VOTE_OPTION = wx.cloud.database().collection("VoteOption");
const VOTE_RECORD = wx.cloud.database().collection("VoteRecord");
const app = getApp();
const _ = db.command;
const utils = require('../../utils/util.js');

Page({
  /**
   * 页面的初始数据
   */
  data: {
    indicatorDots: true, // 是否显示指示点
    autoplay: true, // 是否自动切换
    interval: 1000, // 自动切换时间间隔
    duration: 200, // 滑动动画时长

    loadingHidden: false,
    xianshi: false,
    id: "",
    ss_xx: {},
    isover: false,
    wbnr: "",
    _openid: "9999999",
    _id: "9999999",
    fenxiang: "false",
    glid: "9999",
    dianzan: false,
    input: "留下你的评论吧",
    focus: false,
    xx: "",
    liuyan: false,
    ku: 'ss',
    reping: "",
    orderlzid: false,
    movehight: 500,
    movehight2: 500,
    takeorderid: false,
    keyboardwidth: false,

    DONOT: true,

    DONOT: true,
    isAdmin: false, // 是否是管理员
    showDialog: false, // 评论菜单显示 (mp-actionSheet)
    groups: [], // 菜单选项
    selectedComment: null, // 当前选中的评论数据

    imgs: [],
    Imgs: [],

    show: false,
    index: [0, 0],
    modalHidden111: true,
    cancelanniu: true, // 弹窗
    sortMethod: true,

    // 键盘弹起
    statsuBarHeight: app.globalData.statsuBarHeight,
    isKeyboardOpen: false,
    headHeight: 40,
    chatListHeight: 0,
    keyboardHeight: 0,
    showKeyboardMask: false,
    messageList: [],
    inutPanelHeight: 50,
    toView: "item0",
    curMessage: "",

    // 投票
    list: [],
    count: 0,
    args: {
      where: {
        isShow: true
      },
      orderBy: {
        field: "publishTime",
        sort: "desc"
      },
      limit: 20,
      size: 20,
      skip: 0
    },
    number: 1,
    option: {},
    remainVoteNumber: 0,
    pwd: {},
    $toast: {
      show: false,
      text: '',
      icon: '',
      iconColor: ''
    },
    already: false,
    colorIndex: "",
    percent: 0,
    already22: false,
    option11111: ["A", "B", "C", "D", "E"],
    istrue: false,
    istrue: false,

    // 订阅通知
    allow: 'true',
    msgnb: [0, 0],
    isorder: false,
    // gao:750,
    tmplIds: ['hs60e8rl8z2e_dMIRqBgT5izdt7qw_e9O3Y8xWFh9pY'],

    alldibutitle: ['发帖前先搜索，是黑市的基本礼仪哦～', '遇到感兴趣的帖子可以先马住～', '评论可以发图，甚至是GIF动图哦～', '举报到一定数值，帖子自动粉碎哦～',]
  },


  /**
   * 统一身份验证
   * @returns {boolean} true:通过 false:不通过(已弹窗)
   */
  checkFullLogin() {
    var ss_xxid = this.data.ss_xx._id;

    // 1. 登录
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
            console.log('用户点击确定');
            app.ss_xxid = ss_xxid;
            wx.switchTab({
              url: "/pages/my/wd/wd"
            });
          }
        }
      });
      return false;
    }

    // 2. 手机
    if (!app.userInfo.phone) {
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
            console.log('用户点击确定');
            wx.navigateTo({
              url: '/pages/my/set/set?phone=0' + '&ss_xxid=' + ss_xxid,
            });
          }
        }
      });
      return false;
    }

    // 3. 用户名
    if (!app.userInfo.userinfo.username || app.userInfo.userinfo.username == "微信用户") {
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
            console.log('用户点击确定');
            wx.navigateTo({
              url: '/pages/my/set/set?name=0' + '&ss_xxid=' + ss_xxid,
            });
          }
        }
      });
      return false;
    }

    // 4. 性别
    if (!app.userInfo.userinfo.gender) {
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
            console.log('用户点击确定');
            wx.navigateTo({
              url: '/pages/my/set/set?gender=0' + '&ss_xxid=' + ss_xxid,
            });
          }
        }
      });
      return false;
    }

    return true;
  },


  /**
   * 右上角弹窗显示/隐藏
   */
  show: function () {
    // 如果show值为true，则更改为false 反之设置true
    if (this.data.show) {
      this.setData({
        show: false
      });
    } else {
      this.setData({
        show: true
      });
    }
  },

  /**
   * 状态修改（活动结束/删除）
   */
  deleteistrue: function () {
    var _id = app.userInfo._id;
    // 检测是否是自己的
    // 优化：直接使用 onLoad 中已获取的管理员状态
    var mine = this.data.isAdmin;

    // 删除条件：2.自己的帖子。3.自己是管理员
    if (mine == true || _id == this.data.ss_xx.ss_xx.lzid) {
      let groups = [];
      // 判断是 跑腿/订单 还是 普通帖子/活动
      const openlocationtitle = this.data.ss_xx.ss_xx.orderdetail.openlocationtitle;

      if (openlocationtitle) {
        // 订单逻辑 takingorder
        const isTaken = this.data.ss_xx.ss_xx.orderdetail.takeorder;
        groups.push({
          text: isTaken ? '恢复派单' : '派单结束',
          value: 'toggle_status'
        });
      } else {
        // 活动逻辑 isover
        const isOver = this.data.ss_xx.ss_xx.isover;
        groups.push({
          text: isOver ? '活动恢复' : '活动结束',
          value: 'toggle_status'
        });
      }

      // 删除选项
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
   * 修改信息提交
   */
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

  bindDialogButtonTap(e) {
    console.log('dialog button tap', e)
    const { index } = e.detail;
    if (index === 0) {
      this.changewbnrtijiao();
    }
  },

  /**
   * 修改信息提交
   */
  async changewbnrtijiao() {
    // 获取当前数据 (之前是通过 form e.detail.value，现在是手动绑定)
    const detail = this.data.ss_xx.ss_xx.orderdetail;
    const textwbnr = this.data.ss_xx.ss_xx.nr;

    // 构造值对象
    const biaodan = {
      lianxi: detail.lianxi,
      weixin: detail.weixin,
      jg: detail.jg,
      ordertitle: detail.ordertitle,
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
    var text = textwbnr + ordertitle + weixin;
    var checkOk = await this.checkStr(text);
    // 审核不通过
    if (!checkOk) {
      wx.hideLoading({}); // 审核不通过隐藏
      wx.showToast({
        title: '含有违法违规内容',
        icon: 'none',
        duration: 4000,
      });
      return; // 这个return返回，停止继续执行
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
        return; // 这个return返回，停止继续执行
      }

      db.collection('ss').doc(that.data.id).update({
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
        return; // 这个return返回，停止继续执行
      } else if (ordertitle.length < 1) {
        wx.showToast({
          title: '标题',
          icon: 'none',
          duration: 800,
        });
        return; // 这个return返回，停止继续执行
      } else if (jg <= 2 && jg == "") {
        wx.showToast({
          title: '赏金不小于2元',
          icon: 'none',
          duration: 800,
        });
        return; // 这个return返回，停止继续执行
      }

      db.collection('ss').doc(that.data.id).update({
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
   * 关闭弹窗
   */
  closeDialog: function () {
    this.setData({
      istrue1: false,

    });

    // 2️⃣ 0.5 秒后移除 DOM
    setTimeout(() => {
      this.setData({
        istrue: false
      });
    }, 400); // 👈 0.3 秒
  },

  /**
   * 打开修改信息弹窗
   */
  openchangeinformation() {
    console.log("openchangeinformation called");
    var _id = app.userInfo._id;
    // 检测是否是自己的
    // 优化：直接使用 onLoad 中已获取的管理员状态
    var mine = this.data.isAdmin;
    console.log("mine:", mine, "lzid:", this.data.ss_xx.ss_xx.lzid, "myid:", _id);

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
      }, () => {
        console.log("istrue set to true");
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

  /**
   * 删除帖子
   */
  deletethisone() {
    this.setData({

    });
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
          console.log('用户点击确定');
          that.setData({
            ss_xx: 0
          });
          wx.showToast({
            title: '已删除',
            icon: "none"
          });

          db.collection('ss').doc(that.data.id).get().then((res) => {
            console.log(res.data.ss_xx.tp); // 取到图片判断删图
            var tp = res.data.ss_xx.tp;
            if (tp.length > 0) {
              wx.cloud.deleteFile({
                fileList: tp
              });
            }

            // 上面已经有了tp,直接删原帖子
            if (tp != null && tp != undefined) {
              db.collection('ss').doc(that.data.id).remove(); // 删了ss里面的记录
            }
          });

          db.collection('users').where({
            _id: app.userInfo._id
          }).update({
            data: {
              wenzhang: _.pull({
                id: _.eq(that.data.id)
              })
            }
          });

        } else if (res.cancel) {
          console.log('用户点击取消');
          wx.showToast({
            title: '取消删除',
            icon: 'none'
          });
        }
      }
    });
  },


  ////////////////接单按钮////

  /**
   * 接单按钮
   */
  kaishixuanze(e) {
    var obj = wx.getLaunchOptionsSync();
    if (obj.scene == 1154) {
      wx.showToast({
        title: '前往小程序👇',
        icon: 'none',
        duration: 2000,
      });
      return;
    }

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

    var _id = app.userInfo._id;
    if (_id != this.data.ss_xx.ss_xx.lzid) {
      db.collection('ss').doc(this.data.id).get().then((res) => {
        var takeorder = res.data.ss_xx.orderdetail.takeorder;

        if (takeorder) {
          this.setData({
            'ss_xx.ss_xx.orderdetail.takeorder': true,
          });

          wx.showToast({
            title: '已接单',
            icon: 'none',
            duration: 1500
          });
          return;
        } else {
          var phone = app.userInfo.phone;
          wx.showModal({
            title: "接单人联系方式",
            editable: true, // 显示输入框
            placeholderText: '请输入你的电话', // 显示输入框提示信息
            content: phone,

            success: res => {
              if (res.confirm) { // 点击了确认
                var takeorderphone = res.content;
                var _id = app.userInfo._id;
                var takeordername = app.userInfo.userinfo.username;

                db.collection('ss').doc(this.data.id).update({
                  data: {
                    'ss_xx.orderdetail.takeorder': true,
                    'ss_xx.orderdetail.takeorderid': _id,
                    'ss_xx.orderdetail.takeorderphone': takeorderphone,
                    'ss_xx.orderdetail.takeordername': takeordername
                  }
                }).then(res => {
                  wx.showToast({
                    title: '接单成功！',
                  });
                });
                app.shuaxin = true;

                this.setData({
                  'ss_xx.ss_xx.orderdetail.takeorder': true,
                  orderlzid: true
                });

                // 时间
                var timestamp = Date.parse(new Date());
                timestamp = timestamp / 1000;
                console.log("当前时间戳为：" + timestamp);

                // 获取当前时间
                var n = timestamp * 1000;
                var date = new Date(n);
                // 年
                var Y = date.getFullYear();
                // 月
                var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1);
                // 日
                var D = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
                // 时
                var h = date.getHours();
                // 分
                var m = date.getMinutes();
                // 秒
                // var s = date.getSeconds();

                var time = Y + "年" + M + "月" + D + "日" + h + ":" + m;

                var lzopenid = this.data.lzopenid;
                var orderid = this.data.ss_xx._id;
                var ordertitle = this.data.ss_xx.ss_xx.orderdetail.ordertitle;
                var liuyan = this.data.liuyan;
                var lzid = this.data.ss_xx.ss_xx.lzid;

                console.log("sssssddddfffff", lzid, liuyan, takeorderphone, time);
                wx.cloud.callFunction({
                  name: 'ordernotice',
                  data: {
                    orderid,
                    lzopenid,
                    ordertitle,
                    takeordername,
                    takeorderphone,
                    takeorderphoto: app.userInfo.userinfo.userphoto,
                    liuyan,
                    lzid
                  }
                }).then((res) => {
                  console.log("获取到openid:", res);
                });

              } else {
                console.log('用户点击了取消');
              }
            }
          });
        }
      });
    } else {
      wx.showToast({
        title: '自己不能接单',
        icon: 'none',
        duration: 800
      });
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
   * 活动结束
   */
  oderover(e) {
    if (e) console.log(e);
    var _id = app.userInfo._id;
    // 检测是否是自己的
    // 优化：直接使用 onLoad 中已获取的管理员状态
    var mine = this.data.isAdmin;

    // 删除条件：2.自己的帖子。3.自己是管理员
    if (mine == true || _id == this.data.ss_xx.ss_xx.lzid) {
      var isover = this.data.ss_xx.ss_xx.orderdetail.takeorder;
      if (!isover) {
        db.collection('ss').doc(this.data.id).update({
          data: {
            'ss_xx.orderdetail.takeorder': true
          }
        }).then(res => {
          wx.showToast({
            title: '结束',
          });

          this.setData({

            show: false,
            "ss_xx.ss_xx.orderdetail.takeorder": true
          });

          app.shuaxin = true;
        });
      } else {
        db.collection('ss').doc(this.data.id).update({
          data: {
            'ss_xx.orderdetail.takeorder': false,
            'ss_xx.orderdetail.takeorderid': "",
            'ss_xx.orderdetail.takeorderphone': "",
          }
        }).then(res => {
          if (e && e.detail) console.log(e.detail.value);
          this.setData({
            show: false,
            "ss_xx.ss_xx.orderdetail.takeorder": false,

          });

          wx.showToast({
            title: '恢复',
          });
          app.shuaxin = true;
        });
      }
    } else {
      wx.showToast({
        title: '无权修改',
        icon: 'none',
        duration: 800
      });
    }
  },

  /**
   * 活动结束
   */
  gameover(e) {
    if (e) console.log(e);
    var _id = app.userInfo._id;
    // 检测是否是自己的
    var mine = false;
    var myid = app.userInfo._id;
    for (var ii = 0; ii < app.glids.length; ii++) {
      if (app.glids[ii] == myid) {
        mine = true;
        break;
      }
    }

    // 删除条件：2.自己的帖子。3.自己是管理员
    if (mine == true || _id == this.data.ss_xx.ss_xx.lzid) {
      var isover = this.data.ss_xx.ss_xx.isover;
      if (!isover) {
        db.collection('ss').doc(this.data.id).update({
          data: {
            'ss_xx.isover': true
          }
        }).then(res => {
          wx.showToast({
            title: '活动结束',
          });

          this.setData({
            show: false,
            "ss_xx.ss_xx.isover": true,

          });

          app.shuaxin = true;
        });
      } else {
        db.collection('ss').doc(this.data.id).update({
          data: {
            'ss_xx.isover': false,
          }

        }).then(res => {
          if (e && e.detail) console.log(e.detail.value);
          this.setData({
            show: false,
            "ss_xx.ss_xx.isover": false,



          })

          wx.showToast({
            title: '活动恢复',
          })

          app.shuaxin = true

        })

      }
    } else (
      wx.showToast({
        title: '无权修改',
        icon: 'none',
        duration: 800
      })
    )

  },


  genghuan: function (e) {

    if (!this.data.already11) {
      let voteNumberPerPerson111 = e.currentTarget.dataset.num
      let isEnd111 = e.currentTarget.dataset.bool
      let option111 = e.currentTarget.dataset.obj

      this.setData({
        colorIndex: e.currentTarget.dataset.index,
        voteNumberPerPerson111,
        isEnd111,
        option111,
        already: true

      });
      console.log("xxxx", voteNumberPerPerson111,
        isEnd111,
        option111)
    }
  },

  // 进度条
  progress: function () {
    let that = this;
    let percent = 80; //获取percent
    that.setData({
      percent: percent
    })
  },



  //生命周期函数--监听页面加载
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const target = utils.getPostTarget(options, 'ss');
    this.commentId = target.commentId;
    // Initialize window metrics for top-based positioning
    const sys = wx.getSystemInfoSync();
    this.windowHeight = sys.windowHeight;
    this.windowWidth = sys.windowWidth;
    // Calculate input panel height (200rpx) in pixels
    this.inputPanelHeight = 200 * (sys.windowWidth / 750);
    console.log('[Debug] WindowHeight:', this.windowHeight, 'PanelHeight:', this.inputPanelHeight);

    var that = this;
    let alldibutitle = this.data.alldibutitle;
    let randomIndex = Math.floor(Math.random() * alldibutitle.length);
    var dibutitle = alldibutitle[randomIndex];
    var id = target.postId;

    if (options.zuiress_xx1) {
      var zuiress_xx1 = JSON.parse(decodeURIComponent(options.zuiress_xx1));
    }

    if (options.choosetitle1) {
      var choosetitle1 = JSON.parse(decodeURIComponent(options.choosetitle1));
    }

    wx.cloud.callFunction({
      name: "look",
      data: {
        id: id,
        type: 'ss'
      }
    });

    // 分享入口需要等待登录结果前先展示帖子；普通入口在身份状态设置后加载一次。
    if (options.fenxiang === 'true' || options.fenxiang === 'ture') {
      this.jiazai(id);
    }
    app.fxssid = id;
    app.fenxiang = options.fenxiang;
    var love = options.love;
    var reping = options.reping;
    var liuyan = options.liuyan;
    var takeorderid1 = options.takeorderid;
    var lzopenid = options.openid;
    var lzid = options.lzid;
    var DONOT = options.DONOT;
    var systeminfo = wx.getWindowInfo();

    if (options.heishiweixin) {
      var heishiweixin = options.heishiweixin;
    } else {
      var heishiweixin = app.heishiweixin;
    }

    // 使用 sort 方法和 Math.random 打乱数组顺序
    if ((options.fenxiang === 'true' || options.fenxiang === 'ture') && options.bannerList2) {
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
      movehight: systeminfo.windowHeight,
      movehight2: systeminfo.windowHeight - 150,
      heishiweixin,
      msgnb: app.userInfo.msgnb,
    });

    if (liuyan == 'true') {
      console.log('留言真');
      this.setData({
        liuyan: true,
        ku: 'tj'
      });
    }
    if (lzid === app.userInfo._id) {
      var orderlzid = true;
    }

    if (takeorderid1 == app.userInfo._id && takeorderid1 != "") {
      var orderlzid = true;
    }

    if (love == 'true') {
      var dianzan = true;
    } else if (love == 'false') {
      var dianzan = false;
    } else {
      var dianzan = -1;
    }

    if (options.fenxiang == 'false') {
      var zuiress_zhuanfa = options.zuiress_xx1;
    } else {
      var zuiress_zhuanfa = false;
    }

    this.setData({
      DONOT,
      choosetitle1,
      zuiress_xx1,
      zuiress_zhuanfa: zuiress_zhuanfa,
      fenxiang: options.fenxiang,
      openlocationtitle: options.openlocationtitle,
      takeorderid1: takeorderid1,
      dianzan: dianzan,
      id,
      reping: options.reping,
      openid: options.openid,
      lzid: options.lzid,
      orderlzid,
      lzopenid
    });

    // 键盘弹起
    this.setChatListHeight();
    wx.onKeyboardHeightChange(res => {
      console.log(res.height, 'kkkk');

      if (res.height > 0) {
        this.setData({
          keyboardHeight: res.height - 20,
          keyboardwidth: true,
          showKeyboardMask: true  // 键盘弹起，显示遮罩
        });
      } else {
        this.setData({
          keyboardHeight: res.height,
          keyboardwidth: false,
          activeReplyId: '',  // 键盘关闭，清除高亮
          showKeyboardMask: false  // 键盘收起，隐藏遮罩
        });
      }

      this.setChatListHeight();
    });

    // 判断是否为分享来的
    if (options.fenxiang === "true" || options.fenxiang === "ture") {
      console.log("登录");
      /* 调用云函数登录 */
      wx.cloud.callFunction({
        name: 'login',
        data: {}
      }).then((res) => {
        db.collection("users").where({
          _openid: res.result.openid
        }).get().then((res) => {
          app.userInfo = Object.assign(app.userInfo, res.data[0]);
          var _openid = app.userInfo._openid;
          if (_openid == "") {
            app.setPendingPostTarget({
              postId: id,
              postType: liuyan === 'true' ? 'tj' : 'ss',
              commentId: this.commentId,
              source: 'share'
            });
            /* 如果没有登录信息则跳转到wd */
            wx.showToast({
              title: '还未登录',
              icon: "none",
              duration: '1500'
            });
          } else {
            if (lzid == app.userInfo._id || takeorderid1 == app.userInfo._id) {
              var orderlzid = true;
            }
            console.log("取到openid");
            // 判断是否是管理员
            var mine = false;
            var myid = app.userInfo._id;
            for (var ii = 0; ii < app.glids.length; ii++) {
              if (app.glids[ii] == myid) {
                mine = true;
                break;
              }
            }
            this.setData({
              _openid: _openid,
              id,
              _id: app.userInfo._id,
              orderlzid,
              isAdmin: mine
            });
          }
        });
      });
    } else {
      var _openid = app.userInfo._openid;
      if (lzid == app.userInfo._id || takeorderid1 == app.userInfo._id) {
        var orderlzid = true;
      }
      // 判断是否是管理员
      var mine = false;
      var myid = app.userInfo._id;
      for (var ii = 0; ii < app.glids.length; ii++) {
        if (app.glids[ii] == myid) {
          mine = true;
          break;
        }
      }
      this.setData({
        _openid: _openid,
        _id: app.userInfo._id,
        orderlzid,
        isAdmin: mine
      });
      this.jiazai(id);
    }

    // 判断是否有了glid
    if (app.glid == "9999") {
      db.collection('system').where({
        '_id': '001'
      })
        .get().then((res) => {
          this.setData({
            glid: res.data[0].glid
          });
          app.glid = res.data[0].glid;
        });
    }
  },



  /**
   * 加载对应说说id的内容
   */
  jiazai(id) {
    if (!id) {
      this.setData({ ss_xx: 0, loadingHidden: true });
      return;
    }
    var ku = this.data.ku;
    db.collection(ku).where({
      '_id': id
    }).get().then(async (res) => {
      let updates = {};

      if (res.data[0] != undefined) {
        var ss_xx = utils.normalizePost(res.data[0]); // WXS处理名字，此处直接赋值

        // 普通帖没有投票选项，无需查询两个投票集合。
        if (Array.isArray(ss_xx.voteOption) && ss_xx.voteOption.length > 0) {
          VOTE_OPTION.where({
            id
          }).get().then((res) => {
            var options = res.data || [];
            this.setData({
              options
            });

            if (options.length === 0) return;

            return VOTE_RECORD.where({
              voteItemId: options[0].id,
              voterId: app.userInfo._openid
            }).get().then((res) => {
              let list = res.data;
              if (list.length > 0) {
                let colorIndex = list[0].colorIndex;
                this.setData({
                  colorIndex,
                  already11: true,
                  already22: true
                });
              }
            });
          }).catch((err) => {
            console.error('加载投票数据失败', err);
          });
        }

        // 初始化图片加载状态
        if (ss_xx.ss_xx.tp && ss_xx.ss_xx.tp.length > 0) {
          // 尝试获取旧有的tp2状态
          let oldTp2 = this.data.ss_xx && this.data.ss_xx.ss_xx && this.data.ss_xx.ss_xx.tp2;

          ss_xx.ss_xx.tp2 = ss_xx.ss_xx.tp.map((url, index) => {
            // 如果旧状态存在且URL匹配且已加载，则保持已加载状态
            if (oldTp2 && oldTp2[index] && oldTp2[index].loaded && this.data.ss_xx.ss_xx.tp[index] === url) {
              return { loaded: true };
            }
            return { loaded: false };
          });
        }

        // 处理评论点赞
        if (ss_xx.ss_xx.huifunr[0] != null && ss_xx.ss_xx.huifunr[0].pinglunID != null && ss_xx.ss_xx.huifunr[0].pinglunID != "") {
          var xx = await this.pllove(ss_xx.ss_xx.huifunr);

          // 评论排序
          xx.sort(function (a, b) {
            return a.pldianzannb - b.pldianzannb;
          });
          // 获取旧的评论列表用于状态保持
          let oldHuifunr = this.data.ss_xx && this.data.ss_xx.ss_xx && this.data.ss_xx.ss_xx.huifunr;
          let oldCommentById = Object.create(null);
          if (Array.isArray(oldHuifunr)) {
            oldHuifunr.forEach((old) => {
              if (old && oldCommentById[old.pinglunID] === undefined) {
                oldCommentById[old.pinglunID] = old;
              }
            });
          }

          xx.forEach(function (item) {
            // 通过评论 ID 恢复旧图片加载状态，避免逐条扫描旧评论列表。
            let oldItem = oldCommentById[item.pinglunID] || null;

            // 初始化评论图片加载状态
            if (item.tp && item.tp.length > 0) {
              item.tp2 = item.tp.map((url, idx) => {
                if (oldItem && oldItem.tp2 && oldItem.tp2[idx] && oldItem.tp2[idx].loaded && oldItem.tp[idx] === url) {
                  return { loaded: true };
                }
                return { loaded: false };
              });
            }
            // 初始化回复图片加载状态
            if (item.huifu && item.huifu.length > 0) {
              item.huifu.forEach((subItem, subIdx) => {
                if (subItem.tp && subItem.tp.length > 0) {
                  // 尝试找到对应的旧回复
                  let oldSubItem = oldItem && oldItem.huifu && oldItem.huifu[subIdx]; // 假设回复顺序不变，或者用更好的匹配方式

                  subItem.tp2 = subItem.tp.map((url, idx) => {
                    // 简单按索引和URL匹配回复图片
                    if (oldSubItem && oldSubItem.tp2 && oldSubItem.tp2[idx] && oldSubItem.tp2[idx].loaded && oldSubItem.tp[idx] === url) {
                      return { loaded: true };
                    }
                    return { loaded: false };
                  });
                }
              });
            }
          });
        }

        var dianzan = this.data.dianzan;
        if (dianzan == -1 && this.data.liuyan == false) {
          // 非总列表进入
          var yn = ss_xx.ss_xx.dianzanid.indexOf(app.userInfo._id);
          console.log("非列表进入", yn);
          if (yn != -1) {
            updates.dianzan = true;
          } else {
            updates.dianzan = false;
          }
        }

        if (this.data.liuyan == false) {
          app.ssinfo.lovenb = ss_xx.ss_xx.dianzannb;
          app.ssinfo.plnb = ss_xx.ss_xx.huifunb;
          app.ssinfo.looknb = ss_xx.ss_xx.look;
          app.ssinfo.reping = this.data.reping;

          if (!ss_xx.ss_xx.nr) {
            app.ssinfo.nr = "刚刚在天美社区看到个帖子，真是绝了！";
          } else {
            app.ssinfo.nr = ss_xx.ss_xx.nr
          }


          app.ssinfo.tp = ss_xx.ss_xx.tp
          if (res.data[0].ss_xx.jubao[1] < 20) {

            //判断是否马住
            let Mazhu = ss_xx.ss_xx.Mazhu
            if (Mazhu) {
              if (Mazhu.includes(app.userInfo._id)) {
                var PDMazhu = true
              } else {
                var PDMazhu = false
              }
            }

            updates.ss_xx = ss_xx;
            updates.PDMazhu = PDMazhu;
            updates.loadingHidden = true;

            if (ss_xx.ss_xx.lzid === app.userInfo._id) {
              var orderlzid = true
              updates.orderlzid = orderlzid;
            }


            this.addlookhistory(ss_xx)


          } else {
            updates.ss_xx = 0;
          }
        } else {
          updates.ss_xx = ss_xx;
        }

      } else {
        updates.ss_xx = 0;
      }

      updates.loadingHidden = true;
      this.setData(updates, () => utils.jumpToComment(this, this.commentId));
    }).catch((err) => {
      console.error('加载帖子失败', err);
      this.setData({ ss_xx: 0, loadingHidden: true });
      wx.showToast({ title: '加载失败，请稍后重试', icon: 'none' });
    })
  },

  // 图片加载成功回调
  imageOnLoad(e) {
    const index = e.currentTarget.dataset.index; // 图片索引
    const updateKey = `ss_xx.ss_xx.tp2[${index}].loaded`;
    this.setData({
      [updateKey]: true
    });
  },

  // 评论图片加载成功回调
  imageOnLoadComment(e) {
    const index0 = e.currentTarget.dataset.index0; // 评论索引
    const index1 = e.currentTarget.dataset.index1; // 回复索引 (如果有)

    if (index1 !== undefined) {
      // 回复的图片
      const updateKey = `ss_xx.ss_xx.huifunr[${index0}].huifu[${index1}].tp2[0].loaded`;
      this.setData({
        [updateKey]: true
      });
    } else {
      // 评论的图片
      const updateKey = `ss_xx.ss_xx.huifunr[${index0}].tp2[0].loaded`;
      this.setData({
        [updateKey]: true
      });
    }
  },
  addlookhistory(ss_xx) {
    var historyId = ss_xx._id;
    var timestamp = this.formatTime(new Date().getTime());
    var nr = ss_xx.ss_xx.nr;

    // 若已经登录，添加浏览记录
    if (app.userInfo.userinfo.login == true) {
      const historyEntry = {
        id: historyId, // 历史记录的ID
        timestamp: timestamp,
        nr: nr
      }; // 当前的时间戳

      db.collection("users").doc(app.userInfo._id).update({
        data: {
          lookhistory: _.push({ each: [historyEntry], slice: -10 }),
        }
      }).then(updateRes => {
        console.log('浏览记录已更新', updateRes);
      }).catch(updateErr => {
        console.error('更新浏览记录失败', updateErr);
      });
    }
  },

  /**
   * 格式化时间
   */
  formatTime: function (timestamp) {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  },

  /**
   * 改变评论顺序
   */
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

  /**
   * 跳转传参，传递板块名
   */
  tiaozhuan(e) {
    if (this.data.DONOT == "000") {
      var choosetitle = e.currentTarget.dataset.choosetitle;
      var choosetitle1 = JSON.stringify(this.data.choosetitle1);
      var zuiress_xx1 = JSON.stringify(app.zuiress_xx1);
      console.log("ccccvvvvvvv", choosetitle);
      wx.navigateTo({
        url: "/pages/plate1/plate1?choosetitle=" + choosetitle + "&choosetitle1=" + choosetitle1 + "&zuiress_xx1=" + encodeURIComponent(zuiress_xx1)
      });
    }
  },

  /**
   * 点击跳到详情
   */
  xiangqing(e) {
    var id = e.currentTarget.dataset.id;
    var lzid = e.currentTarget.dataset.lzid;
    var openid = e.currentTarget.dataset.openid;
    var love = e.currentTarget.dataset.love;
    var index = e.currentTarget.dataset.index;
    var reping = e.currentTarget.dataset.reping;

    console.log("index:", index);
    wx.cloud.callFunction({
      name: "look",
      data: {
        id: id,
        type: 'ss',
        num: 1
      }
    });

    if (love) {
      love = 'true';
    } else {
      love = 'false';
    }
    wx.navigateTo({
      url: "/pages/plate2/plate2?id=" + id + "&fenxiang=false&liuyan=false&love=" + love + "&reping=" + reping + "&openid=" + openid + "&lzid=" + lzid,
    });
    this.setData({
      index: index
    });
  },

  /**
   * 预览图片
   */
  previewImg: function (e) {
    // 获取当前图片的下标
    var index = e.currentTarget.dataset.tp[0];
    // 所有图片
    var imgs = e.currentTarget.dataset.tp[1];

    wx.previewImage({
      // 当前显示图片
      current: imgs[index],
      // 所有图片
      urls: imgs
    });
  },

  /**
   * 显示评论操作菜单 (长按触发)
   */
  showCommentMenu(e) {
    console.log("e.currentTarget.dataset", e.currentTarget.dataset)
    let { item, index0, index, type, index1, parentitem } = e.currentTarget.dataset;

    // 兼容 data-index0 和 data-index
    if (index0 === undefined && index !== undefined) {
      index0 = index;
    }

    const _id = app.userInfo._id;
    const lzid = this.data.ss_xx.ss_xx.lzid; // 楼主ID
    const isAdmin = this.data.isAdmin;

    // 基础菜单选项
    const groups = [
      { text: '回复', value: 'reply' },
      { text: '复制', value: 'copy' }
    ];

    // 判断是否有删除权限: 管理员 OR 楼主 OR 评论发布者
    if (isAdmin || lzid == _id || item.plrid == _id) {
      groups.push({ text: '删除', type: 'warn', value: 'delete' });
    }

    this.setData({
      showDialog: true,
      groups: groups,
      selectedComment: {
        item,
        index0,
        type, // 'main' or 'sub'
        index1,
        parentitem
      }
    });
  },

  /**
   * 关闭评论菜单 (actionSheet 会自动处理，这里主要是重置状态)
   */
  closeCommentMenu() {
    this.setData({
      showDialog: false
    });
  },

  /**
   * 菜单点击处理
   */
  btnClick(e) {
    const { value } = e.detail;
    this.closeCommentMenu();

    if (value === 'reply') {
      this.handleMenuReply();
    } else if (value === 'copy') {
      this.handleMenuCopy();
    } else if (value === 'delete') {
      this.handleMenuDelete();
    } else if (value === 'toggle_status') {
      const openlocationtitle = this.data.ss_xx.ss_xx.orderdetail.openlocationtitle;
      if (openlocationtitle) {
        this.oderover();
      } else {
        this.gameover();
      }
    } else if (value === 'delete_post') {
      this.deletethisone();
    }
  },

  /**
   * 菜单-回复
   */
  handleMenuReply() {
    const { item, index0, type, index1, parentitem } = this.data.selectedComment;

    // 调用现有的 huifu 方法
    const dataset = type === 'main' ?
      { xx: item, index: index0 } :
      { xx: parentitem, xx1: item, index: index0, index1: index1 };

    this.huifu({
      currentTarget: { dataset }
    });
  },

  /**
   * 菜单-复制
   */
  handleMenuCopy() {
    const { item } = this.data.selectedComment;

    wx.setClipboardData({
      data: item.wbnr,
      success: function () {
        wx.showToast({
          title: '已复制',
          icon: 'none'
        });
      }
    });
  },

  /**
   * 菜单-删除
   */
  handleMenuDelete() {
    const { item, index0, type, index1, parentitem } = this.data.selectedComment;

    // 构造 changanshanchu 需要的 dataset
    // 注意: changanshanchu 原逻辑需要 checking data-id0, index, time 等
    // data-id0="{{item0.plrid}}" data-index="{{index0}}" data-time="{{item0.time}}" 
    // sub: data-index1="{{index1}}" data-id1="{{item1.plrid}}" data-time1="{{item1.time}}"

    const dataset = type === 'main' ? {
      id0: item.plrid,
      index: index0,
      time: item.time,
      huifunb: item.huifunb
    } : {
      id0: parentitem.plrid,
      index: index0,
      time: parentitem.time,
      index1: index1,
      id1: item.plrid,
      time1: item.time
    };

    console.log("Delete Dataset Constructed:", dataset);

    this.changanshanchu({
      currentTarget: { dataset }
    });
  },

  /**
   * 删除评论 (原逻辑优化)
   */
  changanshanchu(e) {
    console.log("changanshanchu called with:", e.currentTarget.dataset);
    var _id = app.userInfo._id;
    // 检测是否是自己的
    if (e.currentTarget.dataset.id1 != undefined) {
      var pdwb = e.currentTarget.dataset.id1;
    } else {
      var pdwb = e.currentTarget.dataset.id0;
    }

    // 优化：直接使用 onLoad 中已获取的管理员状态
    var mine = this.data.isAdmin;
    console.log(pdwb, mine, this.data.ss_xx.ss_xx.lzid, _id);
    // 删除条件：1.自己发的。2.自己的帖子。3.自己是管理员
    if (pdwb == _id || mine == true || _id == this.data.ss_xx.ss_xx.lzid) {
      var index1 = "";
      var id1 = "";
      var time1 = "";
      var jianqu = 0;
      if (e.currentTarget.dataset.index1 != undefined) {
        index1 = e.currentTarget.dataset.index1;
        id1 = e.currentTarget.dataset.id1;
        time1 = e.currentTarget.dataset.time1;
      } else {
        // 判断该评论下的二级评论
        var nb = e.currentTarget.dataset.huifunb;
        console.log("删除", nb);
        if (nb != undefined && nb != 0) {
          jianqu = nb;
        }
      }
      var that = this;
      wx.showModal({
        title: '提示💡',
        content: '删除后无法恢复！',
        confirmText: '确认删除',
        confirmColor: '#FF4D49',
        cancelText: '取消',
        cancelColor: '#8b8b8b',
        success(res) {
          if (res.confirm) {
            console.log('用户点击确定');
            var id = e.currentTarget.dataset.id0; // 这是这条l0评论的id
            var index = e.currentTarget.dataset.index;
            var ss_xx = that.data.ss_xx.ss_xx;

            if (e.currentTarget.dataset.index1 == undefined) {
              // 这是lv0删除
              ss_xx.huifunr.splice(index, 1); // 删除指定index记录
            } else {
              // 这是lv1，2删除
              console.log("删除lv12,index1:", index1);
              ss_xx.huifunr[index].huifu.splice(index1, 1);
            }

            that.setData({
              "ss_xx.ss_xx": ss_xx
            });
            wx.showToast({
              title: '删除成功',
              icon: "none"
            });
            app.ssinfo.plnb = app.ssinfo.plnb - 1 - jianqu;
            var xx = that.data.ss_xx;
            xx.ss_xx.huifunb = app.ssinfo.plnb;
            that.setData({
              ss_xx: xx
            });
            var time = e.currentTarget.dataset.time;
            var _data = {
              id0: id, // 这是这条lv0评论的id
              id1: id1, // 这是这条lv1.2评论的id
              time: time, // 这是这条lv0评论的
              time1: time1, // 这是这条lv1.2评论的
              id: that.data.id, // 这是这条ss的
              liuyan: that.data.liuyan, // 用于云函数判断删除所在集合
            };
            console.log("id1::", id);
            console.log("id1::", id1);
            // 下面云函数delete评论
            wx.cloud.callFunction({
              name: 'delete',
              data: {
                _data
              },
              type: "ss"
            });
            // 判断ss是否还有自己的评论，
            var haiyou = false;
            var haiyou = JSON.stringify(ss_xx.huifunr).includes(app.userInfo._id);
            // 没了就删掉自己评论过的记录
            if (haiyou == false) {
              db.collection('users').doc(app.userInfo._id).update({
                data: {
                  pinglunguode: _.pull({
                    id: _.eq(that.data.id)
                  })
                }
              });
              return;
            }

          } else if (res.cancel) {
            console.log('用户点击取消');
          }
        }
      });
    } else {
      wx.showToast({
        title: '无权删除',
        icon: 'none',
        duration: 800
      });
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
   * 发送评论
   */
  async fasong() {
    // 未登录
    if (!this.checkFullLogin()) return;

    var text = this.data.wbnr;
    var imgs = this.data.imgs;
    // console.log("hhhhhh", this.data.xx.wbnr)
    if (text.length == 0 && imgs.length == 0) {
      wx.showToast({
        title: '没说什么',
        icon: 'none',
        duration: 800,
      });
      return;
    }

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
    console.log("是否禁言：", ban);
    // 1.文本审核
    wx.showLoading({
      title: '传送中...',
      mask: true
    });

    if (text.length != 0) {
      var checkOk = await this.checkStr(text);
      // 审核不通过
      if (!checkOk) {
        wx.hideLoading({}); // 审核不通过隐藏
        wx.showToast({
          title: '含有违法违规内容',
          icon: 'none',
          duration: 4000,
        });
        return; // 这个return返回，停止继续执行
      }
    }

    var img = this.data.imgs; // 图片路径赋值给变量img
    var that = this; // 用that表当前外部对象
    // 开始图片审核，图片数量＞0时
    that.setData({
      Imgs: []
    });

    if (img.length != 0) {
      // 判断格式
      var index = img[0].lastIndexOf(".");
      var ext = img[0].substring(index + 1);
      console.log("imageformat", ext.toString());

      if (ext.toString() == "GIF") {
        var imageformat = true;
      } else if (ext.toString() == "gif") {
        var imageformat = true;
      } else {
        var imageformat = false;
      }

      if (!imageformat) {
        var format = "png";
        console.log("imageformat", imageformat);
        var imgok = await that.imgcheck();
        if (!imgok) {
          wx.hideLoading({}); // 审核不通过隐藏
          wx.showToast({
            title: '图片检测出现问题',
            icon: 'none',
            duration: 2000,
          });
          console.log("成功");
          return; // 这个return返回，停止继续执行
        }
      } else {
        var format = "GIF";
        var imgok = await that.GIFimgcheck();
        if (!imgok) {
          wx.hideLoading({}); // 审核不通过隐藏
          wx.showToast({
            title: '动图检测出现问题',
            icon: 'none',
            duration: 2000,
          });
          // console.log("图片违法")
          return; // 这个return返回，停止继续执行
        }
      }
    }

    wx.showLoading({
      title: '快送到了..',
      mask: true
    });

    // 2.判断楼主与匿名
    var louzhu = false;
    var niming = false;
    // 是楼主的话继承发帖状态
    if (app.userInfo._id == this.data.ss_xx.ss_xx.lzid) {
      // 是楼主的话继承发帖状态
      louzhu = true;
      niming = this.data.ss_xx.ss_xx.niming1;
    }
    var pinglunguode = await this.fasongqian(app.userInfo._id);
    // console.log("获取到评论过的：",pinglunguode)
    var first = Array.isArray(pinglunguode) && JSON.stringify(pinglunguode).includes(this.data.id);
    // 判断是回复帖子，还是回复评
    // 3.写其他数据并整合
    if (app.userInfo._id == this.data.ss_xx.ss_xx.lzid) {
      var name = "楼主";
    } else {
      var name = app.userInfo.userinfo.username;
    }
    var pinglunnr = {
      isorder: this.data.ss_xx.ss_xx.orderdetail.ordertitle ? true : false,
      dianzhanID: [], // 点赞人的id
      pldianzannb: 0, // 该帖点赞数量
      pinglunID: this.data.id + new Date().getTime(), // 评论的id
      liuyan: this.data.liuyan,
      title: this.data.ss_xx.title,
      photo: app.userInfo.userinfo.userphoto,
      gender: app.userInfo.userinfo.gender, // 性别
      name: name,
      time: new Date().getTime(), // 发布时间
      plrid: app.userInfo._id, // 评论人我的id
      bhfpl: this.data.xx ? this.data.xx.wbnr : '',  // 安全访问，防止xx为null
      wbnr: text,
      tp: [], // 图片数组！！！！！！！！！数组缺少图片
      ywnr: this.data.ss_xx.ss_xx.nr,
      zhuanye: app.userInfo.userinfo.zhuanye,
      louzhu: louzhu,
      niming: niming,
      ssid: this.data.id,
      lzid: this.data.ss_xx.ss_xx.lzid,
      lv: 0, // 表示对帖子的直接评论
      huifu: [],
      path: "pages/plate2/plate2?id=" + this.data.id + "&fenxiang=true&liuyan=" + this.data.liuyan
    };

    if (this.data.liuyan == true) {
      pinglunnr.ywnr = "【推文】" + this.data.ss_xx.title;
    }
    if (pinglunnr.ywnr.length == 0) {
      pinglunnr.ywnr = '分享的' + this.data.ss_xx.ss_xx.tp.length + '张图片';
    }
    var pd = [first, "", ""]; // 判断用，first,__openid(被评论的),__time(被评论的)
    var riqi = utils.dateFormat(pinglunnr.time, "yyyy-MM-dd hh:mm"); // 发送订阅消息所用日期格式
    pinglunnr.riqi = riqi;
    // 楼主才有此步骤，判断匿名
    var xx = this.data.xx; // 原回复
    // 说明点击了回复按钮
    if (xx && xx != "") {  // 同时检查xx不为null
      // 说明点击了回复按钮，此时不知回复层级
      pd[1] = xx.lv0;
      pd[2] = xx.time;
      var lv = xx.lv; // 其实被回复人lv
      pinglunnr.bhfpl = xx.wbnr; // 被回复的评论
      pinglunnr.bhfid = xx.id;
      if (lv == 0) {
        // console.log("0")//回复lv0
        pinglunnr.lv = 1;

        var index = this.data.index;
        var zhankai = "ss_xx.ss_xx.huifunr[" + index + "].zhankai";
        console.log('😄', zhankai);
        this.setData({
          [zhankai]: true,
        });
      } else {
        // console.log("1")//回复lv1,lv2
        pinglunnr.lv = 2;
        pinglunnr.yuanname = pinglunnr.name;
        pinglunnr.name = pinglunnr.name + " 回复 " + xx.name;
      }
    }

    // 马住回复id合集
    var Mazhu = this.data.ss_xx.ss_xx.Mazhu;
    var PDMazhu = this.data.PDMazhu;
    if (PDMazhu) {
      var Mazhu = Mazhu.filter(item => item !== app.userInfo._id);
    }
    console.log("MAzhu", Mazhu);

    // 上传图片
    var Imgs = that.data.Imgs;
    console.log("imgs:", Imgs);
    if (Imgs.length != 0) {
      var fileID = [];
      var time = new Date().getTime();

      // 并行上传所有图片
      const uploadPromises = Imgs.map((filePath, i) => {
        return new Promise((resolve, reject) => {
          // 获取文件扩展名
          let ext = filePath.substring(filePath.lastIndexOf(".") + 1).toLowerCase();
          // 如果没有扩展名或者扩展名不合法，默认使用 jpg
          if (!ext || ext.length > 4) {
            ext = "jpg";
          }

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
        pinglunnr.tp = fileID; // ！！！说说信息中的图片写入完毕
        console.log("说说图片", fileID);
        // 带图发帖
        this.fbpl(pinglunnr, pd, Mazhu); // 云函数上传发表
      } catch (err) {
        wx.hideLoading();
        wx.showToast({
          title: '图片上传失败',
          icon: 'none',
          duration: 2000
        });
        console.error("图片上传失败", err);
        return;
      }

    } else {
      // 纯文本发帖
      this.fbpl(pinglunnr, pd, Mazhu); // 云函数上传发表
    }



    wx.hideLoading({});
    // 评论成功

    var huifunr = this.data.ss_xx.ss_xx.huifunr;
    // 这里本地进行判断
    app.ssinfo.plnb++;
    console.log(app.ssinfo.plnb);
    var xx = this.data.ss_xx;
    xx.ss_xx.huifunb = app.ssinfo.plnb;
    this.setData({
      ss_xx: xx
    });
    if (pd[1] != "") {
      // 这是回复别人
      var index = this.data.index;
      huifunr[index].huifu.push(pinglunnr);
      huifunr[index].huifunb++;
    } else {
      huifunr.push(pinglunnr);
    }
    console.log("说说图片33333331", huifunr);

    this.setData({
      "ss_xx.ss_xx.huifunr": huifunr,
      wbnr: "",
      xx: "",
      imgs: [],
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
   * 发送前刷新内容
   */
  async fasongqian(e) {
    // console.log(e)
    return db.collection('users').doc(e).field({ pinglunguode: true }).get().then((res) => {
      // console.log(res)
      // 只获取 pinglunguode 字段，不再覆盖整个 app.userInfo
      return res.data ? res.data.pinglunguode || [] : [];
    }).catch(() => []);
  },

  /**
   * 回复别人的评论1
   */
  /**
   * 输入框失去焦点
   */
  onInputBlur() {
    this.setData({
      focus: false
    });
  },

  /**
   * 回复用户的评论
   */
  /**
   * 输入框失去焦点
   */
  onInputBlur() {
    this.setData({
      focus: false
    });
  },

  /**
   * 回复用户的评论
   */
  huifu(e) {
    var index1 = e.currentTarget.dataset.index1;
    var xx = e.currentTarget.dataset.xx;
    var xx1 = e.currentTarget.dataset.xx1;

    if (index1 == undefined) {
      //这是回复lv0
      var name = xx.name;
      xx.id = xx.plrid;
      xx.lv0 = xx.plrid;
    } else {
      xx.wbnr = xx1.wbnr;
      xx.id = xx1.plrid;
      xx.lv0 = xx.plrid;

      //这是回复lv1,2
      xx.lv = xx1.lv;
      if (xx1.lv == 1) {
        var name = xx1.name;
      } else {
        var name = xx1.yuanname;
      }
    }

    xx.name = name; //此处特殊整合信息！！！
    console.log("存下：", xx);

    // 计算高亮ID - 适用于所有评论类型
    const replyIndex0 = e.currentTarget.dataset.index;
    const replyIndex1 = e.currentTarget.dataset.index1;
    let activeReplyId = '';

    if (replyIndex1 == undefined || replyIndex1 === null) {
      // 主评论
      activeReplyId = 'comment-content-' + replyIndex0;
    } else {
      // 子评论（包括展开的）
      activeReplyId = 'sub-comment-' + replyIndex0 + '-' + replyIndex1;
    }

    //拉起键盘进行回复
    this.setData({
      input: "回复 " + name,
      focus: true, //拉起键盘
      xx: xx,
      index: e.currentTarget.dataset.index,
      activeReplyId: activeReplyId,  // 设置高亮
      wbnr: ''  // 清空之前的输入内容，避免误发送到新的回复对象
    });
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

  onInputBlur() {
    console.log('[Debug] Input Blur. Clearing focus.');
    this.setData({
      focus: false,
      activeReplyId: '' // Clear highlight
    });
  },

  onPageScroll(e) {
    if (this.data.focus) {
      // Throttle log? For debugging now, just log.
      console.log('[Debug] Scroll:', e.scrollTop, 'KeyboardH:', this.data.keyboardHeight);
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
      });
      return;
    }
    let messageList = this.data.messageList;
    messageList.push(curMessage);
    this.setData({
      curMessage: "",
      messageList: messageList
    });
  },

  /**
   * 点击确认
   */
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

  // 去轮播图详情页
  toBannerDetail(e) {
    var type = e.currentTarget.dataset.type;
    var Appid1 = e.currentTarget.dataset.appid;
    var Appid = encodeURIComponent(Appid1);
    var title1 = e.currentTarget.dataset.title;

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
      var title = encodeURIComponent(title1);
      wx.navigateTo({
        url: '/pages/bannerDetail/bannerDetail?title=' + title + "&type=" + type,
      });
    }
  },

  // 展开评论
  zhankai(e) {
    console.log(e.currentTarget.dataset.index); // 该条评论所在数组的下表
    var index = e.currentTarget.dataset.index;
    var zhankai = "ss_xx.ss_xx.huifunr[" + index + "].zhankai";
    // console.log(zhankai)
    this.setData({
      [zhankai]: true,
    });
  },

  // 收起评论
  shouqi(e) {
    console.log(e.currentTarget.dataset.index); // 该条评论所在数组的下表
    var index = e.currentTarget.dataset.index;
    var zhankai = "ss_xx.ss_xx.huifunr[" + index + "].zhankai";
    // console.log(zhankai)
    this.setData({
      [zhankai]: false,
    });
  },

  // 用云函数发表评论
  async fbpl(pinglunnr, pd, Mazhu) {
    console.log("xxxxlllll", Mazhu);
    try {
      var res = await wx.cloud.callFunction({
        name: 'fbpl',
        data: {
          pinglunnr: pinglunnr,
          pd: pd,
          Mazhu: Mazhu
        }
      });
      console.log(res);
      return res.result;
    } catch (err) {
      console.log(err);
      return false;
    }
  },

  // 实时获取input,写到data中储存为wbnr
  wbnr(e) {
    // console.log(e.detail.value)
    this.setData({
      wbnr: e.detail.value
    });
  },

  // 举报帖子
  jubao(e) {
    // 判断是否举报过
    // console.log(e)
    var jubao = e.currentTarget.dataset.jubao; // 取到jubao数组
    var id = app.userInfo._id;
    this.setData({
      show: false
    });

    // 未登录
    var ss_xxid = this.data.ss_xx._id;

    if (!this.checkFullLogin()) return;

    var ban = app.userInfo.ban;
    if (ban == true) {
      wx.showToast({
        title: '账号被封！',
        icon: 'none',
        duration: 7000
      });
      return;
    }
    var glid = app.glid;
    if (id != glid) {
      var yn = JSON.stringify(jubao[0]).includes(id);
      if (yn) {
        wx.showToast({
          title: "举报过了",
          icon: "none"
        });
        return;
      }
    }

    // console.log("云函数举报")
    var that = this;
    wx.showModal({
      title: '提示',
      content: '确认举报？(恶意举报将会封号)',
      showCancel: true,
      confirmText: '确认举报',
      confirmColor: '#FF4D49',
      cancelText: '取消',
      cancelColor: '#000000',
      success(res) {
        if (res.confirm) {
          console.log('用户点击确定');
          var ssid = e.currentTarget.dataset.id; // 取到ssid
          var cc = that.data.ss_xx.ss_xx.nr;
          if (cc.length == 0) {
            cc = '分享的' + that.data.ss_xx.ss_xx.tp.length + '张图片';
            // pinglunnr.ywnr='分享的'+this.data.ss_xx.ss_xx.tp.length+'张图片'
          }
          console.log("cc:", cc);
          wx.cloud.callFunction({
            name: "jubao",
            data: {
              id: ssid,
              time: new Date().getTime(), // 发布时间
              ywnr: cc, // 这里没有判断空文本的情况！！！
              jbrid: app.userInfo._id // 举报人
            }
          });

          // 更新本地举报
          var ss_xx = that.data.ss_xx;
          ss_xx.ss_xx.jubao[0].push(id);
          ss_xx.ss_xx.jubao[1]++;
          console.log(ss_xx.ss_xx.jubao);
          that.setData({
            ss_xx: ss_xx
          });

          wx.showToast({
            title: '举报成功',
            icon: "none"
          });

        } else if (res.cancel) {
          console.log('用户点击取消');
        }
      }
    });
  },

  // 长名字显示处理







  fuzhi(e) {
    //console.log(e.currentTarget.dataset.item)
    wx.setClipboardData({
      data: e.currentTarget.dataset.item,
      success(res) {
        console.log("成功")
      }
    })
  },


  //用户转发
  onShareTimeline: function () {



    var jg = this.data.ss_xx.ss_xx.orderdetail.jg
    var ordertitle = this.data.ss_xx.ss_xx.orderdetail.ordertitle
    var query = 'id=' + this.data.id + '&postId=' + this.data.id + '&postType=' + (this.data.liuyan ? 'tj' : 'ss') + '&source=share&fenxiang=ture&liuyan=' + this.data.liuyan

    if (ordertitle) {
      return {
        title: "派单" + jg + "元｜" + ordertitle,
        imageUrl: app.ssinfo.tp[0],
        query: query + '&takeorderid=' + this.data.takeorderid1 + '&lzid=' + this.data.lzid

      }
    } else {
      return {
        title: app.ssinfo.nr,
        imageUrl: app.ssinfo.tp[0],
        query: query + '&lzid=' + this.data.lzid,
      }
    }
  },


  onShareAppMessage: function () {
    var jg = this.data.ss_xx.ss_xx.orderdetail.jg;
    var ordertitle = this.data.ss_xx.ss_xx.orderdetail.ordertitle;
    var sharePath = "/pages/plate2/plate2?id=" + this.data.id + "&postId=" + this.data.id + "&postType=" + (this.data.liuyan ? 'tj' : 'ss') + "&source=share&fenxiang=ture&liuyan=" + this.data.liuyan;

    if (ordertitle) {
      // console.log("path:/pages/plate2/plate2?id=" + this.data.id)
      // console.log(app.ssinfo.nr)
      var fenxiang = "ture";
      var takeorderid1 = this.data.takeorderid1;
      var lzid = this.data.lzid;
      return {
        title: "派单" + jg + "元｜" + ordertitle,
        imageUrl: app.ssinfo.tp[0],
        path: sharePath + "&takeorderid=" + takeorderid1 + "&lzid=" + lzid
      };
    } else {
      console.log("path:/pages/plate2/plate2?id=" + this.data.id);
      console.log("xxxhhhhhhxxx", this.data.zuiress_zhuanfa);
      return {
        title: app.ssinfo.nr,
        imageUrl: app.ssinfo.tp[0],
        path: sharePath
      };
    }
  },

  /**
   * 检查用户权限
   */
  checkuser(e) {
    var id = e.currentTarget.dataset.id;

    // 优化：直接使用 onLoad 中已获取的管理员状态
    var mine = this.data.isAdmin;

    // 自己是管理员
    if (mine == true) {
      wx.navigateTo({
        url: "../checkuser/checkuser?id=" + id
      });
    }
  },

  /**
   * 投票
   */
  vote(e) {
    var obj = wx.getLaunchOptionsSync();
    if (obj.scene == 1154) {
      wx.showToast({
        title: '前往小程序👇',
        icon: 'none',
        duration: 2000,
      });
      return;
    }
    // 未登录
    if (!this.checkFullLogin()) return;

    let _this = this;
    let voteNumberPerPerson = this.data.voteNumberPerPerson111;
    let option = this.data.option111;

    // console.log('---', option,voteNumberPerPerson);
    if (!voteNumberPerPerson || !option) {
      wx.showToast({
        title: '选择一个',
        icon: 'none',
        duration: 800,
      });
      return;
    } else {
      VOTE_RECORD.where({
        voteItemId: this.data.id,
        voterId: app.userInfo._openid
      }).get().then((res) => {
        let votedNumber = 0;
        let list = res.data;
        if (list.length > 0) {
          list.forEach((element, index) => {
            votedNumber += element.voteNumber;
            if (index == list.length - 1) {
              let remainVoteNumber = voteNumberPerPerson - votedNumber;
              if (remainVoteNumber > 0) {
                _this.setData({
                  remainVoteNumber,
                  option,
                  already: false
                });
                this.onConfirm();
              } else {
                wx.showToast({
                  title: '投过票啦',
                  icon: 'none',
                  duration: 800,
                });
                return;
              }
            }
          });
        } else {
          _this.setData({
            remainVoteNumber: voteNumberPerPerson,
            option,
            already: false
          });
          this.onConfirm();
        }
      }).catch((res) => {
        console.log(res.errMsg);
      });
    }
  },

  /**
   * 确认投票
   */
  onConfirm(e) {
    let _this = this;
    VOTE_RECORD.add({
      data: {
        voteTime: new Date(),
        voteItemId: _this.data.id,
        voteOptionId: _this.data.option._id,
        voterId: app.userInfo._openid,
        voteNumber: _this.data.number,
        colorIndex: this.data.colorIndex
      },

      success(res) {
        // 添加浏览数
        wx.cloud.callFunction({
          name: "VoteOption",
          data: {
            id: _this.data.option._id,
            itemid: _this.data.id,
          },
          success(res) {
            wx.showToast({
              title: '投票成功',
              icon: 'none',
              duration: 800,
            });
            _this.jiazai(app.fxssid);
          },
          fail(res) {
            console.log(res.errMsg);
          }
        });
      },
      fail(res) {
        console.log(res.errMsg);
      }
    });
  },

  /**
   * 显示 Toast
   */
  showToast(text, icon, iconColor, duration) {
    this.setData({
      $toast: {
        show: true,
        text: text,
        icon: icon,
        iconColor: iconColor
      }
    });
    setTimeout(() => {
      this.setData({
        $toast: {
          show: false,
          text: '',
          icon: '',
          iconColor: ''
        }
      });
    }, duration);
  },

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
    // console.log("图片路径",media)
    return new Promise((resolve, reject) => {
      wx.getFileSystemManager().readFile({
        filePath: media,
        success: res => {
          // console.log("刚转换完",res.data)
          resolve(res.data);
        }
      });
    });
  },

  /**
   * 图片压缩
   */
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

  // 删除图片
  deleteImg: function (e) {
    var imgs = this.data.imgs;
    var index = e.currentTarget.dataset.index;
    imgs.splice(index, 1);
    this.setData({
      imgs: imgs
    });
  },

  // 添加图片
  // 添加图片
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
          if (imgs.length + tempFiles.length > 9) return null; // Simple check to avoid processing too many if initial imgs + new files exceed 9

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
              // 非GIF图片进行压缩，质量 0.6，最大边长 800 (与post.js保持一致)
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

        // 过滤掉 null (如果有的话) 并添加到 imgs
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

  // 处理点赞数据
  async pllove(e) {
    console.log(e);
    var l = e.length;
    for (var i = 0; i < l; i++) {
      var yn = e[i].dianzhanID.indexOf(app.userInfo._id);
      // console.log(yn,"jjjjjjjjjjjjjjjjj")
      if (yn == -1) {
        e[i].pllove = false;
      } else {
        e[i].pllove = true;
      }
    }
    return e;
  },

  // 点赞帖子(这里得加index)
  pldianzan(e) {
    var _id = app.userInfo._id;
    var id = e.currentTarget.dataset.id;
    var plid = e.currentTarget.dataset.plid;
    var index0 = e.currentTarget.dataset.index0;
    console.log(e.currentTarget.dataset);

    var obj = wx.getLaunchOptionsSync();
    console.log('启动小程序的路径:', obj.path);
    console.log('启动小程序的场景值:', obj.scene);
    console.log('启动小程序的 query 参数:', obj.query);
    console.log('来源信息:', obj.shareTicket);
    console.log('来源信息参数appId:', obj.referrerInfo.appId);
    console.log('来源信息传过来的数据:', obj.referrerInfo.extraData);

    if (obj.scene == 1154) {
      wx.showToast({
        title: '前往小程序👇',
        icon: 'none',
        duration: 2000,
      });
      return;
    }

    // 未登录
    var ss_xxid = this.data.ss_xx._id;

    // 未登录
    if (!this.checkFullLogin()) return;
    // Get notification data
    var time = new Date().getTime();
    var name = app.userInfo.userinfo.username;
    var photo = app.userInfo.userinfo.userphoto;
    // Use dataset values as they are explicitly passed in WXML
    var pllzid = e.currentTarget.dataset.pllzid;
    var plnr = e.currentTarget.dataset.plnr;

    wx.cloud.callFunction({
      name: "dianzan",
      data: {
        id: id,
        dzrid: _id,
        plid: plid,
        type: 'sspinglun',
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
    this.setData({
      ss_xx: ss_xx
    });
  },

  // 马住
  mazhu(e) {
    var obj = wx.getLaunchOptionsSync();
    if (obj.scene == 1154) {
      wx.showToast({
        title: '前往小程序👇',
        icon: 'none',
        duration: 2000,
      });
      return;
    }

    // 未登录
    var ss_xxid = this.data.ss_xx._id;

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
            console.log('用户点击确定');
            wx.switchTab({
              url: "../my/wd/wd"
            });
            return;
          } else if (res.cancel) {
            console.log('用户点击取消');
            return;
          }
        }
      });
      return;
    }
    if (app.userInfo.phone == undefined || app.userInfo.phone == null || app.userInfo.phone == "") {
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
            console.log('用户点击确定');
            wx.navigateTo({
              url: '/pages/my/set/set?phone=0' + '&ss_xxid=' + ss_xxid,
            });
            return;
          } else if (res.cancel) {
            console.log('用户点击取消');
            return;
          }
        }
      });
      return;
    }

    // 未登录
    if (!this.checkFullLogin()) return;


    var _id = app.userInfo._id
    if (_id != this.data.ss_xx.ss_xx.lzid) {
      console.log("llllll")
      if (!this.data.PDMazhu) {
        db.collection('ss').doc(this.data.id).update({
          data: {
            // 假设数组字段名为'arrayFieldName'
            'ss_xx.Mazhu': _.push(_id)
          }
        })
          .then(res => {
            this.setData({
              PDMazhu: true
            })

            wx.showToast({
              title: '已马',
              icon: 'none',
              duration: 1000
            })
            console.log(res);
          })
          .catch(err => {
            wx.showToast({
              title: 'bug',
              icon: 'none',
              duration: 1000
            })
            console.error(err);
          });

      } else {

        db.collection('ss').doc(this.data.id).update({
          data: {
            // 假设数组字段名为'arrayFieldName'
            'ss_xx.Mazhu': _.pull(_id)
          }
        })
          .then(res => {
            this.setData({
              PDMazhu: false
            })

            wx.showToast({
              title: '弃坑',
              icon: 'none',
              duration: 1000
            })
            console.log(res);
          })
          .catch(err => {
            wx.showToast({
              title: 'bug',
              icon: 'none',
              duration: 1000
            })
            console.error(err);
          });

      }
    }
  },

  // 点赞帖子
  dianzan(e) {
    var id = app.userInfo._id;
    var ssid = e.currentTarget.dataset.id;
    var obj = wx.getLaunchOptionsSync();
    console.log('用户', app.userInfo);
    if (obj.scene == 1154) {
      wx.showToast({
        title: '前往小程序👇',
        icon: 'none',
        duration: 2000,
      });
      return;
    }

    // 未登录
    // 未登录
    if (!this.checkFullLogin()) return;

    // Get current time
    var time = new Date().getTime();
    var name = app.userInfo.userinfo.username;
    var photo = app.userInfo.userinfo.userphoto;
    var lzid = this.data.ss_xx._openid;
    var ywnr = this.data.ss_xx.ss_xx.nr;

    wx.cloud.callFunction({
      name: "dianzan",
      data: {
        id: ssid,
        dzrid: id, // 点赞人id
        type: 'ss',
        name: name,
        photo: photo,
        time: time,
        lzid: lzid,
        ywnr: ywnr
      }
    });
    var ss_xx = this.data.ss_xx;
    if (this.data.dianzan) {
      ss_xx.ss_xx.dianzannb--;
      app.ssinfo.lovenb--;
      this.setData({
        dianzan: false,
        ss_xx: ss_xx
      });
      app.loveinfo = 'false';
    } else {
      ss_xx.ss_xx.dianzannb++;
      app.ssinfo.lovenb++;
      this.setData({
        dianzan: true,
        ss_xx: ss_xx
      });
      app.loveinfo = 'true';
    }
  },

  /**
   * 输入框获得焦点
   */
  onInputFocus() {
    this.setData({
      isKeyboardOpen: true,
      focus: true
    });
  },

  /**
   * 输入框失去焦点
   */
  onInputBlur() {
    this.setData({
      isKeyboardOpen: false,
      focus: false
    });
  },

  // 判断登录,返回true或false
  async islogin() {
    var _id = this.data._id;
    if (_id != "") {
      return true;
    } else {
      return false;
    }
  },

  // 回到首页
  blackindex() {
    var obj = wx.getLaunchOptionsSync();
    if (obj.scene == 1154) {
      wx.showToast({
        title: '前往小程序👇',
        icon: 'none',
        duration: 2000,
      });
      return;
    }
    wx.switchTab({
      url: '/pages/index/index'
    });
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

  // 阻止遮罩层滚动
  preventTouchMove() { }

})
