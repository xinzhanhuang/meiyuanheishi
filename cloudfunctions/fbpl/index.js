const cloud = require('wx-server-sdk')

// 初始化 cloud
cloud.init({
  // API 调用都保持和云函数当前所在环境一致
  env: cloud.DYNAMIC_CURRENT_ENV
})

/*
消息类型：
1.pinglun
2.huifu
*/
exports.main = async (event, context) => {
  console.log(event.pinglunnr)
  var pinglunnr = event.pinglunnr
  var pd = event.pd
  var Mazhu = event.Mazhu
  var liuyan = pinglunnr.liuyan
  var ku = 'ss'
  var id = event.pinglunnr.ssid
  var lzid = event.pinglunnr.lzid
  var plrid = event.pinglunnr.plrid

  var path = "pages/plate2/plate2?id=" + id + "&fenxiang=true&liuyan=" + liuyan
  const _ = cloud.database().command

  if (liuyan == true) {
    ku = 'tj',
      event.pinglunnr.ywnr = event.pinglunnr.title
  }
  if (pd[1] != "") {
    //这说明是回复评论
    console.log("回复评论：", id, pd)

    return await cloud.database().collection(ku).where({
      "_id": id,
      "ss_xx.huifunr.plrid": pd[1],
      "ss_xx.huifunr.time": pd[2]
    }).update({
      data: {
        // 添加记录
        'ss_xx.huifunr.$.huifunb': _.inc(1),
        'ss_xx.huifunr.$.huifu': _.push(event.pinglunnr),
        'ss_xx.huifunb': _.inc(1),
      }
    }).then((res) => {
      ////给自己加评论过记录
      var pinglunguode = {
        id: event.pinglunnr.ssid,
        time: event.pinglunnr.time,
        nr: event.pinglunnr.ywnr,
        plnr: event.pinglunnr.wbnr,
      }
      ////给别人发送消息(被回复者)
      //额外加个判断是否是留言
      var newmessage = {
        id: event.pinglunnr.ssid + event.pinglunnr.time,
        ssid: event.pinglunnr.ssid,
        postId: event.pinglunnr.ssid,
        postType: 'ss',
        commentId: event.pinglunnr.ssid + event.pinglunnr.time,
        source: 'message',
        type: "huifu",
        time: event.pinglunnr.time,
        bhfpl: event.pinglunnr.bhfpl,
        plnr: event.pinglunnr.wbnr,
        name: event.pinglunnr.name,
        photo: event.pinglunnr.photo,
        isorder: event.pinglunnr.isorder
      }
      if (liuyan == true) {
        newmessage.liuyan = true
      } else {
        newmessage.liuyan = false
      }
      //判断是否回复的自己
      if (event.pinglunnr.bhfid != plrid) {
        //不是回复的自己
        cloud.database().collection('users').doc(event.pinglunnr.bhfid).update({
          data: {
            message: _.push(newmessage)
          }
        }).then((res) => {
          //console.log("!!!!",res)
          if (pd[0] != true && liuyan == false) {
            //首次评论加记录（最多保留 10 条）
            cloud.database().collection('users').doc(plrid).update({
              data: {
                pinglunguode: _.push({ each: [pinglunguode], slice: -10 })
              }
            }).then((res) => {
              console.log("成功")
            })
          }
          console.log("开始检测进行回复")
          /////////////////////////////////////////////////////////////
          //1.获取待操作用户的信息
          cloud.database().collection('users').doc(event.pinglunnr.bhfid).get().then((res) => {
            //2.取到用户数据进行判断在线状态
            console.log("取到用户数据进行判断在线状态:", res.data.online)
            console.log("取到用户数据进行判断授权状态:", res.data.allow)
            console.log("取到用户数据进行判断次数剩余状态:", res.data.msgnb)
            var online = res.data.online
            var msgnb = res.data.msgnb
            var openid = res.data._openid
            if (!online) {

              if (msgnb[1] > 0) {


                //消息数据格式化
                //name 10
                //thing 20
                var name = event.pinglunnr.name
                var bhfpl = event.pinglunnr.bhfpl
                var wbnr = event.pinglunnr.wbnr

                if (name.length > 20) {
                  name = name.substr(0, 10) + "..."
                }
                if (wbnr.length > 20) {
                  wbnr = wbnr.substr(0, 17) + "..."
                }
                if (bhfpl.length > 20) {
                  bhfpl = bhfpl.substr(0, 17) + "..."
                }

                cloud.openapi.subscribeMessage.send({
                  touser: openid,
                  page: path,
                  lang: 'zh_CN',
                  data: {
                    thing17: {
                      //被回复评论
                      value: bhfpl
                    },
                    thing3: {
                      //评论人
                      value: name
                    },
                    thing8: {
                      //评论内容
                      value: wbnr
                    }
                  },
                  templateId: 'hs60e8rl8z2e_dMIRqBgT5izdt7qw_e9O3Y8xWFh9pY',

                  miniprogramState: 'formal', //正式版
                }).then((res) => {
                  console.log("发送被回复订阅：", res)
                  //还没加结果判断处理
                  //1.扣除剩余次数
                  cloud.database().collection('users').doc(event.pinglunnr.bhfid).update({
                    data: {

                      'msgnb.1': cloud.database().command.inc(-1)
                      //减去一次
                    }
                  })
                }).catch((res) => {
                  console.log("打印错误信息：", res)
                  var first = JSON.stringify(res).includes()
                  if (first) {
                    //1.剩余次数直接清零
                    cloud.database().collection('users').doc(event.pinglunnr.bhfid).update({
                      data: {

                        'msgnb.1': 0
                        //直接清零
                      }
                    })
                  }
                })


              }
            }
          })
          /////////////////////////////////////////////////////////////
          return result
        }).catch((res) => {
          return false
        })
      }
    })

  } else {


    //这是正常评论说说
    console.log("这是评论说说：", id)
    return await cloud.database().collection(ku).doc(id).update({
      data: {
        // 表示将 done 字段置为 true
        ss_xx: {
          "huifunr": _.push(event.pinglunnr),
          "huifunb": _.inc(1)
        }
      }
    }).then((res) => {
      ////给自己加评论过记录
      var pinglunguode = {
        id: event.pinglunnr.ssid,
        time: event.pinglunnr.time,
        nr: event.pinglunnr.ywnr,
        plnr: event.pinglunnr.wbnr,
      }
      ////给别人发送消息(帖子主)
      var newmessage = {
        id: event.pinglunnr.ssid + event.pinglunnr.time,
        ssid: event.pinglunnr.ssid,
        postId: event.pinglunnr.ssid,
        postType: 'ss',
        commentId: event.pinglunnr.ssid + event.pinglunnr.time,
        source: 'message',
        type: "pinglun",
        time: event.pinglunnr.time,
        ywnr: event.pinglunnr.ywnr,
        plnr: event.pinglunnr.wbnr,
        name: event.pinglunnr.name,
        photo: event.pinglunnr.photo,
        isorder: event.pinglunnr.isorder
      }
      if (liuyan == true) {
        newmessage.liuyan = true
      } else {
        newmessage.liuyan = false
      }

      if (Mazhu.length > 0) {
        newmessage.type = "Mazhupinglun"
        for (let i = 0; i < Mazhu.length; i++) {
          cloud.database().collection('users').doc(Mazhu[i]).update({
            data: {
              message: _.push(newmessage)
            }
          }).then((res) => {
            //console.log("!!!!",res)

          })

        }
      }



      //给帖子主发消息(自己不是帖子主)
      if (lzid != plrid) {
        console.log("这是给楼主发消息：", lzid)
        cloud.database().collection('users').doc(lzid).update({
          data: {
            message: _.push(newmessage)
          }
        }).then((res) => {
          //console.log("!!!!",res)
          if (pd[0] != true && liuyan == false) {
            cloud.database().collection('users').doc(plrid).update({
              data: {
                pinglunguode: _.push({ each: [pinglunguode], slice: -10 })
              }
            }).then((res) => {
              console.log("成功")
            })
          }
          console.log("开始检测进行评论")
          /////////////////////////////////////////////////////////////
          //1.获取待操作用户的信息
          cloud.database().collection('users').doc(lzid).get().then((res) => {
            //2.取到用户数据进行判断在线状态
            console.log("取到用户数据进行判断在线状态:", res.data.online)
            console.log("取到用户数据进行判断授权状态:", res.data.allow)
            console.log("取到用户数据进行判断次数剩余状态:", res.data.msgnb)
            var online = res.data.online
            var msgnb = res.data.msgnb
            var openid = res.data._openid


            if (!online) {
              console.log("不在线才可")
              if (msgnb[1] > 0) {
                //可推送回复消息
                ///////////时间
                //消息数据格式化
                //name 10
                //thing 20
                var name = event.pinglunnr.name
                var ywnr = event.pinglunnr.ywnr
                var wbnr = event.pinglunnr.wbnr

                if (name.length > 20) {
                  name = name.substr(0, 10) + "..."
                }
                if (ywnr.length > 20) {
                  ywnr = ywnr.substr(0, 17) + "..."
                }
                if (wbnr.length > 20) {
                  wbnr = wbnr.substr(0, 17) + "..."
                }


                console.log("推送评论消息")


                cloud.openapi.subscribeMessage.send({
                  touser: openid,
                  page: path,
                  lang: 'zh_CN',
                  data: {
                    thing17: {
                      //评论人
                      value: ywnr
                    },
                    thing3: {
                      //评论内容
                      value: name
                    },
                    thing8: {
                      //评论内容
                      value: wbnr
                    }
                  },
                  templateId: 'hs60e8rl8z2e_dMIRqBgT5izdt7qw_e9O3Y8xWFh9pY',

                  miniprogramState: 'formal', //正式版
                }).then((res) => {
                  console.log("发送被回复订阅：", res)
                  //还没加结果判断处理
                  //1.扣除剩余次数
                  cloud.database().collection('users').doc(lzid).update({
                    data: {

                      'msgnb.1': cloud.database().command.inc(-1)
                      //减去一次
                    }
                  })
                }).catch((res) => {
                  console.log("打印错误信息：", res)
                  var first = JSON.stringify(res).includes()
                  if (first) {
                    //1.剩余次数直接清零
                    cloud.database().collection('users').doc(lzid).update({
                      data: {

                        'msgnb.1': 0
                        //直接清零
                      }
                    })
                  }
                })

              }


            }


          })
          /////////////////////////////////////////////////////////////
          return true
        }).catch((res) => {
          return false
        })
      }
    })
  }



}
