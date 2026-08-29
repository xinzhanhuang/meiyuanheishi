// miniprogram/pages/post/post.js
var util = require('../../utils/util.js');
const { callCloudFunction } = require('../../utils/cloud-call')


const app = getApp()

Page({
  data: {
    // showModal: false,
    niming: false, // 是否匿名
    imgs: [], // 图片路径数组
    Imgs: [], // 临时图片数组
    fileID: [], // 云存储文件ID
    wbnr: "", // 文本内容
    index: [0, 0], // 索引
    openlocation: false, // 是否开启位置选择
    posttitle: "", // 帖子标题
    sy: "0/599", // 剩余字数
    Cheight: 800, // 画布高度
    Cwidth: 800, // 画布宽度
    pixe: 0, // 像素比
    imginfo: {}, // 图片信息
    // xianshi:false,
    // switch1Checked:false,
    openlocationtitle: "", // 位置标题

    // 投票相关配置
    publish: {
      voteNumberPerPerson: 1, // 每人投票数
      voteOption: [] // 投票选项
    },
    voteOption: '', // 当前输入的投票选项
    maxNumberOptions: 5, // 最大选项数
    dateTime: null, // 时间
    publishSuccess: false, // 发布成功标志
    votepeopleNumber: 0, // 投票人数
    votebutton: false, // 投票按钮状态

    // 订阅通知
    allow: 'true',

    // gao:750,
  },









  /**
   * 文本内容合法性检测
   * @param {String} text - 待检测文本
   */
  async checkStr(text) {
    try {
      var res = await wx.cloud.callFunction({
        name: 'checkStr',
        data: {
          text: text,
        }
      });
      //console.log(res.result.errCode);
      return res.result.errCode == 0;
    } catch (err) {
      console.error('文字审核请求失败', err);
      throw err;
    }
  },
  /**
   * 图片内容合法性检测
   * @param {Buffer} media - 图片Buffer
   */
  async checkImg(media) {
    console.log("要检测的buffer", media)
    try {
      var res = await wx.cloud.callFunction({
        name: 'checkImg',
        data: {
          media
        }
      });
      console.log("云检测结果", res.result);
      return res.result.errCode
    } catch (err) {
      console.log("云检测错误", err);
      throw err;
    }
  },
  /**
   * 读取图片Buffer
   * @param {String} media - 图片路径
   */
  async qubuffer(media) {
    //console.log("图片路径",media)
    return new Promise((resolve, reject) => {
      wx.getFileSystemManager().readFile({
        filePath: media,
        success: res => {
          //console.log("刚转换完",res.data)
          resolve(res.data)
        },
        fail: reject
      })
    })
  },
  /**
   * 图片压缩
   * @param {String} media - 图片路径
   * @param {Number} number - 压缩质量
   * @param {Number} max - 最大尺寸
   */
  /**
   * 图片压缩
   * @param {String} media - 图片路径
   * @param {Number} number - 压缩质量
   * @param {Number} max - 最大尺寸
   */
  async yasuo(media, number, max) {
    console.log("要压缩的地址", media)
    var that = this
    return new Promise((resolve) => {
      wx.getImageInfo({
        src: media,
        success(res) {
          console.log("图片宽高：", res.width, res.height)
          that.setData({
            imginfo: {
              width: res.width,
              height: res.height
            }
          })

          var canvasWidth = res.width //图片原始长宽
          var canvasHeight = res.height
          //不管长或者宽，限制最长的边等于max
          if (canvasWidth > canvasHeight) {
            canvasHeight = Math.trunc(max * canvasHeight / canvasWidth)
            canvasWidth = max
          } else {
            canvasWidth = Math.trunc(max * canvasWidth / canvasHeight)
            canvasHeight = max
          }
          console.log("画布宽高：", canvasWidth, canvasHeight)
          that.setData({
            Cwidth: canvasWidth,
            Cheight: canvasHeight
          })

          // 使用 Canvas 2D API
          const query = wx.createSelectorQuery()
          query.select('#huabu')
            .fields({ node: true, size: true })
            .exec((res) => {
              const canvas = res[0].node
              const ctx = canvas.getContext('2d')

              // 设置 canvas 宽高
              canvas.width = canvasWidth
              canvas.height = canvasHeight

              // 创建图片对象
              const img = canvas.createImage()
              img.src = media
              img.onload = () => {
                // 清除画布并绘制图片
                ctx.clearRect(0, 0, canvasWidth, canvasHeight)
                ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight)

                // 导出图片
                setTimeout(() => {
                  wx.canvasToTempFilePath({
                    canvas: canvas, // 传入 canvas 实例
                    fileType: 'jpg',
                    quality: number,
                    destWidth: canvasWidth,
                    destHeight: canvasHeight,
                    success: function (res) {
                      console.log("压缩成功", res.tempFilePath)
                      resolve(res.tempFilePath)
                    },
                    fail: function (res) {
                      console.log("压缩失败：", res.errMsg)
                      resolve(-1)
                    }
                  })
                }, 300)
              }
              img.onerror = (err) => {
                console.log("图片加载失败", err)
                resolve(-1)
              }
            })
        },
        fail(err) {
          console.log("获取图片信息失败", err)
          resolve(-1)
        }
      })
    })
  },


  // 获取课程信息


  /**
   * 提交表单
   */
  async tijiao(e) {

    wx.getSystemInfo({
      success: (result) => {
        console.log(result)
        this.setData({
          pixe: result.pixelRatio
        })
      },
    })
    console.log(e.detail.value)
    //若未登录，直接到登录页面
    if (app.userInfo.userinfo.login != true) {
      wx.switchTab({
        url: '/pages/my/wd/wd'
      })
      return
    }
    //检测账号是否被封
    var ban = app.userInfo.ban
    if (ban == true) {
      wx.showToast({
        title: '账号被封！',
        icon: 'none',
        duration: 7000
      })
      return
    } else {
      //console.log(e.detail.value)//bankuai/zilei/niming2匿名内容/niming1是否匿名/wbnr/
      var biaodan = e.detail.value //整个表单数据
      var text = biaodan.wbnr //临时text。文本内容
      var publish = this.data.publish
      var choosetitle = this.data.choosetitle111
      var ordertitle = biaodan.ordertitle
      var phone = biaodan.lianxi
      var jg = biaodan.jg
      var openlocationtitle = this.data.openlocationtitle
      var weixin = biaodan.weixin


      if (this.data.choosetitle) {

        if (text.length == 0 && this.data.imgs.length == 0) {
          wx.showToast({
            title: '再多说点吧！',
            icon: 'none',
            duration: 800,
          })
          return //这个return返回，停止继续执行
        } else if (publish.voteOption.length == 1) {
          wx.showToast({
            title: '选项至少2个',
            icon: 'none',
            duration: 800,
          })
          return //这个return返回，停止继续执行
        } else if (choosetitle == "请选择话题") {
          wx.showToast({
            title: '请选择话题',
            icon: 'none',
            duration: 800,
          })
          return //这个return返回，停止继续执行
        }

        var _this = this
        wx.showModal({
          title: '提示💡',
          content: '即将发送此帖到“' + choosetitle + '”',
          showCancel: true,
          confirmText: '是滴',
          confirmColor: '#FF4D49',
          cancelText: '考虑一下',
          cancelColor: '#8b8b8b',
          success(res) {
            if (res.confirm) {
              //console.log('用户点击确定')
              _this.tijiao2(biaodan)
              return true
            } else if (res.cancel) {
              //console.log('用户点击取消')
              return false
            }
          }
        })

      }


      if (this.data.neworder) {

        console.log(biaodan, "hhhhhh")
        if (!phone && !weixin) {
          wx.showToast({
            title: '至少一个联系方式',
            icon: 'none',
            duration: 800,
          })
          return //这个return返回，停止继续执行
        } else if (openlocationtitle == "请选择派单类型") {
          wx.showToast({
            title: '请选择类型',
            icon: 'none',
            duration: 800,
          })
          return //这个return返回，停止继续执行
        } else if (ordertitle.length < 1) {
          wx.showToast({
            title: '标题',
            icon: 'none',
            duration: 800,
          })
          return //这个return返回，停止继续执行
        } else if (jg <= 2 && jg == "") {
          wx.showToast({
            title: '赏金不小于2元',
            icon: 'none',
            duration: 800,
          })
          return //这个return返回，停止继续执行
        }

        var _this = this
        wx.showModal({
          title: '提示💡',
          content: '即将发送此帖到“' + openlocationtitle + '”',
          showCancel: true,
          confirmText: '是滴',
          confirmColor: '#FF4D49',
          cancelText: '考虑一下',
          cancelColor: '#8b8b8b',
          success(res) {
            if (res.confirm) {
              //console.log('用户点击确定')
              _this.tijiao2(biaodan)
              return true
            } else if (res.cancel) {
              //console.log('用户点击取消')
              return false
            }
          }
        })

      }
    }

  },



  /**
   * 提交处理逻辑
   */
  async tijiao2(biaodan) {
    console.log("表单：", biaodan)

    var choosetitle = this.data.choosetitle111
    var text = biaodan.wbnr + choosetitle //临时text。文本内容
    wx.showLoading({
      title: '准备发送...',
      mask: true
    })

    var img = this.data.imgs //图片路径赋值给变量img
    var that = this //用that表当前外部对象
    that.setData({
      Imgs: []
    })
    var format = "png"
    var imageCheckPromise = Promise.resolve(true)
    if (img.length != 0) {
      var index = img[0].lastIndexOf(".")
      var ext = img[0].substring(index + 1)
      console.log("imageformat", ext.toString())
      var imageformat = ext.toLowerCase() == "gif"
      format = imageformat ? "GIF" : "png"
      imageCheckPromise = imageformat ? that.GIFimgcheck() : that.imgcheck()
    }

    // 文字和图片互不依赖，并行审核以缩短带图发帖等待时间。
    try {
      var reviewResults = await Promise.all([
        text.length > 0 ? this.checkStr(text) : Promise.resolve(true),
        imageCheckPromise
      ])
      var checkOk = reviewResults[0]
      var imgok = reviewResults[1]
    } catch (err) {
      wx.hideLoading()
      wx.showToast({ title: '网络失败，请重试', icon: 'none', duration: 2000 })
      return
    }
    if (!checkOk) {
      wx.hideLoading()
      wx.showToast({ title: '文字审核失败', icon: 'none', duration: 2000 })
      return
    }
    if (!imgok) {
      wx.hideLoading()
      wx.showToast({ title: '图片审核失败', icon: 'none', duration: 2000 })
      return
    }

    //判断 默认选择器分类[0,0]
    biaodan.fenlei = biaodan.fenlei === null ? [0, 0] : biaodan.fenlei
    console.log("楼主id::::", app.userInfo._id)
    var ss_xx = {
      choosetitle: this.data.choosetitle111, //标签
      firsttime: new Date().getTime(), //发布时间
      username: app.userInfo.userinfo.username, //签名
      zhuanye: app.userInfo.userinfo.zhuanye,
      gender: app.userInfo.userinfo.gender, //用户性别
      userphoto: app.userInfo.userinfo.userphoto, //头像
      nr: biaodan.wbnr, //文本


      orderdetail: {
        takeorder: false, //派单状态
        takeorderid: "", //接单人id
        takeordername: "", //接单人昵称
        takeorderphone: "", //接单人电话
        openlocationtitle: this.data.openlocationtitle, //派单类型
        ordertitle: biaodan.ordertitle, //订单标题
        jg: biaodan.jg, //价格
        starPOINT: biaodan.starPOINT, //开始位置
        endPOINT: biaodan.endPOINT, //结束位置
        lianxi: biaodan.lianxi, //电话
        weixin: biaodan.weixin, //微信

      },
      tp: [], //图片数组！！！！！！！！！数组缺少图片
      huifunr: [], //别人的评论
      huifunb: 0, //评论总数
      dianzanid: [], //别人的评论点赞
      Mazhu: [], //别人的马住id
      dianzannb: 0, //点赞数
      jubao: [
        [], 0
      ], //被举报的id合集，前面添加id，加完云函数记个数
      look: 0, //记录浏览量 
      lzid: app.userInfo._id, //楼主所在主体


    }
    //console.log(ss_xx)

    //上传图片
    var Imgs = that.data.Imgs
    console.log("imgs:", Imgs)
    if (Imgs.length != 0) {
      wx.showLoading({
        title: '就快好了...',
        mask: true
      })
      try {
        const uploadPromises = Imgs.map((filePath, i) => {
          return new Promise((resolve, reject) => {
            var time = new Date().getTime()
            const cloudPath = "ss_img1/" + app.userInfo._id + "-" + time + "-" + i.toString() + "." + format

            wx.cloud.uploadFile({
              cloudPath: cloudPath,
              filePath: filePath,
              success: res => {
                console.log('上传结果：', res)
                resolve(res.fileID)
              },
              fail: err => {
                console.error("上传失败：", err)
                reject(err)
              }
            })
          })
        })

        const fileIDs = await Promise.all(uploadPromises)
        ss_xx.tp = fileIDs
        console.log("说说图片", fileIDs)
        //带图发帖！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！
        that.post(ss_xx)
      } catch (err) {
        wx.hideLoading()
        wx.showToast({
          title: '图片上传失败',
          icon: 'none'
        })
      }
    } else {
      //纯文本发帖！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！
      that.post(ss_xx)
    }


  },

  /**
   * 普通图片压缩及审核
   */
  async imgcheck() {
    //审核图片
    try {
      var imgs = this.data.imgs
      var tp = imgs; // 直接使用已压缩的图片
      var tp2 = [];
      var that = this

      console.log("ischeck?:", app.system1.system.tpcheck)
      if (app.system1.system.tpcheck) {
        //need
        //--------经过上面过程已经压缩完毕，再整体取buffer检测
        // 直接使用已压缩的图片(1000px)进行检测，省去生成缩略图的步骤
        // 并行执行图片内容检测
        const checkPromises = imgs.map(async (filePath) => {
          const buffer = await that.qubuffer(filePath);
          return that.checkImg(buffer);
        });

        const results = await Promise.all(checkPromises);

        for (const checkOk of results) {
          if (checkOk == 87014 || checkOk == -604102) {
            //图片检测出现问题
            return false
          }
        }
      }
      that.setData({
        Imgs: tp
      })
      return true
      //--------返回结果
    } catch (err) {
      console.log("imgcheck错误", err);
      throw err;
    }
  },

  async GIFimgcheck() {
    //审核GIF图片
    try {
      var imgs = this.data.imgs
      var tp = imgs;
      var that = this

      console.log("ischeck?:", app.system1.system.tpcheck)
      if (app.system1.system.tpcheck) {
        // 并行执行图片内容检测
        const checkPromises = imgs.map(async (filePath) => {
          const buffer = await that.qubuffer(filePath);
          return that.checkImg(buffer);
        });

        const results = await Promise.all(checkPromises);

        for (const checkOk of results) {
          if (checkOk == 87014 || checkOk == -604102) {
            //图片检测出现问题
            return false
          }
        }
      }
      that.setData({
        Imgs: tp
      })
      return true
    } catch (err) {
      console.log("GIFimgcheck错误", err);
      throw err;
    }
  },
  /**
   * 实时获取文本输入
   */
  wbnr(e) {
    //console.log(e.detail.value)
    var s = e.detail.value.length
    var y = s + "/" + 599
    // console.log(y) 
    this.setData({
      wbnr: e.detail.value,
      sy: y
    })
  },
  /**
   * 发布说说
   */
  async post(ss_xx) {
    // if (voteOption.length <2) {
    //   this.showToast("投票选项至少两个", "warning", "#FFC107", 2000)
    // }
    //loading发布中
    wx.showLoading({
      title: '即将完成...',
      mask: true
    })
    //console.log("传过来",ss_xx)
    //var sjk=ss_xx.bankuai.toString()+"0"//@@@转成字符串@@@
    //添加说说记录

    let {
      voteNumberPerPerson,
      voteOption
    } = this.data.publish
    if (this._posting) return
    this._posting = true
    this.setData({ publishState: 'loading' })
    try {
      const postService = require('../../services/post-service')
      if (!this._publishRequestId) {
        this._publishRequestId = `${Date.now()}-${Math.random().toString(36).slice(2)}`
      }
      const result = await postService.publishPost({
        ss_xx,
        voteNumberPerPerson,
        voteOption,
        requestId: this._publishRequestId
      })
      app.shuaxin = true
      if (!app.userInfo.wenzhang) app.userInfo.wenzhang = []
      if (result.record) app.userInfo.wenzhang = app.userInfo.wenzhang.concat([result.record]).slice(-50)
      this.setData({ imgs: [], wbnr: '', publishSuccess: true })
      this.setData({ publishState: 'success' })
      this._publishRequestId = ''
      wx.switchTab({ url: '/pages/index/index' })
    } catch (err) {
      this.setData({ publishState: 'failed' })
      console.error('发布帖子失败', err)
      const message = err && err.errMsg && /network|timeout|connection|request:fail/i.test(err.errMsg)
        ? '网络失败，请重试'
        : '发布失败，请稍后重试'
      wx.showToast({ title: message, icon: 'none' })
    } finally {
      this._posting = false
      wx.hideLoading()
    }

  },


  /**
   * 选择图片
   */
  /**
   * 选择图片
   */
  chooseImg: function (e) {
    var that = this;
    var imgs = this.data.imgs;
    var ktj = 9 - imgs.length
    //console.log(ktj)
    if (ktj <= 0) {
      wx.showToast({
        title: '最多添加九张',
        icon: 'none',
        duration: 2000,
      })
    } else {
      wx.chooseMedia({
        count: 9 - that.data.imgs.length, // 剩余可选数量
        mediaType: ['image'],
        sourceType: ['album',],
        sizeType: ['compressed'],
        success: async function (res) {
          // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
          var tempFiles = res.tempFiles;
          var imgs = that.data.imgs;

          wx.showLoading({
            title: '图片上传中...',
            mask: true
          })

          for (var i = 0; i < tempFiles.length; i++) {
            if (imgs.length >= 9) {
              break;
            }

            let filePath = tempFiles[i].tempFilePath;
            console.log("开始处理图片：", filePath);

            // 使用 wx.getImageInfo 获取图片真实类型
            try {
              const imageInfo = await new Promise((resolve, reject) => {
                wx.getImageInfo({
                  src: filePath,
                  success: resolve,
                  fail: reject
                })
              });

              if (imageInfo.type === 'gif') {
                console.log("检测到GIF (wx.getImageInfo)，跳过压缩");
              } else {
                // 非GIF图片进行压缩，质量 0.6，最大边长 800
                let compressedPath = await that.yasuo(filePath, 0.6, 800);
                if (compressedPath != -1) {
                  filePath = compressedPath;
                } else {
                  console.log("压缩失败，使用原图");
                }
              }
            } catch (err) {
              console.error("获取图片信息失败，尝试通过扩展名判断", err);
              // 降级处理：如果获取信息失败，尝试通过扩展名判断
              let ext = filePath.substring(filePath.lastIndexOf(".") + 1).toLowerCase();
              if (ext === 'gif') {
                console.log("检测到GIF (扩展名)，跳过压缩");
              } else {
                let compressedPath = await that.yasuo(filePath, 0.6, 800);
                if (compressedPath != -1) {
                  filePath = compressedPath;
                }
              }
            }

            imgs.push(filePath);
          }

          that.setData({
            imgs: imgs
          });

          wx.hideLoading();


        }
      });
    }
  },


  /**
   * 删除图片
   */
  deleteImg: function (e) {
    var imgs = this.data.imgs;
    var index = e.currentTarget.dataset.index;
    imgs.splice(index, 1);
    this.setData({
      imgs: imgs
    });
  },




  /**
   * 预览图片
   */
  previewImg: function (e) {
    //获取当前图片的下标
    var index = e.currentTarget.dataset.index;
    //所有图片
    var imgs = this.data.imgs;
    wx.previewImage({
      //当前显示图片
      current: imgs[index],
      //所有图片
      urls: imgs
    })
  },
  onReady: function () {
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    if (options.neworder) {
      var neworder = options.neworder
      var posttitle = options.posttitle
      var tctitle = options.tctitle
      var lianxi = app.userInfo.phone
      var openlocationtitle = "请选择派单类型"
      // var dinyuetitle="接单提醒1次"// 订阅通知提示语
      var tmplIds = ['ZVDufG3eOY6D9c9JOJe_81ADKqBGf0-TVuALiqUTd58']
      this.setData({

        tmplIds,
        neworder,
        posttitle,
        tctitle,
        lianxi,
        openlocationtitle

      })

    } else if (options.choosetitle) {
      var choosetitle = JSON.parse(options.choosetitle);
      var posttitle = options.posttitle
      var tctitle = options.tctitle
      var choosetitle111 = options.choosetitle111
      console.log(choosetitle)
      let publish = this.data.publish
      // var dinyuetitle="建立一个友善、信任的互助平台，共同遵守天美社区规范" // 订阅通知提示语
      var tmplIds = ['hs60e8rl8z2e_dMIRqBgT5izdt7qw_e9O3Y8xWFh9pY']

      this.setData({
        tmplIds,
        choosetitle111,
        publish,
        posttitle,
        tctitle,
        choosetitle
      })

    }

    // 订阅通知
    var _this = this
    wx.showModal({
      title: '🤖️',
      content: '建立一个友善、信任的校内互助平台，共同遵守社区规范',

      confirmText: 'ok',
      confirmColor: '#FF4D49',
      showCancel: false,
      success(res) {
        if (res.confirm) {
          //console.log('用户点击确定')
          _this.allowup()
          return true
        } else if (res.cancel) {
          //console.log('用户点击取消')
          return false
        }
      }
    })

  },


  // 订阅通知
  /**
   * 订阅通知授权
   */
  allowup(e) {

    var diyi = 'ZVDufG3eOY6D9c9JOJe_81ADKqBGf0-TVuALiqUTd58'
    var dier = 'hs60e8rl8z2e_dMIRqBgT5izdt7qw_e9O3Y8xWFh9pY'
    var tmplIds = this.data.tmplIds
    var msgnb = [app.userInfo.msgnb[0], app.userInfo.msgnb[1]]

    console.log("xxxpppppp", tmplIds)


    var that = this
    wx.requestSubscribeMessage({
      tmplIds: tmplIds,
      success(res) {
        console.log("订阅消息API调⽤成功：", res, "up")


        console.log([dier])




        if (res[diyi] == 'accept') {
          //第一个接单模板,回复
          msgnb[0]++

        } else if (res[dier] == 'accept') {
          //第二个回复模板,
          msgnb[1]++

        } else if (res[diyi] == 'reject') {
          wx.showToast({
            title: '您拒绝派单通知',
            icon: 'none',
            duration: 1000
          })
        } else if (res[dier] == 'reject') {
          wx.showToast({
            title: '您拒绝评论通知',
            icon: 'none',
            duration: 1000
          })
        }



        console.log(msgnb)
        that.setData({

          msgnb: msgnb
        })


        console.log("加到数据库")

        callCloudFunction('login', { action: 'setMessageBadge', msgnb }).catch(err => {
          console.error('保存订阅消息状态失败', err)
        })
        console.log('增加了所有授权')
      },



      fail(res) {
        console.log("订阅消息API调⽤失败：", res)
        var errCode = res.errCode
        if (errCode == 20004) {
          wx.showToast({
            title: '您拒绝接收消息',
            icon: 'none'
          })
          this.turrenoff()
        }
      }
    })
  },





  //   投票//////////////////


  bindInput(e) {
    var voteOption = e.detail.value
    this.setData({
      voteOption
    })

  },


  addVoteOption() {
    let publish = this.data.publish.voteOption // Assuming publish.voteOption is the array to modify
    let voteOption = this.data.voteOption
    if (voteOption == "") {
      wx.showToast({
        title: '内容不能为空',
        icon: "none"
      })
      return
    }
    for (var i = 0; i < publish.length; i++) {
      if (publish[i].option == voteOption) {
        wx.showToast({
          title: '已存在该选项',
          icon: "none"
        })
        return
      }
    }

    if (publish.length < this.data.maxNumberOptions) { // Check maxNumberOptions here
      var n = {
        option: voteOption,
        num: 0,
        user: []
      }
      publish.push(n)
      this.setData({
        'publish.voteOption': publish, // Update the specific property
        voteOption: ""
      })


    } else {
      wx.showToast({
        title: '投票选项的最多5个',
        icon: 'none'
      })
    }


  },
  deleteVoteOption(e) {
    let item = e.currentTarget.dataset.src
    let publish = this.data.publish
    let voteOption = this.data.publish.voteOption
    let index = voteOption.indexOf(item)
    if (voteOption[index] == item) {
      voteOption.splice(index, 1)
      publish.voteOption = voteOption
      this.setData({
        publish
      })
    }
  },


  votebutton() {
    var votebutton = this.data.votebutton
    if (!votebutton) {
      this.setData({
        votebutton: true
      });
    } else if (votebutton) {
      this.setData({
        votebutton: false,
        publish: {

          voteNumberPerPerson: 1,
          voteOption: []
        },


      });

    }
  },



  onCheck() {
    let publish = this.data.publish;
    publish.isShow = !publish.isShow
    this.setData({
      publish
    });
  },

  /**
   * 选择话题
   */
  choosetitle() {

    this.setData({

      istrue: true
    })

  },

  /**
   * 选择具体话题
   */
  choosetitledetil(e) {

    let choosetitle111 = e.currentTarget.dataset.choosetitle
    this.setData({

      choosetitle111: choosetitle111,
      istrue: false


    })

  },

  /**
   * 选择派单类型
   */
  openlocation(e) {

    let ordertype = e.currentTarget.dataset.ordertype
    if (ordertype == "1") {

      this.setData({

        openlocation: true,
        openlocationtitle: "帮拿带取",
        istrue: false

      })

    } else if (ordertype == "2") {

      this.setData({

        openlocation: false,
        openlocationtitle: "二手求购",
        istrue: false

      })

    } else if (ordertype == "3") {

      this.setData({

        openlocation: false,
        openlocationtitle: "其他任务",
        istrue: false

      })

    }

  },





  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },
  /**
   * 关闭弹窗
   */
  closeDialog: function () {
    this.setData({
      istrue: false
    })
  },


  /**
   * 增加话题
   */
  addtitle(e) {

    this.setData({

      istrue: false

    })

    wx.showModal({
      title: "创建话题",
      editable: true, //显示输入框
      placeholderText: '请输入话题（小于10字）', //显示输入框提示信息
      maxlength: 5,


      success: res => {
        if (res.confirm) { //点击了确认
          var choosetitle111 = res.content
          if (choosetitle111.length < 10) {
            this.setData({
              choosetitle111: "#" + choosetitle111,
            })
            console.log(res.content) //用户输入的值
          } else {
            wx.showToast({
              title: '标签小于10字',
              icon: 'none',
              duration: 1000,
            })

          }

        } else {
          console.log('用户点击了取消')
        }
      }
    })
  },



  //   获取位置

  // $chooselocation: function () {
  //   var that = this;
  //   // wx.showModal({
  //   //   title: '温馨提示：',
  //   //   content: '为了保护个人信息安全，请不要填写宿舍号。',
  //   //   success (res){

  //           wx.chooseLocation(
  //             {
  //               success: function (res) {
  //                 that.setData({
  //                   receiver_address: res.name,
  //                   latitude:res.latitude,
  //                   longitude:res.longitude
  //                 })
  //                 if (res.name==''){
  //                   wx:wx.showToast({
  //                     title: '未选择位置',
  //                     icon: 'fail',
  //                     image: '/Icon/logo/error.png',
  //                     duration: 2000,
  //                   })
  //                 }else{
  //                   wx.showToast({
  //                     title: '位置成功',
  //                     icon: 'success',
  //                     duration: 1000,
  //                   })
  //                 }
  //               },
  //               fail: function (res) {
  //                 wx.showToast({
  //                   title: '位置失败',
  //                   icon: 'fail',
  //                   image: '/Icon/logo/error.png',
  //                   duration: 1000,
  //                 })
  //                 wx.showModal({
  //                   title: '用户未授权',
  //                   content: '请开启相关权限,以便更好使用小程序',
  //                   showCancel: true,
  //                   success: function (res) {
  //                     if (res.confirm) {
  //                       wx.openSetting({
  //                         success: function(res) {
  //                          console.log(res.authSetting)
  //                           if (res.authSetting){
  //                               wx.chooseLocation({
  //                                 success: function(res) {
  //                                   that.setData({
  //                                     receiver_address: res.name
  //                                   })
  //                                   if (res.name == '') {
  //                                     wx: wx.showToast({
  //                                       title: '未选择位置',
  //                                       icon: 'fail',
  //                                       image: '/Icon/logo/error.png',
  //                                       duration: 2000,
  //                                     })
  //                                   }else{
  //                                     wx.showToast({
  //                                       title: '位置成功',
  //                                       icon: 'success',
  //                                       duration: 1000,
  //                                     })
  //                                   }
  //                                 },
  //                                 fail(res){
  //                                   wx.showToast({
  //                                     title: '位置失败',
  //                                     icon: 'fail',
  //                                     image: '/Icon/logo/error.png',
  //                                     duration: 1000,
  //                                   })
  //                                 }
  //                               })
  //                           }else{
  //                             wx.showToast({
  //                               title: '位置失败',
  //                               icon: 'fail',
  //                               image: '/Icon/logo/error.png',
  //                               duration: 1000,
  //                             })
  //                           }
  //                         },
  //                         fail: function(res) {
  //                           wx.showToast({
  //                             title: '位置失败',
  //                             icon: 'fail',
  //                             image: '/Icon/logo/error.png',
  //                             duration: 1000,
  //                           })
  //                         },
  //                       })
  //                     } else if (res.cancel) {
  //                       wx.switchTab({
  //                         url: '/pages/index/index',
  //                       })
  //                     }
  //                   },
  //                   fail: function (res) {
  //                     wx.showToast({
  //                       title: '位置失败',
  //                       icon: 'fail',
  //                       image: '/Icon/logo/error.png',
  //                       duration: 1000,
  //                     })
  //                   },
  //                 })
  //               },
  //             }
  //           )

  //     },
  //     fail (res){
  //       wx.showToast({
  //         title: '服务器异常',
  //         icon:'fail',
  //         image: '/Icon/logo/error.png',
  //         duration:2000,
  //       })
  //   //   }
  //   // }) 
  // },

})
