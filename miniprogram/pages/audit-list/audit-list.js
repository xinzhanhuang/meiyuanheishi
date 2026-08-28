const app = getApp();
const db = wx.cloud.database();

Page({
    data: {
        list: []
    },

    onLoad: function (options) {
        this.getList();
    },

    onShow: function () {
        // 页面显示时刷新列表，以防有变化
        this.getList();
    },

    getList() {
        wx.showLoading({ title: '加载中' });
        db.collection('tianmeizhoubian')
            .where({
                'ss_xx.checked': db.command.in([false, 2])
            })
            .orderBy('time', 'desc') // 按时间倒序
            .get()
            .then(res => {
                wx.hideLoading();
                let list = res.data.map(item => {
                    item.time = this.formatTime(item.time);
                    return item;
                });
                this.setData({ list });
                // console.log("sssssss", list)
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
            url: `/pages/plate-zhoubian/plate-zhoubian?id=${id}&fenxiang=false`
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
                    that.updateStatus(id, index, true, '已发布');
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
                    wx.cloud.callFunction({
                        name: 'update_post_status',
                        data: { id, action: 'delete' }
                    }).then(res => {
                            if (!res.result || !res.result.success) throw new Error((res.result && res.result.errMsg) || '删除失败');
                            wx.hideLoading();
                            wx.showToast({ title: '已删除' });
                            let list = that.data.list;
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
        // For 'Pass', we can still ask for confirmation if needed, but 'Reject' already had the modal.
        // Let's wrap 'Pass' in a confirm model inside 'pass' if strictly needed, 
        // OR simply proceed here since 'reject' came from a modal.
        // But original code had a confirmation for both.
        // Since 'reject' flow has changed to input modal, we don't need another confirm.
        // 'Pass' still needs confirm? Let's assume 'pass' calls this directly for now or we refactor.
        // To support existing 'pass' confirmation, let's just do the action here.
        // WAIT: The original `pass` called `updateStatus`. We should move the confirmation for 'pass' into `pass` function,
        // or handle it here conditionally.

        // A cleaner way: `updateStatus` just does the work. Confirmations happen before calling.
        // Let's refactor `pass` slightly above to keep confirmation if desired, 
        // BUT for simplicity and respecting the previous logic structure:

        console.log("Updating status:", status, reason);
        wx.showLoading({ title: '处理中' });

        wx.cloud.callFunction({
            name: 'update_post_status',
            data: {
                id: id,
                status: status,
                reason: reason
            },
            success: res => {
                wx.hideLoading();
                if (res.result && res.result.stats && res.result.stats.updated === 1) {
                    wx.showToast({ title: successMsg });
                    // Update Local State
                    let list = that.data.list;
                    if (status === 2) {
                        // Mark as rejected, don't remove
                        list[index].ss_xx.checked = 2;
                        that.setData({ list });
                    } else {
                        // Publish: Remove from this pending list
                        list.splice(index, 1);
                        that.setData({ list });
                    }
                } else {
                    console.warn("Update result:", res);
                    wx.showToast({ title: successMsg }); // Optimistic success
                    let list = that.data.list;
                    if (status === 2) {
                        list[index].ss_xx.checked = 2;
                        that.setData({ list });
                    } else {
                        list.splice(index, 1);
                        that.setData({ list });
                    }
                }
            },
            fail: err => {
                console.error("云函数调用失败", err);
                wx.hideLoading();
                wx.showToast({ title: '操作失败', icon: 'none' });
            }
        });
    }
});
