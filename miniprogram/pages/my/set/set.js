var db = wx.cloud.database()
var app = getApp()
// let rewardedVideoAd = null
// var caozuo=0
const defaultAvatarUrl = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'
const DEPARTMENT_OPTIONS = ['请选择学院', '造型艺术学院', '设计艺术学院', '中国画学院', '实验艺术学院', '人工智能学院', '影视与传媒学院', '环境建筑艺术学院', '国际艺术教育学院', '艺术与人文学院', '造型基础教育学院', '美术教育学院', '其他']
const GRADE_OPTIONS = ['请选择年级', '2026级', '2025级', '2024级', '2023级', '2022级', '2021级', '2020级', '2019级', '2018级', '2017级', '2016级', '2015级', '古董']
const DEPARTMENT_GRADE_MAP = DEPARTMENT_OPTIONS.map(() => GRADE_OPTIONS)
const QUIZ_QUESTION_BANK = [
  {
    id: 'q1',
    title: '天美有几个校区？',
    options: [
      { value: 'A', label: '1' },
      { value: 'B', label: '2' },
      { value: 'C', label: '3' },
      { value: 'D', label: '4' }
    ],
    answer: 'B'
  },
  {
    id: 'q2',
    title: '现任院长是谁？',
    options: [
      { value: 'A', label: '范迪安' },
      { value: 'B', label: '贾广健' },
      { value: 'C', label: '邓国源' },
      { value: 'D', label: '邱志杰' }
    ],
    answer: 'D'
  },
  {
    id: 'q3',
    title: '宿舍到学校上课的距离？',
    options: [
      { value: 'A', label: '较远 需公交车' },
      { value: 'B', label: '一般 共享单车' },
      { value: 'C', label: '很近 步行即可' },
      { value: 'D', label: '很远 乘坐地铁' }
    ],
    answer: 'C'
  },
  {
    id: 'q4',
    title: '对天美描述正确的是？',
    options: [
      { value: 'A', label: '职业类学校' },
      { value: 'B', label: '八大美院之一' },
      { value: 'C', label: '艺术类大专' },
      { value: 'D', label: '十大艺校之一' }
    ],
    answer: 'B'
  },
  {
    id: 'q5',
    title: '南院附近没有哪一个？',
    options: [
      { value: 'A', label: '天津之眼' },
      { value: 'B', label: '艺术街区' },
      { value: 'C', label: '798艺术区' },
      { value: 'D', label: '麦当劳' }
    ],
    answer: 'C'
  },
  {
    id: 'q6',
    title: '北院附近没有哪一个？',
    options: [
      { value: 'A', label: '购物商场' },
      { value: 'B', label: '肯德基' },
      { value: 'C', label: '天津美术馆' },
      { value: 'D', label: '地铁站' }
    ],
    answer: 'C'
  },
  {
    id: 'q7',
    title: '哪个不是天美的学院？',
    options: [
      { value: 'A', label: '人工智能' },
      { value: 'B', label: '实验艺术' },
      { value: 'C', label: '环境艺术' },
      { value: 'D', label: '数据传播' }
    ],
    answer: 'D'
  },
  {
    id: 'q8',
    title: '天美有哪个体育设施？',
    options: [
      { value: 'A', label: '健身房' },
      { value: 'B', label: '壁球场' },
      { value: 'C', label: '游泳馆' },
      { value: 'D', label: '网球场' }
    ],
    answer: 'D'
  },
  {
    id: 'q9',
    title: '天美的全称是？',
    options: [
      { value: 'A', label: '天津美术学院' },
      { value: 'B', label: '天津美术职校' },
      { value: 'C', label: '天津艺术大学' },
      { value: 'D', label: '天津美术学校' }
    ],
    answer: 'A'
  },
  {
    id: 'q10',
    title: '天美校区的描述正确的是？',
    options: [
      { value: 'A', label: '很大、很广阔' },
      { value: 'B', label: '很新、很科技、很艺术' },
      { value: 'C', label: '很小、很旧' },
      { value: 'D', label: '很先锋、很实验' }
    ],
    answer: 'C'
  },
  {
    id: 'q11',
    title: '天美的学费',
    options: [
      { value: 'A', label: '3000-5000' },
      { value: 'B', label: '8500' },
      { value: 'C', label: '10000以上' },
      { value: 'D', label: '免费' }
    ],
    answer: 'C'
  },
  {
    id: 'q12',
    title: '天纬路是哪个校区？',
    options: [
      { value: 'A', label: '南院' },
      { value: 'B', label: '北院' },
      { value: 'C', label: '西院' },
      { value: 'D', label: '东院' }
    ],
    answer: 'A'
  },
  {
    id: 'q13',
    title: '志成道是哪个校区？',
    options: [
      { value: 'A', label: '南院' },
      { value: 'B', label: '北院' },
      { value: 'C', label: '西院' },
      { value: 'D', label: '东院' }
    ],
    answer: 'B'
  }
]

