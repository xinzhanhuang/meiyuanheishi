const app = getApp()
const db = wx.cloud.database()
const _ = db.command
const utils = require('../../../utils/util.js')

Page({

  data: {

    slideButtons: [{
      text: '删除',
      type: 'warn',
      extClass: 'delete-btn'
    }],
    item: "",
    startX: 0, // 开始X坐标
    startY: 0, // 开始Y坐标
  },


  async onLoad() {

    // Sort messages by time (newest first)
    if (app.message && app.message.length > 0) {
      app.message.sort((a, b) => {
        return new Date(b.time).getTime() - new Date(a.time).getTime();
      });
    }

    this.setData({
      message: app.message,

    })
    console.log("😄", app.message)
  },

  /* WeUI Slideview Button Tap */
  slideButtonTap(e) {
    console.log('slide button tap', e.detail)
    // index 0 is the delete button
    if (e.detail.index === 0) {
      this.delete(e);
    }
  },






  delete(e) {
    console.log("hahhhhh", this.data.message)
    console.log(e.currentTarget.dataset.index)
    console.log(e.currentTarget.dataset.ssid)
    var id = e.currentTarget.dataset.id
    var index = e.currentTarget.dataset.index
    var that = this
    //删除users里的message记录
    //删除消息记录
    // 创建新的消息数组，不包含要删除的消息
    var message = this.data.message.filter((msg, idx) => idx !== index)

    //把本地改一下（立即更新UI，不等待数据库响应）
    var zs = message.length
    var x = []
    for (var i = 0; i < zs; i++) {
      x[i] = 0
    }

    this.setData({
      message: message,
      x: x,
      xx: x
    })

    db.collection("users").doc(app.userInfo._id)
      .update({
        data: {
          message: db.command.pull({
            "id": db.command.eq(id)//这里不知道行不
          })
        }
      }).then((res) => {
        console.log("删消息（已读）", res)
        // 更新app中的消息数据
        app.message = message
        app.userInfo.message = message
        // 检查并更新红点状态
        var weidu = message.length
        if (weidu == 0) {
          // 没有未读消息，移除红点
          if (app.hongdian) {
            wx.removeTabBarBadge({ index: 2 })
            app.hongdian = false
          }
        } else {
          // 更新红点数字
          wx.setTabBarBadge({
            index: 2,
            text: weidu.toString()
          })
          app.hongdian = true
        }
      })
  },



  alldelete(e) {

    var message = this.data.message
    if (message.length > 0) {

      db.collection("users").doc(app.userInfo._id)
        .update({
          data: {
            message: []
          }
        }).then((res) => {
          console.log("删消息（已读）", res)
          // 更新app中的消息数据
          app.message = []
          app.userInfo.message = []
          // 移除红点
          if (app.hongdian) {
            wx.removeTabBarBadge({
              index: 2
            });
            app.hongdian = false;
          }

          wx.showToast({
            title: 'ok',
            icon: 'none',
            duration: 800
          })
        })



      this.setData({
        message: [],

      })

      // 立即更新红点状态（不等待数据库响应）
      if (app.hongdian) {
        wx.removeTabBarBadge({
          index: 2
        });
        app.hongdian = false;
      }

    } else {

      wx.showToast({
        title: '啥也没有了',
        icon: 'none',
        duration: 800
      })

    }
  },









  //查看评论的说说
  chakan(e) {
    //要查看的说说的id
    console.log("e:", e)
    var ssid = e.currentTarget.dataset.ssid
    var id = e.currentTarget.dataset.id
    var liuyan = e.currentTarget.dataset.liuyan
    var type = e.currentTarget.dataset.type
    var postType = e.currentTarget.dataset.postType || (type == 'zhoubiantype' ? 'zhoubian' : 'ss')

    console.log("id:", id, type)
    //console.log(ssid)
    this.setData({
      id: id
    })

    // Auto-delete removed per user request. 
    // Messages persist until explicitly deleted.

    // EXCEPTION: Rejection notifications should be removed upon handling (editing)
    if (type === 'reject') {
      var that = this;
      // Delete this message from DB
      db.collection("users").doc(app.userInfo._id)
        .update({
          data: {
            message: db.command.pull({
              "id": db.command.eq(id)
            })
          }
        }).then((res) => {
          console.log("删消息（已读-拒绝通知）", res)
          // Update Local Message List
          var message = that.data.message.filter(msg => msg.id !== id)
          that.setData({
            message: message
          })
          // Update App Global Data
          app.message = message
          app.userInfo.message = message
          // Update Badge
          var weidu = message.length
          if (weidu == 0) {
            if (app.hongdian) {
              wx.removeTabBarBadge({ index: 2 })
              app.hongdian = false
            }
          } else {
            wx.setTabBarBadge({
              index: 2,
              text: weidu.toString()
            })
            app.hongdian = true
          }
        })

      wx.navigateTo({
        url: "../../post-zhoubian/post-zhoubian?id=" + ssid + "&isEdit=true"
      })
    } else if (postType == 'zhoubian' || postType == 'tj') {
      wx.navigateTo({
        url: utils.getPostTargetUrl({ postId: e.currentTarget.dataset.postId || ssid, postType, commentId: e.currentTarget.dataset.commentId || id, replyId: e.currentTarget.dataset.replyId, source: 'message', liuyan })
      })
    } else {
      wx.navigateTo({
        url: utils.getPostTargetUrl({ postId: e.currentTarget.dataset.postId || ssid, postType, commentId: e.currentTarget.dataset.commentId || id, replyId: e.currentTarget.dataset.replyId, source: 'message', liuyan })
      })

    }
  },

})
