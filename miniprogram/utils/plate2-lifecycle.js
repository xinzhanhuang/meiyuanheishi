const app = getApp()
const db = wx.cloud.database()
const utils = require('./util')

module.exports = {

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
  } else {
    var zuiress_xx1 = app.zuiress_xx1 || false;
  }

  if (options.choosetitle1) {
    var choosetitle1 = JSON.parse(decodeURIComponent(options.choosetitle1));
  } else {
    var choosetitle1 = app.choosetitle1 || false;
  }

  wx.cloud.callFunction({
    name: "look",
    data: {
      id: id,
      type: target.liuyan ? 'tj' : 'ss',
      num: 1
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

  const applyUserState = () => {
    var orderlzid = lzid == app.userInfo._id || takeorderid1 == app.userInfo._id;
    var mine = app.glids.indexOf(app.userInfo._id) !== -1;
    this.setData({
      _openid: app.userInfo._openid,
      id,
      _id: app.userInfo._id,
      orderlzid,
      isAdmin: mine
    });
  };

  // 判断是否为分享来的
  if (options.fenxiang === "true" || options.fenxiang === "ture") {
    if (app.userInfo._openid) {
      applyUserState();
    } else {
      wx.cloud.callFunction({
      name: 'login',
      data: {}
    }).then((res) => {
      return db.collection("users").where({
        _openid: res.result.openid
      });
    }).then((res) => {
      if (res.data[0]) app.userInfo = Object.assign(app.userInfo, res.data[0]);
      if (app.userInfo._openid) return applyUserState();
      app.setPendingPostTarget({ postId: id, postType: 'ss', commentId: this.commentId, source: 'share', liuyan: liuyan === 'true' });
      wx.showToast({ title: '还未登录', icon: 'none', duration: 1500 });
    }).catch((err) => {
      console.warn('分享入口登录状态读取失败', err);
    });
    }
  } else {
    applyUserState();
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

  onPageScroll(e) {
  if (this.data.focus) {
    // Throttle log? For debugging now, just log.
    console.log('[Debug] Scroll:', e.scrollTop, 'KeyboardH:', this.data.keyboardHeight);
  }
}
}
