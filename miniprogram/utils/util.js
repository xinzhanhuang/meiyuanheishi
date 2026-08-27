const util = {
  API: 'http://localhost:3336/api/', 
  webSrc: 'http://localhost:8080/dist/#/dayin_wx',

  /**
   * 获取窗口大小
   */
  getWindowSize(that) {
    let pages = getCurrentPages(); // 当前页面
    // let beforePage = pages[pages.length - 2]; 
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          model: res.model,
          width: res.windowWidth,
          height: res.windowHeight,
          topHeight: res.statusBarHeight + 46,
          pageLength: pages.length
        })
      },
    })
  },
  login(cb){
    var that = this;
    wx.login({
      success(res) {
        that.post('wx/user/login', { js_code: res.code }, function (res) {
          if (res.code == 1) {
            wx.setStorageSync("user", res.data)
            wx.setStorageSync("token", res.token)
            cb(res)
          }
        })
      }
    })
  },
  //post请求
  post(url, data, success, fail) {
    this.http('POST', url, data, success, fail)
  },
  get(url, data, success, fail) {
    this.http('GET', url, data, success, fail)
  },

  http(method, url, data, success, fail) {
    //通用post接口实现方法
    var that = this;
    let _data = data || {};
    let _success = success || function (e) {
      console.log(e)
    };
    let _fail = fail || function (e) {
      console.log(e)
    };
    let _method = method || 'POST';
    let _header = {
      'content-type': 'application/x-www-form-urlencoded'
    };

    if (_method.toUpperCase() == 'GET') {
      _header = {
        'content-type': 'application/json'
      };
    }
    if (wx.getStorageSync("token")) {
      _header.token = wx.getStorageSync("token")
    }
    if (arguments.length == 2 && typeof _data == 'function') {
      _success = _data
    }
    wx.request({
      url: this.API + url,
      method: _method,
      header: _header,
      data: _data,
      success: function (res) {
        if (typeof _success == 'function' && res.statusCode != 404 && res.statusCode != 500 && res.statusCode != 400) {

         
          if (res.data.code != 101 && res.data.code != -1){
            if (res.data.code != 1) {
              wx.showToast({
                title: res.data.msg + '',
                icon: 'none'
              })
            }
            _success(res.data);
          }else{
            
            that.login(function(res){
              that.http(method, url, data, success, fail)
            })
          }
          
        } else {
          if (typeof _success != 'function') {}
          wx.showToast({
            title: '接口  错误 ' + res.statusCode,
            icon: 'none'
          })
        }
      },
      fail: function (res) {
        console.log(`======== 接口  请求失败 ========`);
        if (typeof _fail == 'function') {
          _fail(res);
        }
      }
    });
  },
  dateFormat(time, fmt) { //author: meizz 
    //console.log(time)
    let date = new Date(parseInt(time))
    //console.log(date)
    var o = {
      "M+": date.getMonth() + 1, //月份 
      "d+": date.getDate(), //日 
      "h+": date.getHours(), //小时 
      "m+": date.getMinutes(), //分 
      "s+": date.getSeconds(), //秒 
      "q+": Math.floor((date.getMonth() + 3) / 3), //季度 
      "S": date.getMilliseconds() //毫秒 
    };
    //console.log(o)
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
      if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
  },

  navTo(e) {
    let type = e.currentTarget.dataset.type
    let names = e.currentTarget.dataset.names
    let path = e.currentTarget.dataset.path
    let nav = 'navigateTo'
    if (type == 1) {
      nav = 'navigateTo'
    } else if (type == 2) {
      nav = 'redirectTo'
    } else if (type == 3) {
      nav = 'switchTab'
    }
    let url = path
    let _names = []
    if (names) {
      _names = names.split(',')
    }
    if (_names.length > 0) {
      url += '?'
      for (let i in _names) {
        if (i == 0) {
          url += _names[i] + '=' + e.currentTarget.dataset[_names[i]]
        } else {
          url += '&' + _names[i] + '=' + e.currentTarget.dataset[_names[i]]
        }
      }
    }
    wx[nav]({
      url: url,
    })
  },
  wxpay(msg, cb) {
    wx.requestPayment({
      timeStamp: msg.timestamp,
      nonceStr: msg.nonceStr,
      package: msg.package,
      signType: 'MD5',
      paySign: msg.paySign,
      success(res) {
        wx.showToast({
          title: '发布成功',
        })
        util.post('help/update/state', {
          state: 1,
          is_pay: 1,
          id: msg.oid
        }, function (res) {
          if (res.code == 1) {
            if (cb) {
              cb(true)
            } else {
              wx.redirectTo({
                url: '/pages/order/detail/detail?id=' + msg.oid,
              })
            }

          } else {
            if (cb) {
              cb(false)
            } else {
              wx.redirectTo({
                url: '/pages/order/detail/detail?id=' + msg.oid,
              })
            }
          }
        })
      },
      fail(res) {
        wx.showToast({
          title: '支付失败',
          icon: 'none'
        })
        if (cb) {
          cb(false)
        } else {
          wx.redirectTo({
            url: '/pages/order/detail/detail?id=' + msg.oid,
          })
        }
      }
    })
  },
  formatMsgTime(timespan) {
    var dateTime = new Date(timespan);
    var year = dateTime.getFullYear();
    var month = dateTime.getMonth() + 1;
    var day = dateTime.getDate();
    var hour = dateTime.getHours();
    var minute = dateTime.getMinutes();
    var second = dateTime.getSeconds();
    var now = new Date();
    var now_new = now.getTime(); //typescript转换写法

    var milliseconds = 0;
    var timeSpanStr;

    milliseconds = now_new - dateTime.getTime();

    if (milliseconds <= 1000 * 60 * 1) {
      timeSpanStr = '刚刚';
    } else if (1000 * 60 * 1 < milliseconds && milliseconds <= 1000 * 60 * 60) {
      timeSpanStr = Math.round((milliseconds / (1000 * 60))) + '分钟前';
    } else if (1000 * 60 * 60 * 1 < milliseconds && milliseconds <= 1000 * 60 * 60 * 24) {
      timeSpanStr = Math.round(milliseconds / (1000 * 60 * 60)) + '小时前';
    } else if (1000 * 60 * 60 * 24 < milliseconds && milliseconds <= 1000 * 60 * 60 * 24 * 15) {
      timeSpanStr = Math.round(milliseconds / (1000 * 60 * 60 * 24)) + '天前';
    } else if (milliseconds > 1000 * 60 * 60 * 24 * 15 && year == now.getFullYear()) {
      timeSpanStr = month + '-' + day + ' ' + hour + ':' + minute;
    } else {
      timeSpanStr = timespan;
    }
    return timeSpanStr;
  },
  jumpToComment(page, commentId) {
    if (!commentId || page.hasJumpedToComment) return;
    const comments = page.data.ss_xx && page.data.ss_xx.ss_xx && page.data.ss_xx.ss_xx.huifunr;
    if (!comments) return;
    let targetId = '';
    let expandKey = '';
    comments.some((comment, index0) => {
      if (comment.pinglunID === commentId) {
        targetId = `comment-content-${index0}`;
        return true;
      }
      const index1 = (comment.huifu || []).findIndex(reply => reply.pinglunID === commentId);
      if (index1 < 0) return false;
      targetId = `sub-comment-${index0}-${index1}`;
      if (index1 > 2) expandKey = `ss_xx.ss_xx.huifunr[${index0}].zhankai`;
      return true;
    });
    if (!targetId) return;
    page.hasJumpedToComment = true;
    const updates = { activeReplyId: targetId };
    if (expandKey) updates[expandKey] = true;
    page.setData(updates, () => wx.nextTick(() => {
      wx.createSelectorQuery().select(`#${targetId}`).boundingClientRect(rect => {
        if (rect) wx.pageScrollTo({ scrollTop: Math.max(rect.top - 80, 0), duration: 300 });
      }).exec();
    }));
    setTimeout(() => {
      if (page.data.activeReplyId === targetId) page.setData({ activeReplyId: '' });
    }, 1500);
  },
  getPostTarget(options, defaultPostType) {
    const source = options || {};
    const isMessage = source.liuyan === true || source.liuyan === 'true';
    return {
      postId: source.postId || source.id || '',
      postType: source.postType || (isMessage ? 'tj' : defaultPostType),
      commentId: source.commentId || '',
      replyId: source.replyId || '',
      source: source.source || ''
    };
  },
  getPostTargetUrl(target) {
    const type = target.postType || 'ss';
    const page = type === 'ss' ? '/pages/plate2/plate2' : '/pages/plate-zhoubian/plate-zhoubian';
    const params = [
      `id=${encodeURIComponent(target.postId)}`,
      `postId=${encodeURIComponent(target.postId)}`,
      `postType=${encodeURIComponent(type)}`,
      `source=${encodeURIComponent(target.source || 'login')}`
    ];
    if (target.commentId) params.push(`commentId=${encodeURIComponent(target.commentId)}`);
    if (type === 'tj') params.push('liuyan=true');
    return `${page}?${params.join('&')}`;
  },
  cancel(oid, name, cb) {
    this.post('help/update/state', {
      state: 4,
      id: oid
    }, function (res) {

      if (res.code == 1) {
        wx.showToast({
          title: '取消成功',
        })
        cb(true)
      } else {
        cb(false)
        wx.showToast({
          title: '取消失败',
          icon: 'none'
        })
      }
    })
  }
}
module.exports = util
