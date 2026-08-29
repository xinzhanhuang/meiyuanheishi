const app = getApp()
const { errorMessage } = require('./cloud-call')
const postService = require('../services/post-service')

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
    async success(res) {
      if (res.confirm) {
        console.log('用户点击确定');
        var ssid = e.currentTarget.dataset.id; // 取到ssid
        var cc = that.data.ss_xx.ss_xx.nr;
        if (cc.length == 0) {
          cc = '分享的' + that.data.ss_xx.ss_xx.tp.length + '张图片';
          // pinglunnr.ywnr='分享的'+this.data.ss_xx.ss_xx.tp.length+'张图片'
        }
        console.log("cc:", cc);
        try {
          await postService.reportPost({
            id: ssid,
            time: new Date().getTime(), // 发布时间
            ywnr: cc, // 这里没有判断空文本的情况！！！
            jbrid: app.userInfo._id // 举报人
          });
        } catch (err) {
          console.error('举报失败', err);
          wx.showToast({ title: errorMessage(err, '举报失败'), icon: 'none' });
          return;
        }

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

  async gameover() {
  try {
    const targetIsOver = this.data.ss_xx.ss_xx.isover !== true;
    const result = await postService.managePost('toggleActivity', {
      postId: this.data.id,
      isover: targetIsOver
    });
    this.setData({ show: false, 'ss_xx.ss_xx.isover': result.isover });
    app.shuaxin = true;
    wx.showToast({ title: result.isover ? '活动结束' : '活动恢复' });
  } catch (err) {
    console.error('修改活动状态失败', err);
    wx.showToast({ title: errorMessage(err, '状态修改失败'), icon: 'none' });
  }
},

  async oderover() {
  try {
    const targetTakeOrder = this.data.ss_xx.ss_xx.orderdetail.takeorder !== true;
    const result = await postService.managePost('toggleOrder', {
      postId: this.data.id,
      takeorder: targetTakeOrder
    });
    this.setData({
      show: false,
      'ss_xx.ss_xx.orderdetail.takeorder': result.takeorder,
      'ss_xx.ss_xx.orderdetail.takeorderid': result.takeorder ? this.data.ss_xx.ss_xx.orderdetail.takeorderid : '',
      'ss_xx.ss_xx.orderdetail.takeorderphone': result.takeorder ? this.data.ss_xx.ss_xx.orderdetail.takeorderphone : ''
    });
    app.shuaxin = true;
    wx.showToast({ title: result.takeorder ? '结束' : '恢复' });
  } catch (err) {
    console.error('修改派单状态失败', err);
    wx.showToast({ title: errorMessage(err, '状态修改失败'), icon: 'none' });
  }
},

  callphone: function (e) {
  let phone = e.currentTarget.dataset.phone;
  wx.makePhoneCall({
    phoneNumber: phone,
  });
},

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
        console.log('用户点击确定');
        postService.managePost('deletePost', { postId: that.data.id }).then(() => {
          that.setData({ ss_xx: 0 });
          app.shuaxin = true;
          wx.showToast({ title: '已删除', icon: 'none' });
        }).catch((err) => {
          console.error('删除帖子失败', err);
          wx.showToast({ title: errorMessage(err, '删除失败，请重试'), icon: 'none' });
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
