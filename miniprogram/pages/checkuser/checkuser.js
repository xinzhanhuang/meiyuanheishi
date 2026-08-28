var db = wx.cloud.database()
const app = getApp()



Page({

  /**
   * 页面的初始数据
   */
  data: {
    ku: "users",
    status: true,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {

    //生命周期函数--监听页面加载

    this.jiazai(options.id)
    console.log(options)




  },



  //加载对应说说id的内容
  // 加载对应说说id的内容
  jiazai(id) {
    var ku = this.data.ku;
    //console.log("哭哭哭：",ku)
    db.collection(ku).where({ '_id': id }).get().then(async (res) => {
      console.log(res.data, "数据");
      var userdata = res.data; // 获取第一个元素中的 userdata

      // 确保 lookhistory 存在并且是数组
      if (userdata[0].lookhistory && Array.isArray(userdata[0].lookhistory)) {
        // 如果 lookhistory 没有时间字段，直接获取最后 10 条
        userdata[0].lookhistory = userdata[0].lookhistory.slice(-10); // 取最后 10 条
      }

      // 判断权限
      var switch1Checked = userdata[0].ban === true ? true : false;
      var quanxian = userdata[0].ban === true ? true : false;

      console.log("lookhistory", userdata, userdata.lookhistory);
      this.setData({
        userdata,
        quanxian,
        switch1Checked
      });
    });
  },

  //灯  26  high1 low1
  switch1Change(e) {
    //拿到状态
    var switch1Checked = e.detail.value
    var userdata = this.data.userdata

    // Optimistic update
    this.setData({
      switch1Checked: switch1Checked,
      quanxian: switch1Checked
    });

    if (switch1Checked == false) {
      console.log("开灯")

      wx.cloud.callFunction({ name: 'checknotice', data: {
        action: 'setUserBan', userId: userdata[0]._id, ban: false
      }}).then(res => {
        if (!res.result || !res.result.success) throw new Error('解封失败')

        wx.showToast({
          title: '解封',
        })
      }).catch(err => {
        console.error("解封失败", err);
        // Revert on failure
        this.setData({
          switch1Checked: true,
          quanxian: true
        });
        wx.showToast({
          title: '操作失败',
          icon: 'none'
        });
      })

    } else {
      console.log("关灯")


      wx.cloud.callFunction({ name: 'checknotice', data: {
        action: 'setUserBan', userId: userdata[0]._id, ban: true
      }}).then(res => {
        if (!res.result || !res.result.success) throw new Error('封号失败')

        wx.showToast({
          title: '已封',
        })
      }).catch(err => {
        console.error("封号失败", err);
        // Revert on failure
        this.setData({
          switch1Checked: false,
          quanxian: false
        });
        wx.showToast({
          title: '操作失败',
          icon: 'none'
        });
      })
    }
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
      url: "../plate2/plate2?id=" + id + "&fenxiang=false&liuyan=false&love=" + love + "&reping=" + reping + "&openid=" + openid + "&lzid=" + lzid + "&takeorderid=" + takeorderid + "&openlocationtitle=" + openlocationtitle
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
