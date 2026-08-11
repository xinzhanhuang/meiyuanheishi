var app = getApp()
var db = wx.cloud.database()
var _ = db.command
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
          var wenzhang = that.data.wenzhang
          wenzhang.splice(index, 1); //删除指定index记录
          that.setData({
            wenzhang: wenzhang
          })
          app.userInfo.wenzhang = wenzhang
          var x = []
          x[index] = 0
          that.setData({
            x: x
          })
          wx.showToast({
            title: '删除成功',
            icon: "none"
          })


          if (type == 'zhoubiantype') {
            db.collection('tianmeizhoubian').doc(ssid).get().then((res) => {
              console.log(res.data.ss_xx.tp) //取到图片判断删图！！！！！！！
              var tp = res.data.ss_xx.tp
              if (tp.length > 0) {
                wx.cloud.deleteFile({
                  fileList: tp
                })
              }

              //上面已经有了tp,直接删原帖子
              if (tp != null && tp != undefined) {
                db.collection('tianmeizhoubian').doc(ssid).remove() //删了ss里面的记录
              }


              db.collection('users').where({
                _id: app.userInfo._id
              }).update({
                data: {
                  wenzhang: _.pull({
                    id: _.eq(ssid)
                  })
                }
              })
            })
          } else if (type != 'zhoubiantype') {
            db.collection('ss').doc(ssid).get().then((res) => {
              console.log(res.data.ss_xx.tp) //取到图片判断删图！！！！！！！
              var tp = res.data.ss_xx.tp
              if (tp.length > 0) {
                wx.cloud.deleteFile({
                  fileList: tp
                })
              }

              //上面已经有了tp,直接删原帖子
              if (tp != null && tp != undefined) {
                db.collection('ss').doc(e.currentTarget.dataset.id).remove() //删了ss里面的记录
              }
            })

            db.collection('users').where({
              _id: app.userInfo._id
            }).update({
              data: {
                wenzhang: _.pull({
                  id: _.eq(ssid)
                })

              }

            })

          }





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


    if (type == 'zhoubiantype') {
      wx.navigateTo({
        url: "../plate-zhoubian/plate-zhoubian?id=" + ssid + "&fenxiang=false&liuyan=false"
      })
    } else if (type != 'zhoubiantype') {
      wx.navigateTo({
        url: "../plate2/plate2?id=" + ssid + "&fenxiang=false&liuyan=false"
      })

    }



  },


})