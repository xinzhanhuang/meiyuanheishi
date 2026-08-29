const app = getApp();
const db = wx.cloud.database();
const _ = db.command;
const utils = require('../../utils/util');

Page({
    data: {
        currentTab: 0,
        workList: [],
        pendingList: [],
        aiLoading: false,
        openid: '',
        inputUrl: ''
    },

    onUrlInput(e) {
        this.setData({ inputUrl: e.detail.value });
    },

    onAddAndGenerate() {
        const url = this.data.inputUrl;
        if (!url || !url.startsWith('http')) {
            wx.showToast({ title: '请输入有效链接', icon: 'none' });
            return;
        }

        this.setData({ aiLoading: true });
        wx.showLoading({ title: '处理中...' });

        // Call getworkmessage directly with the URL
        wx.cloud.callFunction({
            name: 'getworkmessage',
            data: {
                url: url
            }
        }).then(res => {
            wx.hideLoading();
            this.setData({ aiLoading: false, inputUrl: '' });

            if (res.result && res.result.success) {
                wx.showToast({ title: '生成成功' });
                this.loadPendingPosts();
                this.setData({ currentTab: 1 }); // Switch to review
            } else {
                const msg = res.result && res.result.msg ? res.result.msg : (res.result && res.result.error ? res.result.error : '未知错误');
                wx.showModal({
                    title: '执行结果',
                    content: '分析结束: ' + msg,
                    showCancel: false
                });
                // No need to refresh workList as we didn't add anything
            }
        }).catch(err => {
            wx.hideLoading();
            this.setData({ aiLoading: false });
            console.error(err);
            wx.showToast({ title: '失败: ' + err.message, icon: 'none' });
        });
    },

    onLoad() {
        this.getOpenid();
        this.loadWorkArticles();
        this.loadPendingPosts();
    },

    getOpenid() {
        wx.cloud.callFunction({
            name: 'login'
        }).then(res => {
            this.setData({ openid: res.result.openid });
        });
    },

    switchTab(e) {
        const index = parseInt(e.currentTarget.dataset.index);
        this.setData({ currentTab: index });
        if (index === 0) {
            this.loadWorkArticles();
        } else {
            this.loadPendingPosts();
        }
    },

    loadWorkArticles() {
        // Load pending tasks from work_queue
        // No need to filter processed!=true, because queue only has pending items.
        db.collection('work_queue').orderBy('created_at', 'desc').limit(20).get().then(res => {
            this.setData({ workList: res.data });
        });
    },

    loadPendingPosts() {
        // Pending means sstype == true (as per user definition: false is effective)
        db.collection('ss').where({
            'ss_xx.sstype': true
        }).orderBy('time', 'desc').limit(20).get().then(res => {
            this.setData({ pendingList: res.data });
        });
    },

    onDeleteArticle(e) {
        const id = e.currentTarget.dataset.id;
        wx.showModal({
            title: '确认忽略',
            content: '确定要忽略这个任务吗？',
            success: (res) => {
                if (res.confirm) {
                    // Start of fix: Hard delete from queue
                    wx.cloud.callFunction({ name: 'getworkmessage', data: { action: 'deleteQueue', id } }).then((res) => {
                        if (!res.result || !res.result.success) throw new Error('忽略失败');
                        wx.showToast({ title: '已忽略' });
                        this.loadWorkArticles();
                    });
                    // End of fix
                }
            }
        });
    },

    onRunAI(e) {
        const articleId = e.currentTarget.dataset.id; // Optional ID
        this.setData({ aiLoading: true });
        wx.showLoading({ title: 'AI 分析中...', mask: true });

        wx.cloud.callFunction({
            name: 'getworkmessage',
            data: {
                articleId: articleId
            }
        }).then(res => {
            wx.hideLoading();
            this.setData({ aiLoading: false });

            console.log('AI Run Result:', res.result);

            if (res.result && res.result.success) {
                const stats = res.result.stats;
                if (stats && stats.success > 0) {
                    wx.showToast({ title: '分析成功' });
                    this.setData({ currentTab: 1 });
                } else if (stats && stats.filtered > 0) {
                    wx.showModal({ title: '提示', content: 'AI判定内容不包含招聘信息，已自动忽略。', showCancel: false });
                } else {
                    // Success=true but no success/filtered? Limit reached or empty queue?
                    wx.showToast({ title: '无新内容生成', icon: 'none' });
                }

                // Refresh lists
                this.loadWorkArticles();
                this.loadPendingPosts();
            } else {
                const msg = res.result && res.result.msg ? res.result.msg : '未知错误';
                wx.showModal({
                    title: '执行失败',
                    content: msg,
                    showCancel: false
                });
                this.loadWorkArticles();
            }
        }).catch(err => {
            wx.hideLoading();
            this.setData({ aiLoading: false });
            console.error(err);
            wx.showToast({ title: '调用失败', icon: 'none' });
        });
    },

    onApprovePost(e) {
        const id = e.currentTarget.dataset.id;
        wx.showModal({
            title: '确认发布',
            content: '确定发布这条内容吗？',
            success: (res) => {
                if (res.confirm) {
                    wx.showLoading({ title: '发布中...' });
                    wx.cloud.callFunction({
                        name: 'getworkmessage', data: { action: 'approvePost', id }
                    }).then((res) => {
                        if (!res.result || !res.result.success) throw new Error('发布失败');
                        wx.hideLoading();
                        wx.showToast({ title: '已发布' });
                        this.loadPendingPosts();
                    }).catch(err => {
                        wx.hideLoading();
                        wx.showToast({ title: '失败', icon: 'none' });
                    });
                }
            }
        });
    },

    onDeletePost(e) {
        const id = e.currentTarget.dataset.id;
        wx.showModal({
            title: '确认拒绝',
            content: '确定拒绝并删除这条内容吗？',
            confirmColor: '#ff4d4f',
            success: (res) => {
                if (res.confirm) {
                    wx.cloud.callFunction({ name: 'getworkmessage', data: { action: 'deletePost', id } }).then((res) => {
                        if (!res.result || !res.result.success) throw new Error('删除失败');
                        wx.showToast({ title: '已删除' });
                        this.loadPendingPosts();
                    });
                }
            }
        });
    },

    copyUrl(e) {
        const url = e.currentTarget.dataset.url;
        wx.setClipboardData({
            data: url,
            success: () => {
                wx.showToast({ title: '链接已复制' });
            }
        });
    },

    onPostTap(e) {
        const item = e.detail.item || e.currentTarget.dataset.item;
        const id = item._id;
        wx.navigateTo({ url: utils.getPostTargetUrl({ postId: id, postType: 'ss', source: 'work_manager' }) });
    },


});
