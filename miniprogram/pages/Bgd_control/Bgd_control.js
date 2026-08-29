const app = getApp();
const adminService = require('../../services/admin-service');

Page({
  data: {
    search: '',
    userList: [], // 存放用户记录的数组
    skip: 0, // 跳过的记录数量
    limit: 20, // 每次获取的记录数量
    isLoading: false, // 是否正在加载数据的标志位
    totalUsers: 0, // 总用户数
    todayLoginUsers: 0 // 今日登录用户数
  },

  goWorkManager() {
    wx.navigateTo({
      url: '/pages/work_manager/work_manager'
    });
  },

  goAudit() {
    wx.navigateTo({
      url: '/pages/audit-list/audit-list',
    })
  },

  onLoad: function (options) {
    // 初始化页面时，加载第一页数据
    this.loadData();
    // 获取总用户数和今日登录用户数
    this.getTotalUsers();
    this.getTodayLoginUsers();
  },

  // 加载数据的函数
  loadData: function () {
    const that = this;
    const { skip, limit } = this.data;

    adminService.getRecentUsers(skip, limit).then(users => {
        const userList = users.map(user => {
          return {
            ...user,
            formattedLogintime: that.formatTime(user.logintime)
          };
        });

        that.setData({
          userList: that.data.userList.concat(userList),
          isLoading: false // 加载完成后，将isLoading标志位置为false
        });
      })
      .catch(err => {
        console.error('获取用户记录失败', err);
        // 即使出错，也要将isLoading标志位置为false
        that.setData({
          isLoading: false
        });
      });

    // 设置isLoading标志位为true，表示正在加载数据
    this.setData({
      isLoading: true
    });
  },

  // 页面滚动事件处理函数
  onReachBottom: function () {
    // 如果正在加载数据，则不再触发加载下一页
    if (this.data.isLoading) {
      return;
    }

    // 设置isLoading标志位为true，表示正在加载数据
    this.setData({
      isLoading: true,
      skip: this.data.skip + this.data.limit // 更新跳过的记录数量
    });

    // 调用加载数据的函数，加载下一页数据
    this.loadData();
  },

  formatTime: function (timestamp) {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  },

  getValue(event) {
    this.setData({
      search: event.detail.value
    });
  },

  search: function (e) {
    var keywordsArray = e.detail.value;

    if (keywordsArray == "") {
      wx.showToast({
        title: '不能为空',
        icon: "none",
      });
      return;
    }
    var keyword = keywordsArray.split(' ').filter(Boolean); // 拆分关键词并过滤掉空字符串

    this.setData({
      search: keywordsArray,
    });

    adminService.searchUsers(keyword).then(users => {
      // 更新过滤后的用户列表并格式化logintime
      const filteredList = users.map(user => ({
        ...user,
        formattedLogintime: this.formatTime(user.logintime)
      }));

      this.setData({
        filteredUserList: filteredList
      });

      console.log("搜索结果：", filteredList);
    }).catch(err => {
      console.error("搜索失败：", err);
    });
  },

  clearinput() {
    this.setData({
      filteredUserList: '',
      search: ''
    });
  },

  checkuser(e) {
    var id = e.currentTarget.dataset.id;
    var mine = false;
    var myid = app.userInfo._id;
    for (var ii = 0; ii < app.glids.length; ii++) {
      if (app.glids[ii] == myid) {
        mine = true;
        break;
      }
    }

    //自己是管理员
    if (mine == true) {
      wx.navigateTo({
        url: "../checkuser/checkuser?id=" + id
      });
    }
  },

  getTotalUsers: function () {
    adminService.countUsers().then(total => {
      this.setData({
        totalUsers: total
      });
    }).catch(err => {
      console.error("获取总用户数失败：", err);
    });
  },

  getTodayLoginUsers: function () {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // 设置为当天的开始时间

    adminService.countTodayLoginUsers(today.getTime()).then(total => {
      this.setData({
        todayLoginUsers: total
      });
    }).catch(err => {
      console.error("获取今日登录用户数失败：", err);
    });
  }
});
