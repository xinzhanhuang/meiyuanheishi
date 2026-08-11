const cloud = require('wx-server-sdk')

cloud.init({
  // API 调用都保持和云函数当前所在环境一致
  env: cloud.DYNAMIC_CURRENT_ENV
})

exports.main = async (event, context) => {
  console.log(event.id)
  var id=event.id
  var type=event.type
  var num=event.num
  if(type=='ss'){

    if(num==1){
      var num1=1
    }else{
      var num1=6
    }

    cloud.database().collection('ss').doc(id).update({
      data:{
        'ss_xx.look':cloud.database().command.inc(num1)
      }
    })
    
  }else if(type=='tianmeizhoubian'){

    cloud.database().collection('tianmeizhoubian').doc(id).update({
        data:{
          'ss_xx.zoubianlook':cloud.database().command.inc(7)
        }
      })

  } else{
    cloud.database().collection('tj').doc(id).update({
      data:{
        'look':cloud.database().command.inc(1)
      }
    })
  }
  
}