var data = {}
Page({

  data: {
    avatarUrl: defaultAvatarUrl,
    tx: "",
    nm: "",
    gender: "性别",
    phone: "",
    nickname: "",
    ss_xxid: "",
    about: {},
    istrue: false,
    showDialog: false,
    groups: [],
    isFirstRegistration: false,
    quizQuestions: [],
    quizAnswers: {},
    multiArray: [DEPARTMENT_OPTIONS.slice(), GRADE_OPTIONS.slice()],
    multiIndex: [0, 0],
    gradeOptionsByDepartment: DEPARTMENT_GRADE_MAP
  },
  //更新微信头像与昵称

  onChooseAvatar(e) {
    const { avatarUrl } = e.detail
    this.setData({
      avatarUrl

    })


    var that = this;
    wx.cloud.uploadFile({
      cloudPath: "userphoto/" + (new Date()).valueOf() + '.png', // 文件名
      filePath: this.data.avatarUrl, // 文件路径
      success: res => {
        // get resource ID
        console.log(res.fileID)
        // 赋值图片
        that.setData({
          tx: res.fileID

        })

        that.upload(res.fileID);
      },

      fail: err => {
        // handle error
      }
    })

  },

  ////////////////头像上传云端
  upload(filepath) {
    // console.log(filepath)
    wx.cloud.callFunction({ name: 'updateMyProfile', data: { avatar: filepath } }).then(res => {
      wx.showToast({
        title: '添加成功',
        icon: 'success',
        duration: 2000
      })
    })
    app.userInfo.userinfo.userphoto = filepath
    console.log("hahhahahh", filepath)
  },


  //授权手机号
  getPhoneNumber(e) {
    var s = this;
    //此处获取手机号授权，通过云调用取回手机号
    //getPhoneNumber:fail user deny
    //getPhoneNumber:ok
    //
    if (e.detail.errMsg == "getPhoneNumber:fail user deny") {
      wx.showToast({
        title: '您取消了授权',
        icon: "none",
      })
    } else if (e.detail.errMsg == "getPhoneNumber:ok") {
      //这是授权了：
      wx.showLoading({
        title: '处理中...',
        mask: true
      })
      console.log(e.detail.cloudID)
      wx.cloud.callFunction({
        name: 'getphone',
        data: {
          id: e.detail.cloudID
        }
      }).then((res) => {
        //console.log("取回：",res)
        if (res.errMsg == "cloud.callFunction:ok") {
          var phone = res.result.list[0].data.phoneNumber
          // console.log(">>>",phone,"<<<")

          wx.cloud.callFunction({ name: 'updateMyProfile', data: { phone: phone } }).then(() => {
            // 更新 app.userInfo
            app.userInfo.phone = phone
            this.setData({
              phone: phone
            })

            wx.hideLoading({})
            wx.showToast({
              title: '绑定成功！',
              icon: "none",
              duration: 1000
            })
          })
        } else {
          wx.hideLoading({})
          wx.showToast({
            title: '获取号码错误',
            icon: "none",
          })
        }
      })
    } else {
      wx.hideLoading({})
      wx.showToast({
        title: '授权手机错误',
        icon: "none",
      })
    }
  },

  onLoad(options) {
    var nm = app.userInfo.userinfo.username
    var gender = options.gender
    var phone = options.phone
    var name = options.name
    // 确保 ss_xxid 有明确的值，避免 undefined
    var ss_xxid = options.ss_xxid ? options.ss_xxid : "nothing"

    console.log('lllll', gender)

    if (gender == 0) {
      wx.showToast({
        title: '填写性别',
        icon: 'none',
        duration: 1000
      })
    } else if (phone == 0) {
      wx.showToast({
        title: '联系电话',
        icon: 'none',
        duration: 1000
      })
    } else if (name == 0) {
      wx.showToast({
        title: '昵称',
        icon: 'none',
        duration: 1000
      })
    }


    this.setData({
      nm: nm,
      gender: gender,
      ss_xxid: ss_xxid
    })

    // 检查用户是否已完成注册，没有完成注册说明是新用户需要答题
    this.checkRegistrationStatus()

    db.collection('system').where({ '_id': 'system01' })
      .get().then((res) => {
        //console.log(res)
        app.system1 = res.data[0]
        this.setData({
          about: res.data[0].system.about
        })

      })

  },

  onShow() {
    if (app.userInfo && app.userInfo._id) {
      this.checkRegistrationStatus()
    }
  },

  // 检查用户是否已完成注册，没有完成注册说明是新用户需要答题
  checkRegistrationStatus() {
    db.collection('users').doc(app.userInfo._id).get()
      .then(res => {
        console.log('获取用户信息成功', res)
        const userData = res.data
        // 检查是否有 registrationCompleted 字段，没有该字段说明是新用户需要答题
        const hasCompletedRegistration = !!(userData.registrationCompleted === true)

        // 没有完成注册说明是新用户，需要答题
        const isFirstRegistration = !hasCompletedRegistration

        this.setData({
          phone: userData.phone || '',
          tx: userData.userinfo ? userData.userinfo.userphoto : '',
          nickname: userData.userinfo ? userData.userinfo.username : '',
          gender: userData.userinfo ? userData.userinfo.gender : '性别',
          isFirstRegistration: isFirstRegistration
        })

        // Initialize picker index if major exists
        if (userData.userinfo && Array.isArray(userData.userinfo.zhuanye)) {
          const savedMajor = userData.userinfo.zhuanye;
          const departmentIndex = DEPARTMENT_OPTIONS.indexOf(savedMajor[0]);
          const gradeIndex = GRADE_OPTIONS.indexOf(savedMajor[1]);

          if (departmentIndex !== -1 && gradeIndex !== -1) {
            this.setData({
              multiIndex: [departmentIndex, gradeIndex]
            })
          }
        }

        if (isFirstRegistration) {
          // 新用户需要答题
          this.setupFirstRegistrationQuiz()
        } else {
          // 老用户不需要答题
          this.setData({
            quizQuestions: [],
            quizAnswers: {}
          })
        }
      }).catch(err => {
        console.error('获取用户信息失败', err)
        // 如果获取失败，默认当作新用户处理
        this.setData({
          isFirstRegistration: true,
          phone: '',
          tx: '',
          nickname: '',
          gender: '性别'
        })
        this.setupFirstRegistrationQuiz()
      })
  },


  setupFirstRegistrationQuiz() {
    const quizQuestions = this.getRandomQuizQuestions(3)
    this.setData({
      quizQuestions,
      quizAnswers: {}
    })
  },

  getRandomQuizQuestions(count) {
    const size = count || 3
    const pool = QUIZ_QUESTION_BANK.slice()
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      const temp = pool[i]
      pool[i] = pool[j]
      pool[j] = temp
    }
    return pool.slice(0, size)
  },

  onSelectQuizOption(e) {
    const { questionId } = e.currentTarget.dataset
    const value = e.detail.value
    if (!questionId) {
      return
    }
    this.setData({
      [`quizAnswers.${questionId}`]: value
    })
  },

  validateFirstRegistrationQuiz() {
    if (!this.data.isFirstRegistration) {
      return true
    }
    const quizQuestions = this.data.quizQuestions || []
    const quizAnswers = this.data.quizAnswers || {}
    const allAnswered = quizQuestions.every(item => quizAnswers[item.id])
    if (!allAnswered) {
      wx.showToast({
        icon: 'none',
        title: '请先完成全部题目',
        duration: 2000
      })
      return false
    }
    const hasWrong = quizQuestions.some(item => quizAnswers[item.id] !== item.answer)
    if (hasWrong) {
      wx.showToast({
        icon: 'none',
        title: '回答错误，已返回上一页',
        duration: 1500
      })
      setTimeout(() => {
        wx.navigateBack({
          delta: 1
        })
      }, 800)
      return false
    }
    return true
  },

  getSelectedMajor() {
    const { multiArray, multiIndex } = this.data
    const primary = (multiArray[0] || [])[multiIndex[0]] || ''
    const secondary = (multiArray[1] || [])[multiIndex[1]] || ''
    return [primary, secondary]
  },


  getNickname(e) {
    var nickname = e.detail.value
    this.setData({
      nickname
    })
    console.log("ssssss", nickname)
  },





  //提交修改
  tijiao(e) {

    let that = this;
    //校检手机
    let phone = that.data.phone;
    if (!phone) {
      wx.showToast({
        title: '请先获取您的电话',
        icon: 'none',
        duration: 2000
      });
      return false
    }
    app.userInfo.phone = that.data.phone
    app.userInfo.userinfo.username = that.data.nickname
    app.userInfo.userinfo.gender = that.data.gender

    let gender = that.data.gender;
    let nickname = that.data.nickname;
    console.log("1111111", this.data.nickname)

    //校检昵称
    if (!nickname || nickname.trim() == "" || nickname == "微信用户" || nickname == "请点击选择昵称") {
      wx.showToast({
        title: '请填写有效昵称',
        icon: 'none',
        duration: 2000
      });
      return false;
    }

    //校检性别
    if (!gender || gender == "请选择性别" || gender == "性别") {

      wx.showToast({
        title: '请选择性别',
        icon: 'none',
        duration: 2000
      });
      return false;

    }


    var userInfo = app.userInfo.userinfo.userphoto;
    if (userInfo == "https://thirdwx.qlogo.cn/mmopen/vi_32/POgEwh4mIHO4nibH0KlMECNjjGxQUq24ZEaGT4poC6icRiccVGKSyXwibcPq4BWmiaIGuG1icwxaQX6grC9VemZoJ8rg/132") {
      wx.showToast({
        icon: 'none',
        title: '请选择头像',
      });
      return false;
    }
    if (!this.validateFirstRegistrationQuiz()) {
      return false
    }

    wx.showLoading({
      title: '正在提交',
    })

    //所有内容都不为空，才提交数据
    // 确保 ss_xxid 有明确的值，避免 undefined
    var ss_xxid = this.data.ss_xxid ? this.data.ss_xxid : "nothing"

    var zhuanye = this.getSelectedMajor()

    // 校检专业
    if (zhuanye[0] === '请选择学院' || zhuanye[1] === '请选择年级') {
      wx.showToast({
        title: '请选择学院和年级',
        icon: 'none',
        duration: 2000
      });
      return false;
    }

    app.zhuanye = zhuanye

    console.log("hahhahahhappss_xxid", ss_xxid)

    // 构建更新数据
    var updateData = {
      'userinfo.username': nickname,
      'userinfo.zhuanye': zhuanye,
      'userinfo.gender': gender
    }

    // 如果是首次注册，提交成功后设置 registrationCompleted 字段
    if (this.data.isFirstRegistration) {
      updateData.registrationCompleted = true
    }

    wx.cloud.callFunction({
      name: 'updateMyProfile',
      data: { profile: { username: nickname, zhuanye: zhuanye, gender: gender, registrationCompleted: this.data.isFirstRegistration } }
    }).then(res => {
      // 如果提交成功且是首次注册，更新本地状态
      if (this.data.isFirstRegistration) {
        this.setData({
          isFirstRegistration: false,
          quizQuestions: [],
          quizAnswers: {}
        })
        app.userInfo.registrationCompleted = true
      }

      wx.showToast({
        title: '更新成功',
      })
    })

    if (app.fenxiang == "ture") {
      // console.log("sssss1",app.fenxiang)
      app.fenxiang = "false"
      wx.navigateTo({
        url: "/pages/plate2/plate2?id=" + app.fxssid + "&fenxiang=false"
      })
    } else if (app.zhoubianfenxiang == "true") {
      // console.log("sssss2",app.fenxiang)
      app.zhoubianfenxiang = "false"
      wx.navigateTo({
        url: "/pages/plate-zhoubian/plate-zhoubian?id=" + app.fxssid + "&zhoubianfenxiang=false"
      })
    } else if (ss_xxid != "nothing") {
      console.log("sssss3", ss_xxid)
      wx.navigateTo({
        url: "/pages/plate2/plate2?id=" + ss_xxid
      })
    }
    else {
      wx.switchTab({

        url: '/pages/index/index'

      });


    }

  },



  //选择性别 (Open ActionSheet)
  genderchoose1() {
    this.setData({
      showDialog: true,
      groups: [
        { text: '女生 ', value: '女生♀' },
        { text: '男生 ', value: '男生♂' },
        { text: '女生⚢', value: '女生⚢' },
        { text: '男生⚣', value: '男生⚣' }
      ]
    });
  },

  // ActionSheet Item Click
  btnClick(e) {
    const { value } = e.detail;
    if (value) {
      this.setData({
        gender: value,
        showDialog: false
      });
    } else {
      this.closeDialog();
    }
  },

  //关闭弹窗
  closeDialog: function () {
    this.setData({
      showDialog: false,
      istrue: false
    })
  },





  PickerChange(e) {
    this.setData({
      multiIndex: e.detail.value
    })
  },

  PickerColumnChange(e) {
    const { column, value } = e.detail
    if (column !== 0) {
      return
    }
    const secondColumnOptions = this.data.gradeOptionsByDepartment[value] || GRADE_OPTIONS
    this.setData({
      'multiArray[1]': secondColumnOptions,
      'multiIndex[0]': value,
      'multiIndex[1]': 0
    })
  },




})
