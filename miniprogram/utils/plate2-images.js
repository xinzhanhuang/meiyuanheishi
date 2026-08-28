module.exports = {
  async checkImg(media) {
  console.log("要检测的buffer", media);
  try {
    var res = await wx.cloud.callFunction({
      name: 'checkImg',
      data: {
        media
      }
    });
    console.log("云检测结果", res.result);
    return res.result.errCode;
  } catch (err) {
    console.log("云检测错误", err);
    return 1;
  }
},

  async qubuffer(media) {
  // console.log("图片路径",media)
  return new Promise((resolve, reject) => {
    wx.getFileSystemManager().readFile({
      filePath: media,
      success: res => {
        // console.log("刚转换完",res.data)
        resolve(res.data);
      }
    });
  });
},

  async yasuo(media, number, max) {
  console.log("要压缩的地址", media);
  var that = this;
  return new Promise((resolve) => {
    wx.getImageInfo({
      src: media,
      success(res) {
        console.log("图片宽高：", res.width, res.height);

        // 计算压缩后的尺寸
        var canvasWidth = res.width;
        var canvasHeight = res.height;
        if (canvasWidth > canvasHeight) {
          if (canvasWidth > max) {
            canvasHeight = Math.trunc(max * canvasHeight / canvasWidth);
            canvasWidth = max;
          }
        } else {
          if (canvasHeight > max) {
            canvasWidth = Math.trunc(max * canvasWidth / canvasHeight);
            canvasHeight = max;
          }
        }

        console.log("画布宽高：", canvasWidth, canvasHeight);
        that.setData({
          Cwidth: canvasWidth,
          Cheight: canvasHeight
        });

        // 使用 Canvas 2D
        const query = wx.createSelectorQuery();
        query.select('#huabu')
          .fields({ node: true, size: true })
          .exec((res2) => {
            if (!res2[0] || !res2[0].node) {
              console.error("Canvas 节点未找到");
              resolve(-1);
              return;
            }

            const canvas = res2[0].node;
            const ctx = canvas.getContext('2d');

            // 设置画布尺寸
            canvas.width = canvasWidth;
            canvas.height = canvasHeight;

            // 创建图片对象
            const img = canvas.createImage();
            img.src = media;
            img.onload = () => {
              // 清除画布并绘制图片
              ctx.clearRect(0, 0, canvasWidth, canvasHeight);
              ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight);

              // 导出图片
              setTimeout(() => {
                wx.canvasToTempFilePath({
                  canvas: canvas,
                  fileType: 'jpg',
                  quality: number,
                  success: function (res) {
                    console.log("压缩成功", res.tempFilePath);
                    resolve(res.tempFilePath);
                  },
                  fail: function (err) {
                    console.log("压缩失败：", err);
                    resolve(-1);
                  }
                });
              }, 100);
            };

            img.onerror = (err) => {
              console.error("图片加载失败", err);
              resolve(-1);
            }
          });
      },
      fail(err) {
        console.log("获取图片信息失败", err);
        resolve(-1);
      }
    });
  });
},

  async GIFimgcheck() {
  try {
    var imgs = this.data.imgs;
    var that = this;

    wx.showLoading({
      title: '动图审核...',
      mask: true
    });

    // 并行执行图片内容检测
    const checkPromises = imgs.map(async (filePath) => {
      const buffer = await that.qubuffer(filePath);
      return that.checkImg(buffer);
    });

    const results = await Promise.all(checkPromises);

    for (const checkOk of results) {
      if (checkOk == 87014 || checkOk == -604102) {
        // 图片检测出现问题
        return false;
      }
    }

    that.setData({
      Imgs: imgs
    });
    return true;

  } catch (err) {
    console.log("GIFimgcheck错误", err);
    return false;
  }
},

  async imgcheck() {
  // 审核图片
  try {
    var imgs = this.data.imgs;
    var tp = imgs; // 直接使用已压缩的图片
    var that = this;

    // need
    // --------经过上面过程已经压缩完毕，再整体取buffer检测
    wx.showLoading({
      title: '图片审核...',
      mask: true
    });

    // 直接使用已压缩的图片进行检测
    // 并行执行图片内容检测
    const checkPromises = imgs.map(async (filePath) => {
      const buffer = await that.qubuffer(filePath);
      return that.checkImg(buffer);
    });

    const results = await Promise.all(checkPromises);

    for (const checkOk of results) {
      if (checkOk == 87014 || checkOk == -604102) {
        // 图片检测出现问题
        return false;
      }
    }

    that.setData({
      Imgs: tp
    });
    return true;
    // --------返回结果
  } catch (err) {
    console.log("imgcheck错误", err);
    return false;
  }
},

  deleteImg: function (e) {
  var imgs = this.data.imgs;
  var index = e.currentTarget.dataset.index;
  imgs.splice(index, 1);
  this.setData({
    imgs: imgs
  });
},

  chooseImg: function (e) {
  var that = this;
  var imgs = that.data.imgs || [];
  var count = 1 - imgs.length;



  wx.chooseMedia({
    count: count, // 剩余可选数量
    mediaType: ['image'],
    sourceType: ['album', 'camera'],
    sizeType: ['compressed'],
    success: async function (res) {
      var tempFiles = res.tempFiles;
      var imgs = that.data.imgs;

      wx.showLoading({
        title: '图片处理中...',
        mask: true
      });

      // 并行处理所有图片
      const processPromises = tempFiles.map(async (file) => {
        if (imgs.length + tempFiles.length > 9) return null; // Simple check to avoid processing too many if initial imgs + new files exceed 9

        let filePath = file.tempFilePath;
        console.log("开始处理图片：", filePath);

        try {
          const imageInfo = await new Promise((resolve, reject) => {
            wx.getImageInfo({
              src: filePath,
              success: resolve,
              fail: reject
            })
          });

          if (imageInfo.type === 'gif') {
            console.log("检测到GIF，跳过压缩");
            return filePath;
          } else {
            // 非GIF图片进行压缩，质量 0.6，最大边长 800 (与post.js保持一致)
            let compressedPath = await that.yasuo(filePath, 0.6, 800);
            if (compressedPath != -1) {
              return compressedPath;
            } else {
              console.log("压缩失败，使用原图");
              return filePath;
            }
          }
        } catch (err) {
          console.error("获取图片信息失败，尝试通过扩展名判断", err);
          let ext = filePath.substring(filePath.lastIndexOf(".") + 1).toLowerCase();
          if (ext === 'gif') {
            console.log("检测到GIF (扩展名)，跳过压缩");
            return filePath;
          } else {
            let compressedPath = await that.yasuo(filePath, 0.6, 800);
            if (compressedPath != -1) {
              return compressedPath;
            }
            return filePath;
          }
        }
      });

      const processedPaths = await Promise.all(processPromises);

      // 过滤掉 null (如果有的话) 并添加到 imgs
      for (const path of processedPaths) {
        if (path && imgs.length < 9) {
          imgs.push(path);
        }
      }

      that.setData({
        imgs: imgs
      });

      wx.hideLoading();
    },
    fail(err) {
      console.error('选择评论图片失败', err);
      wx.hideLoading();
      if (!err.errMsg || !err.errMsg.includes('cancel')) {
        wx.showToast({ title: '无法选择图片，请检查相册权限', icon: 'none' });
      }
    }
  });
},

  imageOnLoad(e) {
  const index = e.currentTarget.dataset.index; // 图片索引
  const updateKey = `ss_xx.ss_xx.tp2[${index}].loaded`;
  this.setData({
    [updateKey]: true
  });
},

  imageOnLoadComment(e) {
  const index0 = e.currentTarget.dataset.index0; // 评论索引
  const index1 = e.currentTarget.dataset.index1; // 回复索引 (如果有)

  if (index1 !== undefined) {
    // 回复的图片
    const updateKey = `ss_xx.ss_xx.huifunr[${index0}].huifu[${index1}].tp2[0].loaded`;
    this.setData({
      [updateKey]: true
    });
  } else {
    // 评论的图片
    const updateKey = `ss_xx.ss_xx.huifunr[${index0}].tp2[0].loaded`;
    this.setData({
      [updateKey]: true
    });
  }
},

  previewImg: function (e) {
  // 获取当前图片的下标
  var index = e.currentTarget.dataset.tp[0];
  // 所有图片
  var imgs = e.currentTarget.dataset.tp[1];

  wx.previewImage({
    // 当前显示图片
    current: imgs[index],
    // 所有图片
    urls: imgs
  });
}
}
