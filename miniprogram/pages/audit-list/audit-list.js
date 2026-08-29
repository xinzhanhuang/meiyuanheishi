const app = getApp();
const utils = require('../../utils/util');
const adminService = require('../../services/admin-service');

Page({
    data: {
        list: []
    },

    onLoad: function (options) {
        this._skipNextShow = true;
        this.getList();
    },

    onShow: function () {
        if (this._skipNextShow) {
            this._skipNextShow = false;
            return;
        }
        this.getList();
    },

    getList() {
        wx.showLoading({ title: '加载中' });
        adminService.getPendingNearbyPosts()
            .then(data => {
                wx.hideLoading();
                let list = data.map(item => {
                    item.time = this.formatTime(item.time);
                    return item;
                });
                this.setData({ list });
            })
            .catch(err => {
                wx.hideLoading();
                console.error("获取列表失败", err);
                wx.showToast({ title: '加载失败', icon: 'none' });
            });
    },

    formatTime(timestamp) {
        if (!timestamp) return '';
        var date = new Date(timestamp);
        var Y = date.getFullYear() + '-';
        var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
        var D = date.getDate() + ' ';
        var h = date.getHours() + ':';
        var m = date.getMinutes();
        return Y + M + D + h + (m < 10 ? '0' + m : m);
    },

    goDetail(e) {
        const id = e.currentTarget.dataset.id;
        // 进入详情页
        wx.navigateTo({
            url: utils.getPostTargetUrl({ postId: id, postType: 'zhoubian', source: 'admin' })
        });
    },

    pass(e) {
        const id = e.currentTarget.dataset.id;
        const index = e.currentTarget.dataset.index;
        const that = this;

        wx.showModal({
            title: '提示',
            content: '确认发布该帖子？',
            success(res) {
                if (res.confirm) {
                    that.updateStatus(id, index, 1, '已发布');
                }
            }
        });
    },

    reject(e) {
        const id = e.currentTarget.dataset.id;
        const index = e.currentTarget.dataset.index;
        const that = this;

        wx.showModal({
            title: '拒绝理由',
            editable: true,
            placeholderText: '请输入拒绝理由',
            success(res) {
                if (res.confirm) {
                    const reason = res.content;
                    that.updateStatus(id, index, 2, '已拒绝', reason);
                }
            }
        });
    },

    deletePost(e) {
        const id = e.currentTarget.dataset.id;
        const index = e.currentTarget.dataset.index;
        const that = this;

        wx.showModal({
            title: '提示',
            content: '确定要彻底删除该帖子吗？操作不可恢复。',
            confirmColor: '#FF0000',
            success(res) {
                if (res.confirm) {
                    wx.showLoading({ title: '删除中' });
                    adminService.deletePost(id).then(() => {
                            wx.hideLoading();
                            wx.showToast({ title: '已删除' });
                            let list = that.data.list.slice();
                            list.splice(index, 1);
                            that.setData({ list });
                        })
                        .catch(err => {
                            console.error("删除失败", err);
                            wx.hideLoading();
                            wx.showToast({ title: '删除失败', icon: 'none' });
                        });
                }
            }
        });
    },

    updateStatus(id, index, status, successMsg, reason = '') {
        const that = this;
        wx.showLoading({ title: '处理中' });

        adminService.updatePostStatus(id, status, reason).then(() => {
                wx.hideLoading();
                wx.showToast({ title: successMsg });
                let list = that.data.list.slice();
                if (status === 2 && list[index]) {
                    list[index] = Object.assign({}, list[index], {
                        ss_xx: Object.assign({}, list[index].ss_xx, { checked: 2 })
                    });
                } else {
                    list.splice(index, 1);
                }
                that.setData({ list });
            })
            .catch(err => {
                console.error("云函数调用失败", err);
                wx.hideLoading();
                wx.showToast({ title: '操作失败', icon: 'none' });
            });
    }
});
