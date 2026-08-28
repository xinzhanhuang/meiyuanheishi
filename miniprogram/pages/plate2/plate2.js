const db = wx.cloud.database();
const app = getApp();
const _ = db.command;
const utils = require('../../utils/util.js');
const { submitVote } = require('../../utils/plate2-vote');
const { callCloudFunction, errorMessage } = require('../../utils/cloud-call');
const commentMethods = require('../../utils/plate2-comments');
const shareMethods = require('../../utils/plate2-share');
const lifecycleMethods = require('../../utils/plate2-lifecycle');
const managementMethods = require('../../utils/plate2-management');
const dataMethods = require('../../utils/plate2-data');
const imageMethods = require('../../utils/plate2-images');

Page({
  ...commentMethods,
  ...shareMethods,
  ...lifecycleMethods,
  ...managementMethods,
  ...dataMethods,
  ...imageMethods,
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
   * 统一身份验证：仅需 OpenID 账号，个人资料均可选。
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

    if (!openlocationtitle && textwbnr.length == 0) {
      wx.hideLoading();
      wx.showToast({ title: '再多说点吧！', icon: 'none', duration: 800 });
      return;
    }
    if (openlocationtitle) {
      if (!phone && !weixin) {
        wx.hideLoading();
        wx.showToast({
          title: '至少一个联系方式',
          icon: 'none',
          duration: 800,
        });
        return; // 这个return返回，停止继续执行
      } else if (ordertitle.length < 1) {
        wx.hideLoading();
        wx.showToast({
          title: '标题',
          icon: 'none',
          duration: 800,
        });
        return; // 这个return返回，停止继续执行
      } else if (jg <= 2 && jg == "") {
        wx.hideLoading();
        wx.showToast({
          title: '赏金不小于2元',
          icon: 'none',
          duration: 800,
        });
        return; // 这个return返回，停止继续执行
      }

    }
    try {
      await callCloudFunction('delete', {
        action: 'editPost',
        postId: this.data.id,
        nr: textwbnr,
        ordertitle,
        lianxi: phone,
        jg,
        weixin
      });
      this.setData({ istrue: false });
      app.shuaxin = true;
      wx.showToast({ title: '修改成功' });
    } catch (err) {
      console.error('修改帖子失败', err);
      wx.showToast({ title: errorMessage(err, '修改失败，请重试'), icon: 'none' });
    } finally {
      wx.hideLoading();
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
  /**
   * 活动结束
   */
  /**
   * 活动结束
   */
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
  /**
   * 加载对应说说id的内容
   */
  // 图片加载成功回调
  // 评论图片加载成功回调
  /**
   * 格式化时间
   */
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
      app.choosetitle1 = this.data.choosetitle1;
      console.log("ccccvvvvvvv", choosetitle);
      wx.navigateTo({
        url: "/pages/plate1/plate1?choosetitle=" + choosetitle
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
    // 登录时已经取得该字段，无需在每次评论前再次直读 users 集合。
    var pinglunguode = app.userInfo.pinglunguode || [];
    // console.log("获取到评论过的：",pinglunguode)
    var first = Array.isArray(pinglunguode) && JSON.stringify(pinglunguode).includes(this.data.id);
    // 判断是回复帖子，还是回复评
    // 3.写其他数据并整合
    if (app.userInfo._id == this.data.ss_xx.ss_xx.lzid) {
      var name = "楼主";
    } else {
      var name = app.userInfo.userinfo.username || '校园用户';
    }
    var pinglunnr = {
      isorder: this.data.ss_xx.ss_xx.orderdetail.ordertitle ? true : false,
      dianzhanID: [], // 点赞人的id
      pldianzannb: 0, // 该帖点赞数量
      pinglunID: this.data.id + new Date().getTime(), // 评论的id
      liuyan: this.data.liuyan,
      title: this.data.ss_xx.title,
      photo: app.userInfo.userinfo.userphoto || '/images/message/touxiang1.png',
      gender: app.userInfo.userinfo.gender || '', // 性别
      name: name,
      time: new Date().getTime(), // 发布时间
      plrid: app.userInfo._id, // 评论人我的id
      bhfpl: this.data.xx ? this.data.xx.wbnr : '',  // 安全访问，防止xx为null
      wbnr: text,
      tp: [], // 图片数组！！！！！！！！！数组缺少图片
      ywnr: this.data.ss_xx.ss_xx.nr,
      zhuanye: app.userInfo.userinfo.zhuanye || '',
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

  // 举报帖子
  // 长名字显示处理







  /**
   * 检查用户权限
   */
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
    }

    _this.setData({ option, already: false });
    this.onConfirm();
  },

  /**
   * 确认投票
   */
  onConfirm(e) {
    return submitVote(this);
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
  /**
   * 图片取buffer
   */
  /**
   * 图片压缩
   */
  /**
   * 图片压缩 (Canvas 2D)
   */
  // 图片压缩及审核
  // 图片压缩及审核
  // 图片压缩及审核
  // 图片压缩及审核
  // 删除图片
  // 添加图片
  // 添加图片
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
  async mazhu(e) {
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
    // 未登录
    if (!this.checkFullLogin()) return;


    if (app.userInfo._id == this.data.ss_xx.ss_xx.lzid) {
      wx.showToast({ title: '自己的帖子无需马住', icon: 'none' });
      return;
    }
    if (this._bookmarkSubmitting) return;
    this._bookmarkSubmitting = true;
    try {
      const result = await callCloudFunction('dianzan', { type: 'mazhu', id: this.data.id });
      this.setData({ PDMazhu: result.bookmarked });
      wx.showToast({ title: result.bookmarked ? '已马' : '弃坑', icon: 'none', duration: 1000 });
    } catch (err) {
      console.error('码住失败', err);
      wx.showToast({ title: errorMessage(err, '操作失败，请重试'), icon: 'none' });
    } finally {
      this._bookmarkSubmitting = false;
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
