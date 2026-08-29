const app = getApp()
const utils = require('../../../utils/util.js')
const { callCloudFunction } = require('../../../utils/cloud-call')

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
        if (app.userInfo.dzmessage && app.userInfo.dzmessage.length > 0) {
            app.userInfo.dzmessage.sort((a, b) => {
                return new Date(b.time).getTime() - new Date(a.time).getTime();
            });
        }

        this.setData({
            message: app.userInfo.dzmessage,

        })
        console.log("😄", app.userInfo.dzmessage)
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

        callCloudFunction('login', { action: 'removeMessage', messageType: 'dzmessage', id }).then((res) => {
                console.log("删消息（已读）", res)
                // 更新app中的消息数据
                app.userInfo.dzmessage = message

                // Update badge
                var weidu = app.message.length + message.length
                if (weidu == 0) {
                    if (app.hongdian) {
                        wx.removeTabBarBadge({ index: app.myTabIndex })
                        app.hongdian = false
                    }
                } else {
                    wx.setTabBarBadge({
                        index: app.myTabIndex,
                        text: weidu.toString()
                    })
                    app.hongdian = true
                }

            }).catch(err => console.error('删除点赞消息失败', err))
    },



    alldelete(e) {

        var message = this.data.message
        if (message.length > 0) {

            callCloudFunction('login', { action: 'clearMessages', messageType: 'dzmessage' }).then((res) => {
                    console.log("删消息（已读）", res)
                    // 更新app中的消息数据
                    app.userInfo.dzmessage = []

                    wx.showToast({
                        title: 'ok',
                        icon: 'none',
                        duration: 800
                    })
                }).catch(err => console.error('清空点赞消息失败', err))



            this.setData({
                message: [],

            })


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
        var subtype = e.currentTarget.dataset.subtype
        var postType = e.currentTarget.dataset.postType || (subtype == 'tianmeizhoubian' ? 'zhoubian' : 'ss')

        console.log("id:", id, type)
        //console.log(ssid)
        this.setData({
            id: id
        })

        // Auto-delete removed per request.

        wx.navigateTo({
            url: utils.getPostTargetUrl(utils.getPostTarget({
                postId: e.currentTarget.dataset.postId || ssid,
                postType, commentId: e.currentTarget.dataset.commentId,
                replyId: e.currentTarget.dataset.replyId,
                source: 'message', liuyan,
                schoolId: e.currentTarget.dataset.schoolId
            }, postType))
        })
    },

})
