const app = getApp();
const db = wx.cloud.database();

Page({
  data: {
    loadingHidden1: false,
    // Tab Configurations for each module
    moduleTabs: {}, // Will be fetched from DB 'lunbotu3'
    tabbar: [], // Will be set on load based on moduleIndex
    currentTab: 0,
    // listData stores data for each tab: index 0 -> tab 0, etc.
    listData: [[], [], []],
    bannerList: [],
    showList: false,
    istrue: false,

    // Floating Button Data
    movehight: 500,
    movehight2: 500,
    yincang: false,
    lunbotutool: '',

    // Sorting & Pagination
    sortType: 'comprehensive', // Default
    pagination: {
      0: { page: 1, finished: false },
      1: { page: 1, finished: false },
      2: { page: 1, finished: false }
    },

    moduleIndex: 0, // Default to Shop (0)

    // Star rating configuration with Cloud URLs
    stars: [{
      bgImg: "cloud://tafaheishi-1gs4bxsvcf864035.7461-tafaheishi-1gs4bxsvcf864035-1316611774/标签/starnull.png",
      bgfImg: "cloud://tafaheishi-1gs4bxsvcf864035.7461-tafaheishi-1gs4bxsvcf864035-1316611774/标签/starall.png"
    }, {
      bgImg: "cloud://tafaheishi-1gs4bxsvcf864035.7461-tafaheishi-1gs4bxsvcf864035-1316611774/标签/starnull.png",
      bgfImg: "cloud://tafaheishi-1gs4bxsvcf864035.7461-tafaheishi-1gs4bxsvcf864035-1316611774/标签/starall.png"
    }, {
      bgImg: "cloud://tafaheishi-1gs4bxsvcf864035.7461-tafaheishi-1gs4bxsvcf864035-1316611774/标签/starnull.png",
      bgfImg: "cloud://tafaheishi-1gs4bxsvcf864035.7461-tafaheishi-1gs4bxsvcf864035-1316611774/标签/starall.png"
    }, {
      bgImg: "cloud://tafaheishi-1gs4bxsvcf864035.7461-tafaheishi-1gs4bxsvcf864035-1316611774/标签/starnull.png",
      bgfImg: "cloud://tafaheishi-1gs4bxsvcf864035.7461-tafaheishi-1gs4bxsvcf864035-1316611774/标签/starall.png"
    }, {
      bgImg: "cloud://tafaheishi-1gs4bxsvcf864035.7461-tafaheishi-1gs4bxsvcf864035-1316611774/标签/starnull.png",
      bgfImg: "cloud://tafaheishi-1gs4bxsvcf864035.7461-tafaheishi-1gs4bxsvcf864035-1316611774/标签/starall.png"
    }],
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad: function () {
    // Initial load: Use global app.zilei config
    if (app.zilei) {
      this.setData({
        moduleTabs: app.zilei,
        // Update tabbar based on current moduleIndex
        tabbar: app.zilei[this.data.moduleIndex] ? app.zilei[this.data.moduleIndex].moduleTabs : []
      });
    } else {
      console.error("app.zilei not found!");
    }

    // Get system info for floating button position
    const systeminfo = wx.getWindowInfo();
    this.setData({
      movehight: systeminfo.windowHeight,
      movehight2: systeminfo.windowHeight - 80,
    });

    // Fetch list data
    this.jiazai(0);
    this.getBannerList();
  },

  // Fetch Banner Data
  getBannerList() {
    if (!app.bannerListtool || !Array.isArray(app.bannerListtool)) {
      console.warn("app.bannerListtool 尚未加载");
      return;
    }
    var lunbotutool = app.bannerListtool.slice().sort(() => Math.random() - 0.5);
    console.log("bannerListtool", lunbotutool);
    this.setData({
      bannerList: lunbotutool
    });
  },

  /**
   * Generates a deterministic color based on ID.
   * @param {string} id 
   */
  getRandomColor(id) {
    const colors = [
      '#FFB7B2', '#FFDAC1', '#E2F0CB', '#B5EAD7', '#C7CEEA',
      '#F8B0C8', '#D3C4E3', '#B4D6CF', '#F9D89C', '#F0A3A2'
    ];
    let hash = 0;
    if (id) {
      for (let i = 0; i < id.length; i++) {
        hash += id.charCodeAt(i);
      }
    } else {
      // Fallback to random if no ID
      hash = Math.floor(Math.random() * 1000);
    }
    const index = hash % colors.length;
    return colors[index];
  },


  // Process Like State
  /**
   * Process like status for list items.
   * @param {Array} e - List data.
   */
  love(e) {
    if (!app.userInfo || !app.userInfo._id) return;
    var l = e.length;
    for (var i = 0; i < l; i++) {
      if (e[i].ss_xx && e[i].ss_xx.dianzanid) {
        var yn = e[i].ss_xx.dianzanid.indexOf(app.userInfo._id);
        if (yn == -1) {
          e[i].love = false;
        } else {
          e[i].love = true;
        }
      } else {
        e[i].love = false;
      }
    }
  },

  // Fetch Item Data (Lazy Loading & Pagination)
  /**
   * Fetch data with pagination and filtering.
   * @param {number} tabIndex 
   * @param {boolean} isLoadMore 
   */
  async jiazai(tabIndex, isLoadMore = false) {
    var that = this;

    // If no tabIndex provided, default to currentTab
    if (tabIndex === undefined) {
      tabIndex = this.data.currentTab;
    }

    // Check if finished
    if (isLoadMore && this.data.pagination[tabIndex].finished) {
      return;
    }



    try {
      // Determine Sort Field
      let orderByField = 'ss_xx.dianzannb'; // Default: Comprehensive (Heat/Likes)

      if (this.data.sortType === 'rating') {
        orderByField = 'ss_xx.remark_num'; // Rating
      } else if (this.data.sortType === 'comments') {
        orderByField = 'ss_xx.huifunb'; // Comments
      } else if (this.data.sortType === 'time') {
        orderByField = 'time'; // Time (Manual timestamp)
      }

      // Pagination
      const PAGE_SIZE = 20;
      const page = this.data.pagination[tabIndex].page;
      const skip = (page - 1) * PAGE_SIZE;

      // Construct Query
      // Use moduleIndex to filter by 'zilei': 0=Shops, 1=Database, 2=Courses
      let whereClause = {
        'ss_xx.zilei': parseFloat(this.data.moduleIndex), // Ensure it's number
        'ss_xx.type': tabIndex, // Apply sub-type filter for ALL modules
        'ss_xx.checked': db.command.nin([false, 2]) // Filter: Show only approved (true) or old (undefined). Hide pending (false) and rejected (2)
      };

      let query = db.collection('tianmeizhoubian')
        .where(whereClause);

      // Apply Sort
      // Comprehensive: Sort by Likes then Comments then Time
      if (this.data.sortType === 'comprehensive') {
        query = query.orderBy('ss_xx.dianzannb', 'desc')
          .orderBy('ss_xx.huifunb', 'desc')
          .orderBy('_createTime', 'desc');
      } else {
        // Specific Sort
        query = query.orderBy(orderByField, 'desc').orderBy('_createTime', 'desc');
      }

      // Execute Query
      let res = await query.skip(skip)
        .limit(PAGE_SIZE)
        .get();

      // Process Love State
      this.love(res.data);

      let newData = res.data;

      // Process Text Cover for missing images
      newData.forEach(item => {
        if (!item.ss_xx.tp || item.ss_xx.tp.length === 0 || !item.ss_xx.tp[0]) {
          item.bgColor = this.getRandomColor(item._id);
        }
      });

      let listKey = `listData[${tabIndex}]`;
      let pageKey = `pagination.${tabIndex}.page`;
      let finishedKey = `pagination.${tabIndex}.finished`;

      if (isLoadMore) {
        // Append data
        let currentList = this.data.listData[tabIndex];
        newData = currentList.concat(newData);
      }

      that.setData({
        [listKey]: newData,
        [pageKey]: page + 1,
        [finishedKey]: res.data.length < PAGE_SIZE, // If less than page size, no more data
        loadingHidden1: true,
        showList: true
      });
    } catch (err) {
      console.error("Data fetch failed", err);
      that.setData({
        loadingHidden1: true,
        showList: true
      });
    }
  },

  // Change Sort Type
  changeSort(e) {
    let type = e.currentTarget.dataset.type;
    if (this.data.sortType === type) return;

    this.setData({
      sortType: type,
      // Reset pagination for all tabs or just current? 
      // Let's reset for all to keep it simple, or just current.
      // Better to reset current and clear its data so it reloads.
      [`pagination.${this.data.currentTab}`]: { page: 1, finished: false },
      [`listData[${this.data.currentTab}]`]: []
    });

    this.jiazai(this.data.currentTab);
  },

  // Load More (Infinite Scroll)
  loadMore() {
    console.log("Reach Bottom - Load More");
    this.jiazai(this.data.currentTab, true);
  },

  onReachBottom: function () {
    this.loadMore();
  },

  // Tab Navigation
  /**
   * Handle Tab Switch.
   * @param {Object} e - Event object.
   */
  swichNav: function (e) {
    var cur = e.currentTarget.dataset.current;
    if (this.data.currentTab == cur) {
      return false;
    }

    this.setData({
      currentTab: cur,
      sortType: 'comprehensive' // Reset sort type
    });

    // Reset pagination and clear data for the new tab to force fresh fetch
    this.setData({
      [`listData[${cur}]`]: [],
      [`pagination.${cur}`]: { page: 1, finished: false }
    });

    this.jiazai(cur);
  },

  // Module Switching
  /**
   * Switch Module (Database/Shop/Course).
   */
  changeModule(e) {
    let index = parseInt(e.currentTarget.dataset.index);
    if (this.data.moduleIndex === index) return;

    this.setData({
      moduleIndex: index,
      // Update Tab Bar for new module using fetched config
      // Structure: { "0": { moduleTabs: [...] }, ... }
      tabbar: this.data.moduleTabs[index] ? this.data.moduleTabs[index].moduleTabs : [],
      currentTab: 0,
      sortType: 'comprehensive',
      // Clear data to force reload
      listData: [[], [], []],
      pagination: {
        0: { page: 1, finished: false },
        1: { page: 1, finished: false },
        2: { page: 1, finished: false }
      }
    });

    this.jiazai(0);
  },

  // Image Load Handler
  /**
   * Handle Image Load Event.
   */
  imageOnLoad(e) {
    const index = e.currentTarget.dataset.index;
    const currentTab = this.data.currentTab;
    // Set loaded=true for the specific item in the specific tab list
    this.setData({
      [`listData[${currentTab}][${index}].loaded`]: true
    });
  },

  // Navigate to Details (Preserving original logic)
  xiangqing: function (e) {
    var id = e.currentTarget.dataset.id;
    var love = e.currentTarget.dataset.love;

    // Save index for return update
    var index = e.currentTarget.dataset.index;
    this.setData({
      index: index
    });

    // Set global info for sync
    // Use Deep Copy to prevent reference modification
    var currentTab = this.data.currentTab;
    app.ssinfo = JSON.parse(JSON.stringify(this.data.listData[currentTab][e.currentTarget.dataset.index]));
    app.ssinfo.lovenb = this.data.listData[currentTab][e.currentTarget.dataset.index].ss_xx.dianzannb;
    // Initialize reping to 0
    app.ssinfo.reping = 0;

    var loveStr = love ? 'true' : 'false';

    // Navigate to plate-zhoubian as per original code
    wx.navigateTo({
      url: "../plate-zhoubian/plate-zhoubian?id=" + id + "&fenxiang=false&liuyan=false&love=" + loveStr
    });
  },

  // Navigate to Banner Details (与 index.js 逻辑一致)
  toBannerDetail: function (e) {
    var type = e.currentTarget.dataset.type;
    var Appid1 = e.currentTarget.dataset.appid;
    var Appid = encodeURIComponent(Appid1);
    var title1 = e.currentTarget.dataset.title;

    if (type == 0) {
      // 跳转到其他小程序
      wx.navigateToMiniProgram({
        appId: Appid,
        path: title1,
        extraData: {
          envVersion: 'release',
          targetOptions: {
            halfScreen: false
          }
        },
        success(res) { },
        fail(err) {
          console.error('跳转小程序失败', err);
        }
      });
    } else {
      // 跳转到内部详情页
      var title = encodeURIComponent(title1);
      wx.navigateTo({
        url: '/pages/bannerDetail/bannerDetail?title=' + title + '&type=' + type,
      });
    }
  },

  // Handle Like (Consolidated & Optimized)
  handleLike: function (e) {
    var that = this;
    var index = e.currentTarget.dataset.index;
    var id = e.currentTarget.dataset.id;
    var currentTab = this.data.currentTab;

    // Get item from the correct list
    var item = this.data.listData[currentTab][index];

    if (!item) return;

    // Optimistic UI Update
    var newLoveState = !item.love;
    var newCount = item.ss_xx.dianzannb || 0;

    if (newLoveState) {
      newCount++;
    } else {
      newCount--;
    }

    // Update local state immediately
    // Path: listData[currentTab][index].love
    var upLove = `listData[${currentTab}][${index}].love`;
    var upCount = `listData[${currentTab}][${index}].ss_xx.dianzannb`;

    that.setData({
      [upLove]: newLoveState,
      [upCount]: newCount
    });

    // Call Cloud Function
    wx.cloud.callFunction({
      name: 'dianzan',
      data: {
        id: id,
        dz: newLoveState,
        type: 'tianmeizhoubian',
        dzrid: app.userInfo._id,
        // Notification Data
        name: app.userInfo.userinfo.username,
        photo: app.userInfo.userinfo.userphoto,
        time: new Date().getTime(),
        lzid: item.ss_xx.lzid,
        zbtitle: item.ss_xx.zbtitle || item.ss_xx.nr || '动态', // Fallback for content
        zilei: item.ss_xx.zilei
      },
      success: res => {
        console.log('Like success', res);
      },
      fail: err => {
        console.error('Like failed', err);
        // Revert on failure
        that.setData({
          [upLove]: !newLoveState,
          [upCount]: item.ss_xx.dianzannb
        });
        wx.showToast({
          title: '操作失败',
          icon: 'none'
        });
      }
    })
  },

  // Admin: Ban Post (Preserved)
  guanlifengtiezi(e) {
    if (app.userInfo.userinfo.login != true) return;
    if (app.userInfo.ban == true) {
      wx.showToast({ title: '账号被封！', icon: 'none' });
      return;
    }

    var mine = false;
    var myid = app.userInfo._id;
    // Check if user is admin
    if (app.glids) {
      for (var ii = 0; ii < app.glids.length; ii++) {
        if (app.glids[ii] == myid) {
          mine = true;
          break;
        }
      }
    }

    if (mine == true) {
      var that = this;
      wx.showModal({
        title: '提示',
        content: '确认封贴？(请勿随意封贴)',
        success(res) {
          if (res.confirm) {
            var ssid = e.currentTarget.dataset.id;
            wx.cloud.callFunction({
              name: "jubaoplus",
              data: {
                id: ssid,
                time: new Date().getTime(),
                ywnr: '管理员封贴',
                jbrid: app.userInfo._id,
                type: 'tianmeizhoubian'
              }
            });
            wx.showToast({ title: '封了', icon: 'none' });
            // Refresh current tab
            that.jiazai(that.data.currentTab);
          }
        }
      })
    }
  },

  // Add New Item (Preserved)
  add() {
    console.log("wwwwwwww", app)
    //若未登录，直接到登录页面
    if (app.userInfo.userinfo.login != true) {
      wx.switchTab({
        url: '/pages/my/wd/wd'
      })
      return
    }
    // 手机号、性别等个人资料均为可选。
    //检测账号是否被封
    var ban = app.userInfo.ban
    if (ban == true) {
      wx.showToast({
        title: '账号被封！',
        icon: 'none',
        duration: 7000
      })
      return
    }

    this.setData({
      istrue: true
    })
  },


  closeDialog: function () {
    this.setData({
      istrue: false
    })
  },


  // 好店跳转
  neworder() {
    this.setData({
      istrue: false
    })

    // Safety check for app.zilei
    if (app.zilei && app.zilei[0]) {
      let zileiData = JSON.stringify(app.zilei[0]);
      wx.navigateTo({
        url: '../post-zhoubian/post-zhoubian?zilei=' + encodeURIComponent(zileiData) + '&moduleID=0'
      })
    } else {
      wx.showToast({
        title: '数据未加载',
        icon: 'none'
      })
    }
  },

  // 资料库跳转
  addnews() {
    this.setData({
      istrue: false
    })

    // Safety check for app.zilei
    if (app.zilei && app.zilei[1]) {
      let zileiData = JSON.stringify(app.zilei[1]);
      wx.navigateTo({
        url: '../post-zhoubian/post-zhoubian?zilei=' + encodeURIComponent(zileiData) + '&moduleID=1'
      })
    } else {
      wx.showToast({
        title: '数据未加载',
        icon: 'none'
      })
    }
  },


  // 店铺跳转
  addclass() {
    this.setData({
      istrue: false
    })

    // Safety check for app.zilei
    if (app.zilei && app.zilei[2]) {
      let zileiData = JSON.stringify(app.zilei[2]);
      wx.navigateTo({
        url: '../post-zhoubian/post-zhoubian?zilei=' + encodeURIComponent(zileiData) + '&moduleID=2'
      })
    } else {
      wx.showToast({
        title: '数据未加载',
        icon: 'none'
      })
    }
  },





  /**
   * Page Scroll Listener
   * Controls visibility of 'Go Top' button
   */
  onPageScroll: function (e) {
    if (e.scrollTop > 210) {
      this.setData({
        yincang: true,
      });
    } else {
      this.setData({
        yincang: false,
      });
    }
  },

  /**
   * One-click Go Top
   */
  goTop: function (e) {
    if (wx.pageScrollTo) {
      wx.pageScrollTo({
        scrollTop: 0
      })
    } else {
      wx.showModal({
        title: '提示',
        content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
      })
    }
  },





  onPullDownRefresh: function () {
    var cur = this.data.currentTab;
    this.setData({
      [`listData[${cur}]`]: [],
      [`pagination.${cur}`]: { page: 1, finished: false }
    });

    // Refresh data
    this.jiazai(cur).then(() => {
      wx.stopPullDownRefresh();
      wx.showToast({ title: '刷新成功', icon: 'none' });
    });
  },

  onShareAppMessage: function () {
    return {
      title: '校园黑市',
      path: '/pages/tools/tools'
    }
  },


  /**
   * Lifecycle function--Called when page show
   */
  onShow: function () {
    // 补偿加载：如果 onLoad 时 banner 数据还没就绪，在 onShow 再试一次
    if (this.data.bannerList.length === 0) {
      this.getBannerList();
    }

    // Check for refresh signal from post page
    if (app.shuaxin) {
      console.log("Refreshing list due to new post...");
      app.shuaxin = false;
      var cur = this.data.currentTab;
      this.setData({
        [`listData[${cur}]`]: [],
        [`pagination.${cur}`]: { page: 1, finished: false }
      });
      this.jiazai(cur);
    }

    // Sync Like Status from Detail Page
    var index = this.data.index;
    var currentTab = this.data.currentTab;

    // Check if we have a valid index and a signal from detail page (app.ssinfo)
    var reping = app.ssinfo && app.ssinfo.reping;

    if (index !== undefined && index >= 0 && reping == 2222) {
      console.log("Syncing like status from detail page...", app.ssinfo);
      var item = this.data.listData[currentTab][index];

      if (item) {
        // Prepare granular updates
        let updates = {};

        // Sync View Count (Safe Check)
        if (app.ssinfo && app.ssinfo.looknb !== undefined) {
          updates[`listData[${currentTab}][${index}].ss_xx.look`] = app.ssinfo.looknb;
        }

        // Sync Like Status
        if (app.loveinfo == 'true') {
          updates[`listData[${currentTab}][${index}].love`] = true;
        } else if (app.loveinfo == 'false') {
          updates[`listData[${currentTab}][${index}].love`] = false;
        }

        // Sync Counts (Safe Check)
        if (app.ssinfo && app.ssinfo.plnb !== undefined) {
          updates[`listData[${currentTab}][${index}].ss_xx.huifunb`] = app.ssinfo.plnb;
        }
        if (app.ssinfo && app.ssinfo.lovenb !== undefined) {
          updates[`listData[${currentTab}][${index}].ss_xx.dianzannb`] = app.ssinfo.lovenb;
        }

        // Apply Updates only if keys exist
        if (Object.keys(updates).length > 0) {
          this.setData(updates);
        }

        // Clear reping to prevent re-sync
        app.ssinfo.reping = 0;
      }
    }
  },

  onShareTimeline: function () {
    return {
      title: "刚刚在天美社区看到个帖子，真是绝了！",
      path: "/pages/tools/tools"
    }
  }
})
