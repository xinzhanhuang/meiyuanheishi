// miniprogram/pages/post/post.js
var util = require('../../utils/util.js');
const app = getApp()
const db = wx.cloud.database()
Page({
  data: {
    showModal: false,
    niming: false,
    imgs: [],
    Imgs: [],
    fileID: [],
    wbnr: "",
    index: [0, 0],
    heji: [],
    sy: "0/50",
    Cheight: 800,
    Cwidth: 800,
    pixe: 0,
    imginfo: {},
    xianshi: false,
    switch1Checked: false,

    // 订阅通知
    allow: 'true',
    msgnb: [0, 0],
    tmplIds: ['ryuEwiWxTAL-kKCFtReQUazKN-l07X9F5rPYUJz5ecY', 'ryuEwiWxTAL-kKCFtReQUazKN-l07X9F5rPYUJz5ecY'],

    // Module Logic
    postType: 'shop', // 'shop', 'database', 'course'
    moduleID: 0, // 0=Shop, 1=Database, 2=Course
    files: [], // To store selected files

    // Upload Progress
    isUploading: false,
    uploadPercent: 0,
    uploadedFileResult: null,
    zbtitle: ""
  },

  // Choose File (for Database module)
  chooseFile() {
    console.log("chooseFile triggered");
    // Debug: Show toast to confirm click works
    wx.showToast({
      title: '正在打开文件...',
      icon: 'none',
      duration: 1000
    });

    wx.chooseMessageFile({
      count: 1,
      type: 'file', // Restricted to files only (no images/videos)
      success: (res) => {
        console.log("chooseMessageFile success", res);
        this.setData({
          files: res.tempFiles
        })
        // Trigger immediate upload
        if (res.tempFiles.length > 0) {
          this.uploadFileNow(res.tempFiles[0]);
        }
      },
      fail: (err) => {
        console.error("chooseMessageFile failed", err);
        wx.showToast({
          title: '打开文件失败: ' + JSON.stringify(err),
          icon: 'none',
          duration: 3000
        });
      }
    })
  },

  // Immediate Upload Function
  uploadFileNow(fileObj) {
    const that = this;
    var time = new Date().getTime()
    let ext = fileObj.name.split('.').pop() || 'dat';
    const cloudPath = "ss_files/" + app.userInfo._id + "-" + time + "-0." + ext

    this.setData({
      isUploading: true,
      uploadPercent: 0,
      uploadedFileResult: null
    });

    // Store uploadTask in 'this' scope to access it later
    this.uploadTask = wx.cloud.uploadFile({
      cloudPath: cloudPath,
      filePath: fileObj.path,
      success: res => {
        console.log('文件上传成功：', res)
        that.setData({
          isUploading: false,
          uploadedFileResult: {
            name: fileObj.name,
            fileID: res.fileID
          }
        })
      },
      fail: err => {
        // Ignore abort error
        if (err.errMsg && err.errMsg.indexOf('abort') !== -1) {
          console.log('上传已取消');
          return;
        }
        console.error("文件上传失败：", err)
        that.setData({ isUploading: false })
        wx.showToast({
          title: '上传失败',
          icon: 'none'
        })
      }
    });

    this.uploadTask.onProgressUpdate((res) => {
      that.setData({
        uploadPercent: res.progress
      })
    });
  },

  // Delete Selected File
  deleteFile(e) {
    if (this.uploadTask) {
      this.uploadTask.abort();
      this.uploadTask = null;
    }
    this.setData({
      files: [],
      uploadedFileResult: null,
      isUploading: false,
      uploadPercent: 0
    })
  },

  onUnload: function () {
    if (this.uploadTask) {
      this.uploadTask.abort();
      this.uploadTask = null;
    }
    // Clean up Edit Mode State
    this.setData({
      isEdit: false,
      editId: null
    });
  },

  kaishixuanze(e) {
    if (this.data.isDynamic) return; // Prevent hardcoded logic if dynamic
    //console.log("第几列",e.detail.column)
    var data = {
      index: this.data.index,
      heji: this.data.heji
    }
    switch (e.detail.column) {
      case 0:
        switch (e.detail.value) {
          case 0:
            data.index = [0, 0];
            data.heji[1] = ["南院", "北院"];
            break;

          case 1:
            data.index = [1, 0];
            data.heji[1] = ["南院", "北院"];
            break;

          case 2:
            data.index = [2, 0];
            data.heji[1] = ["南院", "北院"];
            break;


        }
      case 1:
        break;
    }
    this.setData(data)
    //console.log(data)
  },
  xuanzewanbi(e) {
    //console.log(e.detail.value)
    this.setData({ index: e.detail.value })


  },

  // 价格、位置开关
  //灯  26  high1 low1
  //    light(e){
  //     //拿到状态
  //  var status=e.detail.value

  //  if(status==true){
  //       console.log("开灯")
  //       //向后台发送请求
  //      this.setData({
  //          xianshi:true
  //      })
  //  }else{
  //     console.log("关灯")
  //     this.setData({
  //         xianshi:false
  //     })
  //  }
  // },

  // 匿名开关
  //灯  26  high1 low1
  niming1(e) {
    //拿到状态
    var status = e.detail.value

    if (status == true) {
      console.log("开灯")
      //向后台发送请求
      this.setData({
        niming1: 'true'
      })
    } else {
      console.log("关灯")
      this.setData({
        niming1: 'false'
      })
    }
  },


  //文本内容合法性检测
  async checkStr(text) {
    try {
      var res = await wx.cloud.callFunction({
        name: 'checkStr',
        data: {
          text: text,
        }
      });
      //console.log(res.result.errCode);
      if (res.result.errCode == 0)
        return true;
      return false;
    } catch (err) {
      console.log(err);
      return false;
    }
  },
  //图片内容合法性检测
  async checkImg(media) {
    console.log("要检测的buffer", media)
    try {
      var res = await wx.cloud.callFunction({
        name: 'checkImg',
        data: { media }
      });
      console.log("云检测结果", res.result);
      return res.result.errCode
    } catch (err) {
      console.log("云检测错误", err);
      return 1;
    }
  },
  //图片取buffer
  async qubuffer(media) {
    //console.log("图片路径",media)
    return new Promise((resolve, reject) => {
      wx.getFileSystemManager().readFile({
        filePath: media,
        success: res => {
          //console.log("刚转换完",res.data)
          resolve(res.data)
        }
      })
    })
  },
  //图片压缩
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


  /*提交表单 */
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
    }

    else {
      //console.log(e.detail.value)//bankuai/zilei/niming2匿名内容/niming1是否匿名/wbnr/
      var biaodan = e.detail.value//整个表单数据
      //   var text=biaodan.wbnr 临时text。文本内容
      var shopname = biaodan.zbtitle || ""
      var weizhi = biaodan.weizhi || ""

      const postType = this.data.postType; // 'database', 'shop', 'course'

      // Validation Logic
      var checkFailed = false;
      if (postType === 'database') {
        // Database: Only require Name
        if (shopname.length == 0) checkFailed = true;
      } else if (postType === 'course') {
        // Course: Require Name (course name) and Location
        if (shopname.length == 0 || weizhi.length == 0) checkFailed = true;
      } else {
        // Shop: Require Images, Address (weizhi), Name
        if (this.data.imgs.length == 0 || weizhi.length == 0 || shopname.length == 0) checkFailed = true;
      }

      if (checkFailed) {
        wx.showToast({
          title: '请完善信息',
          icon: 'none',
          duration: 1500,
        })
        return//这个return返回，停止继续执行
      }
      //console.log("传过来：",e)
      // Determine section name from picker
      if (biaodan.fenlei === null || biaodan.fenlei.length === 0) {
        biaodan.fenlei = [0, 0];
      }
      var bankuai = this.data.heji[1][biaodan.fenlei[1]];

      var _this = this
      wx.showModal({
        title: '提示',
        content: '发送到“' + bankuai + '”板块？\r\n管理员审核后公开',
        showCancel: true,
        confirmText: '是',
        confirmColor: '#FF4D49',
        cancelText: '否',
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




  },



  //（进行提交处理）
  //（进行提交处理）
  //（进行提交处理）
  //（进行提交处理）
  async tijiao2(biaodan) {
    console.log("表单：", biaodan)
    var text = biaodan.wbnr //临时text。文本内容
    wx.showLoading({
      title: '准备发送...',
      mask: true
    })

    if (text.length > 0) {
      var checkOk = await this.checkStr(text);
    } else {
      var checkOk = true
    }
    //开始审核文本
    if (!checkOk) {
      wx.hideLoading({}), //审核不通过隐藏
        wx.showToast({
          title: '文本含有违法违规内容',
          icon: 'none',
          duration: 5000,
        })
      return //这个return返回，停止继续执行
    }

    var img = this.data.imgs //图片路径赋值给变量img
    var that = this //用that表当前外部对象
    //开始图片审核，图片数量＞0时
    that.setData({
      Imgs: []
    })
    if (img.length != 0) {
      var imgok = await that.imgcheck()
      if (!imgok) {
        wx.hideLoading({}), //审核不通过隐藏
          wx.showToast({
            title: '图片检测出现问题',
            icon: 'none',
            duration: 2000,
          })
        //console.log("图片违法")
        return //这个return返回，停止继续执行
      }
    }

    //判断 默认选择器分类[0,0]
    biaodan.fenlei = biaodan.fenlei === null ? [0, 0] : biaodan.fenlei
    console.log("楼主id::::", app.userInfo._id)

    // Logic Separation for Database / Shop / Course
    const postType = this.data.postType;
    const moduleID = this.data.moduleID;

    // Determine Type Index (Dynamic Picker Column 1)
    // fenlei: [0, CategoryIndex]
    var typeIndex = biaodan.fenlei[1] || 0;

    // Map moduleID to zileiType string - REMOVED

    const titleValue = (biaodan.zbtitle || '').trim();
    var ss_xx = {
      // Common Fields
      // Type is the Category Index (0=Food, 1=Print...)
      type: typeIndex,
      // Zilei is the Module ID (0=Shop, 1=Database, 2=Course) passed from Tools
      zilei: moduleID,
      firsttime: new Date().getTime(), //发布时间
      username: app.userInfo.userinfo.username, //签名
      userphoto: app.userInfo.userinfo.userphoto, //头像
      niming1: biaodan.niming1, //是否匿名
      nr: biaodan.wbnr, //文本 (Description)
      zhuanye: app.userInfo.userinfo.zhuanye,
      // Unified title field for this page
      zbtitle: titleValue,

      lzid: app.userInfo._id, //楼主所在主体

      // Module Identifier - zileiType removed

      // Specific Fields
      lianxi: biaodan.lianxi || '', // Allow contact info for all
      weizhi: (postType === 'shop' || postType === 'course') ? biaodan.weizhi : '', // Address for Shop and Course
      latitude: (postType === 'shop' || postType === 'course') ? biaodan.latitude : 0,
      longitude: (postType === 'shop' || postType === 'course') ? biaodan.longitude : 0,
      link: postType === 'database' ? biaodan.link : '', // Link only for Database (for now)

      // Database Specific Fields (Populated later if Database)
      fujian: [],

      // Interactive Fields
      tp: [], //图片数组
      huifunr: [], //别人的评论
      remark_num: 0, //   打星
      percent: 0,
      int: 0,
      huifunb: 0, //评论总数
      dianzanid: [], //别人的评论点赞
      dianzannb: 0, //点赞数
      jubao: [[], 0], //被举报的id合集
      zoubianlook: 0, //记录浏览量
      checked: false // 审核状态：false=待审核, true=已通过, 2=已拒绝
    }
    //console.log(ss_xx)
    //上传图片
    var Imgs = that.data.Imgs
    var Files = that.data.files || []

    // Check if file is still uploading
    if (this.data.isUploading) {
      wx.showToast({
        title: '文件上传中',
        icon: 'none'
      })
      return;
    }

    console.log("imgs:", Imgs)
    console.log("files:", Files)

    wx.showLoading({
      title: '正在发布...',
      mask: true
    })

    try {
      // 1. Upload Images
      const imgUploadPromises = Imgs.map((filePath, i) => {
        return new Promise((resolve, reject) => {
          // Check if already a cloud file (e.g. from Edit Mode)
          if (filePath.indexOf('cloud://') !== -1) {
            console.log('Skipping upload for existing cloud file:', filePath);
            resolve(filePath);
            return;
          }

          var time = new Date().getTime()
          let ext = filePath.split('.').pop() || 'png';
          const cloudPath = "ss_img1/" + app.userInfo._id + "-" + time + "-" + i.toString() + "." + ext

          wx.cloud.uploadFile({
            cloudPath: cloudPath,
            filePath: filePath,
            success: res => {
              console.log('图片上传结果：', res)
              resolve(res.fileID)
            },
            fail: err => {
              console.error("图片上传失败：", err)
              reject(err)
            }
          })
        })
      })

      // 2. Prepare Files (Use pre-uploaded result)
      let fileResults = [];
      if (this.data.postType === 'database' && this.data.uploadedFileResult) {
        fileResults = [this.data.uploadedFileResult];
      }

      const imgFileIDs = await Promise.all(imgUploadPromises)
      // Files are already uploaded

      ss_xx.tp = imgFileIDs
      ss_xx.fujian = fileResults // Add file info to submission

      console.log("说说图片", imgFileIDs)
      console.log("上传文件", fileResults)

      //带图/文件发帖！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！
      that.post(ss_xx)

    } catch (err) {
      wx.hideLoading()
      that.setData({ isUploading: false, uploadPercent: 0 }) // Reset progress UI
      console.error("提交失败详情", err)
      wx.showToast({
        title: '上传失败',
        icon: 'none'
      })
    } finally {
      // Ensure loading/progress is cleared if not handled in catch
      // But 'post' function might be async? 
      // If 'post' navigates away, we might not need to reset?
      // Better to reset just in case of validation error in 'post' (unlikely)
      // that.setData({ isUploading: false }) -> Doing this early might hide success msg?
      // Let's leave it to 'post' success or catch block.
    }

  },

  //图片压缩及审核
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
        wx.showLoading({
          title: '图片审核...',
          mask: true
        })

        // 直接使用已压缩的图片(1000px)进行检测，省去生成缩略图的步骤
        // 并行执行图片内容检测

        // Filter out cloud images (already checked/trusted)
        const localImgs = imgs.filter(path => path.indexOf('cloud://') === -1);

        if (localImgs.length > 0) {
          const checkPromises = localImgs.map(async (filePath) => {
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
      }
      that.setData({
        Imgs: tp
      })
      return true
      //--------返回结果
    } catch (err) {
      console.log("imgcheck错误", err);
      return false;
    }
  },

  wbnr(e) {
    //console.log(e.detail.value)
    var s = e.detail.value.length
    var y = s + "/" + 50
    // console.log(y) 
    this.setData({
      wbnr: e.detail.value,
      sy: y
    })
  },
  //真正的上传说说
  //真正的上传说说
  post(ss_xx) {
    const that = this; // Ensure 'that' is available if not already

    //loading发布中
    wx.showLoading({
      title: '即将完成...',
      mask: true
    })
    //console.log("传过来",ss_xx)
    //var sjk=ss_xx.bankuai.toString()+"0"//@@@转成字符串@@@
    //添加说说记录

    // Edit Mode Logic
    if (this.data.isEdit && this.data.editId) {
      // Reset status to pending
      ss_xx.checked = false;

      db.collection('tianmeizhoubian').doc(this.data.editId).update({
        data: {
          ss_xx: ss_xx,
          time: ss_xx.firsttime
        }
      }).then(res => {
        console.log("Edit Success", res);
        app.shuaxin = true;
        wx.hideLoading({});
        wx.switchTab({ url: '/pages/tools/tools' });
        // Update local user record if needed (logic below relies on 'res._id' which update doesn't return same way)
        // But user record update for 'mytopic' might simply append? 
        // If editing, we typically don't need to add to 'mytopic' again if it's already there?
        // Existing logic below adds to 'users' collection.
        // If we are editing, we probably shouldn't add a duplicate entry to 'mytopic'.
        // So we can return here.
      }).catch(err => {
        console.error("Edit Failed", err);
        wx.hideLoading();
        wx.showToast({ title: '发布失败', icon: 'none' });
      });
      return; // Exit function for Edit Mode
    }

    // Normal Add Logic
    db.collection('tianmeizhoubian').add({
      data: {
        ss_xx,
        time: ss_xx.firsttime,
        // Ensure new posts have checked: false (if not set by default, explicit is safer)
        'ss_xx.checked': false
      }
    }).then((res) => {
      //console.log(res._id)//拿到id
      //console.log(ss_xx)

      //ss发送成功了
      //设置app跳转到首页后要刷新
      app.shuaxin = true
      wx.hideLoading({})//发布成功隐藏

      //app跳转到首页
      wx.switchTab({ url: '/pages/tools/tools' })


      var id = res._id
      var jl = {
        "time": ss_xx.firsttime,
        "zilei": ss_xx.zilei,
        "nr": ss_xx.nr,
        "zbtitle": ss_xx.zbtitle,
        "id": id,
        "weigui": false,
        "type": 'zhoubiantype'
      }
      if (jl.nr == '' && jl.zbtitle == '') {
        jl.nr = '分享了' + ss_xx.tp.length + '张图片'
      }

      var wenzhang = []
      //记录到自己users里（最多保留50条）
      db.collection("users").doc(app.userInfo._id).update({
        data: {
          wenzhang: _.push({ each: [jl], slice: -50 })
        }
      }).then((res) => {
        //进行全局数据我的本地储存
        if (!app.userInfo.wenzhang) app.userInfo.wenzhang = [];
        app.userInfo.wenzhang = app.userInfo.wenzhang.concat([jl]).slice(-50);
        this.setData({
          imgs: [],
          wbnr: ""
        })

        //   if(wenzhang.length<4){
        //     wx.showModal({
        //       title: '📣',
        //       content: '转发帖子获得更多曝光',
        //       showCancel: false,//是否显示取消按钮
        //       cancelText:"不再提示",//默认是“取消”
        //       cancelColor:'#000000',//取消按钮的文字颜色，必须是 16 进制格式的颜色字符串
        //       confirmText:"确定",//默认是“确定”
        //       confirmColor: '#576B95',//确定文字的颜色，必须是 16 进制格式的颜色字符串
        //       success: function (res) {
        //          if (res.confirm) {
        //           //点击确定执行的事件
        //          } else  {

        //             db.collection("users").doc(app.userInfo._id).update({
        //                 data:{
        //                   tishi:true
        //                 }
        //               })
        //            //执行取消事件
        //          }
        //       },
        //       fail: function (res) { },//接口调用失败的回调函数
        //       complete: function (res) { },//接口调用结束的回调函数（调用成功、失败都会执行）
        //    })
        //   };

      })

    })   // close add().then()




  },


  onReady: function () {
  },
  /*生命周期函数--监听页面加载*/



  onLoad: function (e) {
    const that = this;
    // START EDIT MODE LOGIC
    if (e.isEdit && e.id) {
      console.log("Entering Edit Mode", e.id);
      this.setData({
        isEdit: true,
        editId: e.id
      });
      wx.showLoading({ title: '加载原帖...' });

      const initEditData = () => {
        db.collection('tianmeizhoubian').doc(e.id).get().then(res => {
          const post = res.data.ss_xx;
          console.log("Original Post Data:", post);

          // Determine Module from zilei (number)
          let modID = post.zilei;
          modID = typeof modID === 'number' ? modID : parseFloat(modID);

          let pType = 'shop';
          if (modID === 1) pType = 'database';
          else if (modID === 2) pType = 'course';

          // Set Title based on module
          let t = "周边好店";
          if (pType === 'database') t = "资料库";
          if (pType === 'course') t = "课程详情";
          wx.setNavigationBarTitle({ title: t });

          // Dynamic Category Loading using app.zilei
          let heji = [];
          let index = [0, 0];

          if (app.zilei && app.zilei[modID]) {
            const config = app.zilei[modID];
            // config.moduleTabs is the array of categories
            heji = [[config.zileititle], config.moduleTabs];

            // Find index of subcategory
            // post.type is usually the index. 
            // Verify bounds just in case
            let subIndex = post.type || 0;
            if (subIndex >= config.moduleTabs.length) subIndex = 0;

            index = [0, subIndex];
          } else {
            // Fallback if config matches nothing (shouldn't happen if app.zilei is correct)
            console.warn("Config not found for modID:", modID);
            heji = [[t], ["默认"]];
          }

          // Restore File State if exists
          let files = [];
          let uploadedFileResult = null;
          if (post.fujian && post.fujian.length > 0) {
            files = post.fujian; // Assuming fujian structure matches files expectation for display matches {name: ...}
            uploadedFileResult = post.fujian[0];
          }

          that.setData({
            moduleID: modID,
            postType: pType,
            zbtitle: post.zbtitle || post.jg, // Compatible with old data that only had jg
            wbnr: post.nr,
            lianxi: post.lianxi,
            weizhi: post.weizhi,
            latitude: post.latitude,
            longitude: post.longitude,
            receiver_address: post.weizhi, // For display
            imgs: post.tp || [],
            Imgs: post.tp || [],
            link: post.link || '',

            // Restore Files
            files: files,
            uploadedFileResult: uploadedFileResult,

            // Set tip content manually since e.zilei is missing
            tipContent: pType === 'database' ? "确保内容合规..." : (pType === 'course' ? "确保包含课程要求..." : "确保包含店铺照片..."),
            heji: heji,
            index: index,
            zilei: index, // <--- Add this line to sync picker value
            isDynamic: true
          });
          wx.hideLoading();
        }).catch(err => {
          console.error(err);
          wx.hideLoading();
          wx.showToast({ title: '加载失败', icon: 'none' });
        });
      };

      // Ensure Config Loaded
      if (!app.zilei || app.zilei.length === 0) {
        wx.showLoading({ title: '准备配置...' });
        db.collection('lunbotu3').where({ schooltype: '天津美术学院' }).get().then(res => {
          if (res.data && res.data.length > 0) {
            app.zilei = res.data[0].zilei;
          }
          initEditData();
        }).catch(e => {
          console.error("Config load failed", e);
          initEditData(); // Try anyway
        });
      } else {
        initEditData();
      }
    }
    // END EDIT MODE LOGIC

    let tip = "*发帖前搜索是基本礼仪噢。";
    let modalContent = '建立一个友善、信任的校内互助平台，共同遵守社区规范';

    if (e.zilei) {
      var zilei = JSON.parse(decodeURIComponent(e.zilei));
      console.log("Receive zilei:", zilei);
      // Set dynamic tips and modal content based on title

      if (zilei.zileititle.indexOf("资料") !== -1) {
        tip = "确保内容合规、来源清晰、具备学习价值，内容多的资料用链接上传速度更快";
        modalContent = '分享实用资料，学习更高效，倡导互助、共享的社区氛围';
      } else if (zilei.zileititle.indexOf("店铺") !== -1 || zilei.zileititle.indexOf("周边") !== -1) {
        tip = "确保包含店铺照片、清晰的店名、完整的介绍、正确的定位，有联系方式最好啦";
        modalContent = '分享小众、性价比、新开的店铺，挖掘值得被看见的好店';
      } else if (zilei.zileititle.indexOf("课程") !== -1) {
        tip = "确保包含课程要求，时长，作业考核等信息，避免出现人名和负面内容";
        modalContent = '分享你上过的课程信息，帮助同学更好地了解学习内容和要求';
      }

      // Determine ModuleID and PostType
      let modID = 0; // Default to Shop
      if (e.moduleID) {
        modID = parseFloat(e.moduleID);
      } else {
        // Fallback checks
        if (zilei.zileititle.indexOf("资料") !== -1) modID = 1;
        else if (zilei.zileititle.indexOf("课程") !== -1) modID = 2;
        else modID = 0;
      }

      let pType = 'shop';
      if (modID === 1) pType = 'database';
      else if (modID === 2) pType = 'course';

      this.setData({
        isDynamic: true,
        heji: [[zilei.zileititle], zilei.moduleTabs],
        index: [0, 0],

        moduleID: modID,
        postType: pType,

        tipContent: tip
      });
      wx.setNavigationBarTitle({
        title: zilei.zileititle
      });
    }
    // 订阅通知
    var _this = this
    wx.showModal({
      title: '🤖️',
      content: modalContent,

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

    var diyi = 'ryuEwiWxTAL-kKCFtReQUazKN-l07X9F5rPYUJz5ecY' // Note: IDs might need to match what was in original file or post.js. Original had these IDs.
    // Use the IDs from this file's data
    // var dier = '...' 

    // In post.js:
    // var diyi = 'ZVDufG3eOY6D9c9JOJe_81ADKqBGf0-TVuALiqUTd58'
    // var dier = 'hs60e8rl8z2e_dMIRqBgT5izdt7qw_e9O3Y8xWFh9pY'

    // In post-zhoubian.js original:
    // tmplIds:['ryuEwiWxTAL-kKCFtReQUazKN-l07X9F5rPYUJz5ecY','ryuEwiWxTAL-kKCFtReQUazKN-l07X9F5rPYUJz5ecY']
    // It seems it used the same ID twice or just one ID.
    // I will use `this.data.tmplIds[0]` as `diyi`.

    var tmplIds = this.data.tmplIds
    var msgnb = [app.userInfo.msgnb[0], app.userInfo.msgnb[1]]

    console.log("xxxpppppp", tmplIds)


    var that = this
    wx.requestSubscribeMessage({
      tmplIds: tmplIds,
      success(res) {
        console.log("订阅消息API调⽤成功：", res, "up")

        // Logic to update msgnb based on which template was accepted.
        // Assuming both are same or similar logic to post.js
        // For simplicity, checking if any is accepted.

        // In post.js logic:
        // if (res[diyi] == 'accept') msgnb[0]++

        if (res[tmplIds[0]] == 'accept') {
          msgnb[0]++
        }
        if (tmplIds.length > 1 && res[tmplIds[1]] == 'accept') {
          msgnb[1]++
        }

        console.log(msgnb)
        that.setData({

          msgnb: msgnb
        })


        console.log("加到数据库")

        db.collection('users').doc(app.userInfo._id).update({
          data: {
            msgnb: msgnb,
            // allow:allow
          }
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
          // this.turrenoff()
        }
      }
    })
  },

  // 添加图片
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



  // 删除图片
  deleteImg: function (e) {
    var imgs = this.data.imgs;
    var index = e.currentTarget.dataset.index;
    imgs.splice(index, 1);
    this.setData({
      imgs: imgs
    });
  },
  // 预览图片
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
  //   onUnload: function () {
  //     //加到数据库
  //     console.log("加到数据库")
  //     var msgnb=this.data.msgnb
  //     var allow=app.userInfo.allow
  //     db.collection('users').doc(app.userInfo._id).update({
  //       data:{
  //         msgnb:msgnb,
  //         allow:allow
  //       }
  //     })
  //     console.log('增加了所有授权')
  //   },



  /*** 生命周期函数--监听页面初次渲染完成 */
  onReady: function () {

  },
  /** 生命周期函数--监听页面显示*/
  onShow: function () {







  },




  //   获取位置
  /**
   //   获取位置
  /**
      * 
      * 地图选点
      */
  //选择位置API

  $chooselocation: function () {
    var that = this;
    // wx.showModal({
    //   title: '温馨提示：',
    //   content: '为了保护个人信息安全，请不要填写宿舍号。',
    //   success (res){

    wx.chooseLocation(
      {
        success: function (res) {
          that.setData({
            receiver_address: res.name,
            latitude: res.latitude,
            longitude: res.longitude
          })
          if (res.name == '') {
            wx: wx.showToast({
              title: '未选择位置',
              icon: 'fail',
              image: '/Icon/logo/error.png',
              duration: 2000,
            })
          } else {
            wx.showToast({
              title: '位置成功',
              icon: 'success',
              duration: 1000,
            })
          }
        },
        fail: function (res) {
          wx.showToast({
            title: '位置失败',
            icon: 'fail',
            image: '/Icon/logo/error.png',
            duration: 1000,
          })
          wx.showModal({
            title: '用户未授权',
            content: '请开启相关权限,以便更好使用小程序',
            showCancel: true,
            success: function (res) {
              if (res.confirm) {
                wx.openSetting({
                  success: function (res) {
                    console.log(res.authSetting)
                    if (res.authSetting) {
                      wx.chooseLocation({
                        success: function (res) {
                          that.setData({
                            receiver_address: res.name
                          })
                          if (res.name == '') {
                            wx: wx.showToast({
                              title: '未选择位置',
                              icon: 'fail',
                              image: '/Icon/logo/error.png',
                              duration: 2000,
                            })
                          } else {
                            wx.showToast({
                              title: '位置成功',
                              icon: 'success',
                              duration: 1000,
                            })
                          }
                        },
                        fail(res) {
                          wx.showToast({
                            title: '位置失败',
                            icon: 'fail',
                            image: '/Icon/logo/error.png',
                            duration: 1000,
                          })
                        }
                      })
                    } else {
                      wx.showToast({
                        title: '位置失败',
                        icon: 'fail',
                        image: '/Icon/logo/error.png',
                        duration: 1000,
                      })
                    }
                  },
                  fail: function (res) {
                    wx.showToast({
                      title: '位置失败',
                      icon: 'fail',
                      image: '/Icon/logo/error.png',
                      duration: 1000,
                    })
                  },
                })
              } else if (res.cancel) {
                wx.switchTab({
                  url: '/pages/index/index',
                })
              }
            },
            fail: function (res) {
              wx.showToast({
                title: '位置失败',
                icon: 'fail',
                image: '/Icon/logo/error.png',
                duration: 1000,
              })
            },
          })
        },
      }
    )

  },


})