
const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
})
exports.main = async (event, context) => {



    ///////////时间
    var timestamp = Date.parse(new Date());
    timestamp = timestamp / 1000;
    // console.log("当前时间戳为：" + timestamp);
 
//获取当前时间
    var n = timestamp * 1000;
    var date = new Date(n);
    //年
    var Y = date.getFullYear();
    //月
    var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1);
    //日
    var D = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
    //时
    var h = date.getHours();
    //分
    var m = date.getMinutes();
    //秒
    var s = date.getSeconds();
  
    console.log("当前时间：" +Y+M+D+h+":"+m+":"+s);
var time=Y+"/"+M+"/"+D+"-"+h+":"+m+":"+s

    var lzopenid=event.lzopenid
    var noticetype=event.noticetype
    
     
    if(noticetype!=1){
      var wbnr=event.wbnr
      var username=event.username
      var id=event.id
      var path="pages/plate2/plate2?id="+id+"&fenxiang=true"
    var glids=JSON.parse(decodeURIComponent(event.glids))


for(var i=0;i<glids.length;i++){
  
    cloud.openapi.uniformMessage.send({
        "touser": glids[i],
        
         mp_template_msg: {
              appid: 'wx7f35c8e296de76cf',
              url: 'http://weixin.qq.com/download',
              miniprogram: {
                appid: 'wx3280f3d41b172606',
                path: path
              },
              data: {
                "first": {
                    "value": "用户："+username,
                    "color": '#173177'
                  },
                  "keyword1": {
                    "value": wbnr,
                    "color": '#173177'
                  },
                  "keyword2": {
                    "value": time,
                    "color": '#173177'
                  },
                  "keyword3": {
                    "value": "待审核",
                    "color": '#173177'
                  },
                  
                  "remark": {
                    "value": '违规发帖用户，管理员可封帖',
                    "color": '#B6B9BA'
                  },
              },
              template_id: 'dG3toKiiIiGr3hLy3lrbC5XVqvouq_UDiXe5BAG4H0c'
            }
      })

    }
  }


  try {
    const result = await cloud.openapi.uniformMessage.send({
        "touser": lzopenid,
        
         mp_template_msg: {
              appid: 'wx7f35c8e296de76cf',
              url: 'http://weixin.qq.com/download',
              miniprogram: {
                appid: 'wx3280f3d41b172606',
                path: path
              },
              data: {
                "first": {
                    "value": '✉️✉️✉️',
                    "color": '#173177'
                  },
                  "keyword1": {
                    "value": "用户：",
                    "color": '#B6B9BA'
                  },
                  "keyword2": {
                    "value": "➡️",
                    "color": '#173177'
                  },
                  "keyword3": {
                    "value": "➡️待回复|",
                    "color": '#173177'
                  },
                  "keyword4": {
                    "value": "time",
                    "color": '#B6B9BA'
                  },
                  "remark": {
                    "value": '投稿、发通告联系助手哈',
                    "color": '#B6B9BA'
                  },
              },
              template_id: 'QWvEv_GhJmYB2jnBE7TIyBh4B0p0x3XtwmghjhjkjI'
            }
      })
    return result
  } catch (result) {
    return result
  }
} 

