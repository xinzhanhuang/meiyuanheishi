var app = getApp()
var utils = require('../../utils/util')
Page({

  data: {
    wenzhang: [{
      nr: "",
      id: "",
      total: "0"
    }],
    canshu: false,


    item: "",
    ISorder: '',
    slideButtons: [{
      text: '删除',
      type: 'warn',
      extClass: 'delete-btn'
    }]
  },


  async onLoad(options) {

    var originalArray = app.userInfo.wenzhang

    console.log("originalArray",originalArray)
    var canshu = true
    this.setData({
      wenzhang: originalArray,
      canshu: canshu,

    })
  },



  /* WeUI Slideview Button Tap */
  slideButtonTap(e) {
    console.log('slide button tap', e.detail)
    // index 0 is the delete button
    if (e.detail.index === 0) {
      this.delete(e);
    }
  },

  // 生命周期函数--监听页面加载
  delete(e) {
    console.log(e.currentTarget.dataset.id)
    console.log(e.currentTarget.dataset.index)
    var that = this
    wx.showModal({
      title: '提示',
      content: '删除后无法恢复',
      showCancel: true,
      confirmText: '确认删除',
      confirmColor: '#FF4D49',
      cancelText: '取消',
      cancelColor: '#000000',
      success(res) {
        if (res.confirm) {
          console.log('用户点击确定')
          var ssid = e.currentTarget.dataset.id
          var type = e.currentTarget.dataset.type
          var index = e.currentTarget.dataset.index
          var collection = type == 'zhoubiantype' ? 'tianmeizhoubian' : 'ss'
          wx.showLoading({ title: '删除中', mask: true })
          wx.cloud.callFunction({
            name: 'delete',
            data: { action: 'deletePost', postId: ssid, collection }
          }).then((result) => {
            var response = result && result.result
            if (!response || response.success !== true) {
              throw new Error((response && response.errCode) || 'DELETE_POST_FAILED')
            }
            var wenzhang = that.data.wenzhang.slice()
            wenzhang.splice(index, 1)
            var x = []
            x[index] = 0
            app.userInfo.wenzhang = wenzhang
            that.setData({
              wenzhang,
              x
            })
            wx.hideLoading()
            wx.showToast({ title: '删除成功', icon: 'none' })
          }).catch((err) => {
            wx.hideLoading()
            console.error('删除帖子失败', err)
            wx.showToast({ title: '删除失败', icon: 'none' })
          })
        } else if (res.cancel) {
          console.log('用户点击取消')
          wx.showToast({
            title: '取消删除',
            icon: 'none'
          })
        }
      }
    })
  },



  //生命周期函数--监听页面显示
  onShow: function () {

  },
  // Image load handler
  imageOnLoad(e) {
    const index = e.currentTarget.dataset.index;
    const wenzhang = this.data.wenzhang;
    if (wenzhang[index]) {
      wenzhang[index].loaded = true;
      this.setData({
        [`wenzhang[${index}].loaded`]: true
      });
    }
  },

  //查看评论的说说
  chakan(e) {
    //要查看的说说的id
    //console.log(ssid)
    var ssid = e.currentTarget.dataset.ssid
    var type = e.currentTarget.dataset.type


    wx.navigateTo({
      url: utils.getPostTargetUrl({
        postId: ssid,
        postType: type == 'zhoubiantype' ? 'zhoubian' : 'ss',
        source: 'profile'
      })
    })



  },


})
