const utils = require('../../utils/util')
const userService = require('../../services/user-service')
const adminService = require('../../services/admin-service')



Page({

  /**
   * 页面的初始数据
   */
  data: {
    status: true,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {

    //生命周期函数--监听页面加载

    this.jiazai(options.id)
  },



  //加载对应说说id的内容
  // 加载对应说说id的内容
  jiazai(id) {
    userService.getById(id).then((user) => {
      if (!user) throw new Error('用户不存在')
      var userdata = [user]; // 保持页面数据结构

      // 确保 lookhistory 存在并且是数组
      if (userdata[0].lookhistory && Array.isArray(userdata[0].lookhistory)) {
        // 如果 lookhistory 没有时间字段，直接获取最后 10 条
        userdata[0].lookhistory = userdata[0].lookhistory.slice(-10); // 取最后 10 条
      }

      // 判断权限
      var switch1Checked = userdata[0].ban === true ? true : false;
      var quanxian = userdata[0].ban === true ? true : false;

      this.setData({
        userdata,
        quanxian,
        switch1Checked
      });
    }).catch(err => {
      console.error('获取用户信息失败', err)
      wx.showToast({ title: '获取用户信息失败', icon: 'none' })
    })
  },

  //灯  26  high1 low1
  switch1Change(e) {
    //拿到状态
    var switch1Checked = e.detail.value
    var userdata = this.data.userdata
    var user = userdata && userdata[0]
    if (!user) return

    // Optimistic update
    this.setData({
      switch1Checked: switch1Checked,
      quanxian: switch1Checked
    });

    adminService.setUserBan(user._id, switch1Checked).then(() => {
      wx.showToast({ title: switch1Checked ? '已封' : '解封' })
    }).catch(err => {
      console.error(switch1Checked ? '封号失败' : '解封失败', err)
      this.setData({ switch1Checked: !switch1Checked, quanxian: !switch1Checked })
      wx.showToast({ title: '操作失败', icon: 'none' })
    })
  },

  /////////////////////详情
  //点击跳到详情！！！！！！！！！！！！！！
  xiangqing(e) {
    var id = e.currentTarget.dataset.id

    var lzid = e.currentTarget.dataset.lzid
    var openid = e.currentTarget.dataset.openid
    var love = e.currentTarget.dataset.love
    var index = e.currentTarget.dataset.index
    var reping = e.currentTarget.dataset.reping

    var takeorderid = e.currentTarget.dataset.takeorderid
    var openlocationtitle = e.currentTarget.dataset.openlocationtitle



    console.log("index:", index)
    if (love) {
      love = 'true'
    } else {
      love = 'false'
    }
    wx.navigateTo({
      url: utils.getPostTargetUrl({ postId: id, postType: 'ss', source: 'profile' })
    })
    this.setData({
      index: index
    })
  },

  copyUserInfo: function (e) {
    const userInfo = e.currentTarget.dataset.info;
    wx.setClipboardData({
      data: userInfo,
      success: function () {
        wx.showToast({
          title: '已复制到剪贴板',
          icon: 'success',
          duration: 2000
        });
      }
    });
  },



  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})
