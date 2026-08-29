const utils = require('../../utils/util');
const userService = require('../../services/user-service');
const postService = require('../../services/post-service');
const workService = require('../../services/work-service');

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

        workService.generate({ url }).then(res => {
            wx.hideLoading();

            if (res.success) {
                this.setData({ aiLoading: false, inputUrl: '' });
                wx.showToast({ title: '生成成功' });
                this.loadPendingPosts();
                this.setData({ currentTab: 1 }); // Switch to review
            } else {
                this.setData({ aiLoading: false });
                const msg = res.msg || res.error || '未知错误';
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
            wx.showToast({ title: '失败: ' + err.message, icon: 'none' });
        });
    },

    onLoad() {
        this.getOpenid();
        this.loadWorkArticles();
        this.loadPendingPosts();
    },

    getOpenid() {
        userService.getOpenId().then(openid => this.setData({ openid }))
            .catch(err => console.error('获取管理员身份失败', err));
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
        workService.getQueue().then(workList => this.setData({ workList }))
            .catch(() => wx.showToast({ title: '加载失败', icon: 'none' }));
    },

    loadPendingPosts() {
        postService.getPendingPosts().then(pendingList => this.setData({ pendingList }))
            .catch(() => wx.showToast({ title: '加载失败', icon: 'none' }));
    },

    onDeleteArticle(e) {
        const id = e.currentTarget.dataset.id;
        wx.showModal({
            title: '确认忽略',
            content: '确定要忽略这个任务吗？',
            success: (res) => {
                if (res.confirm) {
                    workService.deleteQueue(id).then(() => {
                        wx.showToast({ title: '已忽略' });
                        this.loadWorkArticles();
                    }).catch(() => wx.showToast({ title: '忽略失败', icon: 'none' }));
                }
            }
        });
    },

    onRunAI(e) {
        const articleId = e.currentTarget.dataset.id; // Optional ID
        this.setData({ aiLoading: true });
        wx.showLoading({ title: 'AI 分析中...', mask: true });

        workService.generate({ articleId }).then(res => {
            wx.hideLoading();
            this.setData({ aiLoading: false });

            if (res.success) {
                const stats = res.stats;
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
                const msg = res.msg || '未知错误';
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
            wx.showToast({ title: err.message || '调用失败', icon: 'none' });
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
                    workService.approvePost(id).then(() => {
                        wx.hideLoading();
                        wx.showToast({ title: '已发布' });
                        this.loadPendingPosts();
                    }).catch(err => {
                        wx.hideLoading();
                        wx.showToast({ title: err.message || '发布失败', icon: 'none' });
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
                    workService.deletePost(id).then(() => {
                        wx.showToast({ title: '已删除' });
                        this.loadPendingPosts();
                    }).catch(err => wx.showToast({ title: err.message || '删除失败', icon: 'none' }));
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
