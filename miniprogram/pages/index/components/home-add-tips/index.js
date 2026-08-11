
const STORAGE_KEY = 'ADD-MYAPP'

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    // 提示文字
    text: {
      type: String,
      value: '点击「添加小程序」防失联🙋‍♂️ '
    },
    // 多少秒后关闭
    duration: {
      type: Number,
      value: 5
    },
    top:{
      type: String,
      value: ''

    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    SHOW_TOP: false,
  
  },

  ready: function() {
    // 判断是否已经显示过
    const cache = wx.getStorageSync(STORAGE_KEY)
    console.log("sssssssss",cache)
    if (cache) return
    // 没显示过，则进行展示
    this.setData({
      SHOW_TOP: true
    })

    setTimeout(() => {
      this.setData({
        SHOW_TOP: false
      })
    }, this.data.duration * 1000)
  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 显示全屏添加说明
    showModal: function() {
      this.setData({
        SHOW_TOP: false,
     
      })
      wx.setStorage({
        key: STORAGE_KEY,
        data: +new Date()
      })
    },

   
  }

})
