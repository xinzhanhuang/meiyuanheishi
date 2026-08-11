
Page({

    data: {
  
    },
  
    onLoad: function (options) {
      console.log(options)
      console.log(options.title)

      var title=  decodeURIComponent(options.title)

      console.log(title)

this.setData({

  title:title
})

  
    },
  

  
  })