const app = getApp();
const commentService = require('../services/comment-service');
const postService = require('../services/post-service');
const { errorMessage } = require('./cloud-call');

module.exports = {
  // 点赞帖子(这里得加index)
  async pldianzan(e) {
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

    if (this._commentLikeSubmitting) return;
    this._commentLikeSubmitting = true;
    try {
      await commentService.toggleLike({
        id: id,
        dzrid: _id,
        plid: plid,
        name: name,
        photo: photo,
        time: time,
        pllzid: pllzid,
        plnr: plnr
      });
    } catch (err) {
      wx.showToast({ title: errorMessage(err, '点赞失败'), icon: 'none' });
      return;
    } finally {
      this._commentLikeSubmitting = false;
    }
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
      const loginTarget = { postId: this.data.id, postType: 'ss', source: 'login' };
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
            app.setPendingPostTarget(loginTarget);
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
      const result = await postService.bookmarkPost(this.data.id);
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
  async dianzan(e) {
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

    if (this._postLikeSubmitting) return;
    this._postLikeSubmitting = true;
    try {
      await postService.toggleLike({
        id: ssid,
        dzrid: id, // 点赞人id
        name: name,
        photo: photo,
        time: time,
        lzid: lzid,
        ywnr: ywnr
      });
    } catch (err) {
      wx.showToast({ title: errorMessage(err, '点赞失败'), icon: 'none' });
      return;
    } finally {
      this._postLikeSubmitting = false;
    }
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
};
