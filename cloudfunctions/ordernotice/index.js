const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
})
exports.main = async (event, context) => {

  try {
    const result = await cloud.database().collection('users').doc(event.lzid).get().then((res) => {
      //2.取到用户数据进行判断在线状态
      //  console.log("取到用户数据进行判断在线状态:", res.data.online)
      //  console.log("取到用户数据进行判断授权状态:", res.data.allow)
      //  console.log("取到用户数据进行判断次数剩余状态:", res.data.msgnb)
      var online = res.data.online
      var msgnb = res.data.msgnb

      // Push in-app message
      const message = {
        type: 'takeorder',
        photo: event.takeorderphoto,
        name: event.takeordername,
        time: new Date().getTime(),
        isorder: true,
        plnr: '🎉请及时联系：'+event.takeorderphone,
        ywnr: event.ordertitle,
        ssid: event.orderid,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        liuyan: event.liuyan
      };

      cloud.database().collection('users').doc(event.lzid).update({
        data: {
          message: cloud.database().command.push(message)
        }
      });



      if (!online) {
        console.log("不在线才可")
        if (msgnb[0] > 0) {


          var lzopenid = event.lzopenid
          var takeorderphone = event.takeorderphone
          var takeordername = event.takeordername
          var orderid = event.orderid
          var ordertitle = event.ordertitle
          var liuyan = event.liuyan
          var path = "pages/plate2/plate2?id=" + orderid + "&fenxiang=true&liuyan=" + liuyan

          /////////////时间
          var timestamp = Date.parse(new Date());
          timestamp = timestamp / 1000;
          console.log("当前时间戳为：" + timestamp);

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
          //  var s = date.getSeconds();

          var time = Y + "年" + M + "月" + D + "日"


          if (ordertitle.length > 20) {
            ordertitle = ordertitle.substr(0, 17) + "..."
          }
          if (takeordername.length > 20) {
            takeordername = takeordername.substr(0, 17) + "..."
          }


          cloud.openapi.subscribeMessage.send({
            touser: lzopenid,
            page: path,
            lang: 'zh_CN',
            data: {
              thing1: {
                //派单类型
                value: ordertitle
              },
              thing6: {
                //接单人
                value: takeordername
              },
              phone_number5: {
                //接单手机
                value: takeorderphone
              },
              time2: {
                //接单时间
                value: time
              }
            },
            templateId: 'ZVDufG3eOY6D9c9JOJe_81ADKqBGf0-TVuALiqUTd58',
            miniprogramState: 'formal', //正式版
          }).then((res) => {
            console.log("发送被回复订阅：", res)
            //还没加结果判断处理
            //1.扣除剩余次数
            cloud.database().collection('users').doc(event.lzid).update({
              data: {

                'msgnb.0': cloud.database().command.inc(-1)
                //减去一次
              }
            })
          }).catch((res) => {
            console.log("打印错误信息：", res)
            var first = JSON.stringify(res).includes()
            if (first) {
              //1.剩余次数直接清零
              cloud.database().collection('users').doc(event.lzid).update({
                data: {

                  'msgnb.0': 0
                  //直接清零
                }
              })
            }
          })



          return result

        }
      }



    })

  } catch (err) {
    return err
  }




}