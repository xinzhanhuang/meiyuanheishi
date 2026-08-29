const app = getApp()
const utils = require('./util')
const postService = require('../services/post-service')
const userService = require('../services/user-service')
const voteService = require('../services/vote-service')

module.exports = {

  jiazai(id) {
  if (!id) {
    this.setData({ ss_xx: 0, loadingHidden: true });
    return;
  }
  var ku = this.data.ku;
  postService.getPost(ku, id).then(async (post) => {
    let updates = {};

    if (post != undefined) {
      var ss_xx = utils.normalizePost(post); // WXS处理名字，此处直接赋值

      // 普通帖没有投票选项，无需查询两个投票集合。
      if (Array.isArray(ss_xx.voteOption) && ss_xx.voteOption.length > 0) {
        voteService.getVoteState(id).then((result) => {
          if (!result || result.success !== true) throw new Error('VOTE_STATE_FAILED');
          const updates = { options: result.options || [] };
          if (result.record) {
            updates.colorIndex = result.record.colorIndex;
            updates.already11 = true;
            updates.already22 = true;
          }
          this.setData(updates);
        }).catch((err) => {
          console.error('加载投票数据失败', err);
        });
      }

      // 初始化图片加载状态
      if (ss_xx.ss_xx.tp && ss_xx.ss_xx.tp.length > 0) {
        let oldPost = this.data.ss_xx && this.data.ss_xx.ss_xx;
        ss_xx.ss_xx.tp2 = utils.createImageLoadStates(ss_xx.ss_xx.tp, oldPost);
      }

      // 处理评论点赞
      if (ss_xx.ss_xx.huifunr[0] != null && ss_xx.ss_xx.huifunr[0].pinglunID != null && ss_xx.ss_xx.huifunr[0].pinglunID != "") {
        var xx = await this.pllove(ss_xx.ss_xx.huifunr);

        // 评论排序
        xx.sort(function (a, b) {
          return a.pldianzannb - b.pldianzannb;
        });
        // 获取旧的评论列表用于状态保持
        let oldHuifunr = this.data.ss_xx && this.data.ss_xx.ss_xx && this.data.ss_xx.ss_xx.huifunr;
        let oldCommentById = Object.create(null);
        if (Array.isArray(oldHuifunr)) {
          oldHuifunr.forEach((old) => {
            if (old && oldCommentById[old.pinglunID] === undefined) {
              oldCommentById[old.pinglunID] = old;
            }
          });
        }

        xx.forEach(function (item) {
          // 通过评论 ID 恢复旧图片加载状态，避免逐条扫描旧评论列表。
          let oldItem = oldCommentById[item.pinglunID] || null;

          // 初始化评论图片加载状态
          if (item.tp && item.tp.length > 0) {
            item.tp2 = utils.createImageLoadStates(item.tp, oldItem);
          }
          // 初始化回复图片加载状态
          if (item.huifu && item.huifu.length > 0) {
            item.huifu.forEach((subItem, subIdx) => {
              if (subItem.tp && subItem.tp.length > 0) {
                // 尝试找到对应的旧回复
                let oldSubItem = oldItem && oldItem.huifu && oldItem.huifu[subIdx]; // 假设回复顺序不变，或者用更好的匹配方式

                subItem.tp2 = utils.createImageLoadStates(subItem.tp, oldSubItem);
              }
            });
          }
        });
      }

      var dianzan = this.data.dianzan;
      if (dianzan == -1 && this.data.liuyan == false) {
        // 非总列表进入
        var yn = ss_xx.ss_xx.dianzanid.indexOf(app.userInfo._id);
        console.log("非列表进入", yn);
        if (yn != -1) {
          updates.dianzan = true;
        } else {
          updates.dianzan = false;
        }
      }

      if (this.data.liuyan == false) {
        app.ssinfo.lovenb = ss_xx.ss_xx.dianzannb;
        app.ssinfo.plnb = ss_xx.ss_xx.huifunb;
        app.ssinfo.looknb = ss_xx.ss_xx.look;
        app.ssinfo.reping = this.data.reping;

        if (!ss_xx.ss_xx.nr) {
          app.ssinfo.nr = "刚刚在天美社区看到个帖子，真是绝了！";
        } else {
          app.ssinfo.nr = ss_xx.ss_xx.nr
        }


        app.ssinfo.tp = ss_xx.ss_xx.tp
        if (post.ss_xx.jubao[1] < 20) {

          //判断是否马住
          let Mazhu = ss_xx.ss_xx.Mazhu
          if (Mazhu) {
            if (Mazhu.includes(app.userInfo._id)) {
              var PDMazhu = true
            } else {
              var PDMazhu = false
            }
          }

          updates.ss_xx = ss_xx;
          updates.PDMazhu = PDMazhu;
          updates.loadingHidden = true;

          if (ss_xx.ss_xx.lzid === app.userInfo._id) {
            var orderlzid = true
            updates.orderlzid = orderlzid;
          }


          this.addlookhistory(ss_xx)


        } else {
          updates.ss_xx = 0;
        }
      } else {
        updates.ss_xx = ss_xx;
      }

    } else {
      updates.ss_xx = 0;
    }

    updates.loadingHidden = true;
    this.setData(updates, () => utils.jumpToComment(this, this.commentId));
  }).catch((err) => {
    console.error('加载帖子失败', err);
    this.setData({ ss_xx: 0, loadingHidden: true });
    wx.showToast({ title: '加载失败，请稍后重试', icon: 'none' });
  })
},

  addlookhistory(ss_xx) {
  var historyId = ss_xx._id;
  var timestamp = this.formatTime(new Date().getTime());
  var nr = ss_xx.ss_xx.nr;

  // 若已经登录，添加浏览记录
  if (app.userInfo.userinfo.login == true) {
    const historyEntry = {
      id: historyId, // 历史记录的ID
      timestamp: timestamp,
      nr: nr
    }; // 当前的时间戳

    userService.runUserAction('appendLookHistory', { entry: historyEntry }).then(updateRes => {
      console.log('浏览记录已更新', updateRes);
    }).catch(updateErr => {
      console.error('更新浏览记录失败', updateErr);
    });
  }
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
}
}
