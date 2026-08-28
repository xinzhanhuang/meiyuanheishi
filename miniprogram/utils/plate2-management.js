const app = getApp()
const db = wx.cloud.database()
const _ = db.command

module.exports = {

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

  callphone: function (e) {
  let phone = e.currentTarget.dataset.phone;
  wx.makePhoneCall({
    phoneNumber: phone,
  });
},

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
}
}
