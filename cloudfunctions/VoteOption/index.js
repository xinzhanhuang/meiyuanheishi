const cloud = require('wx-server-sdk')

cloud.init({
  // API 调用都保持和云函数当前所在环境一致
  env: cloud.DYNAMIC_CURRENT_ENV
})

exports.main = async (event, context) => {
  console.log(event.id)
  var id=event.id
 var itemid=event.itemid

    cloud.database().collection('VoteOption').doc(id).update({
      data:{
        'voteNumber':cloud.database().command.inc(1),
      }
    })

    cloud.database().collection('ss').doc(itemid).update({
        data:{
          'votepeopleNumber':cloud.database().command.inc(1)
        }
      })

  
}
