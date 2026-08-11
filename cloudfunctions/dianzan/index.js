
const cloud = require('wx-server-sdk')

cloud.init({
  // API 调用都保持和云函数当前所在环境一致
  env: cloud.DYNAMIC_CURRENT_ENV
})

exports.main = async (event, context) => {
  //console.log("@@@",event.userInfo.openId,event.id)
  var dzrid = event.dzrid
  var type = event.type
  const db = cloud.database()
  const _ = db.command
  var id = event.id
  // var index=event.plindex
  var plid = event.plid
  // Notification Data
  var name = event.name
  var photo = event.photo
  var time = event.time
  var lzid = event.lzid
  var ywnr = event.ywnr
  var pllzid = event.pllzid
  var plnr = event.plnr
  var zbtitle = event.zbtitle
  var zilei =event.zilei

  if (dzrid == null || dzrid == undefined || dzrid == "") {
    return
  }

  if (type == 'ss') {
    db.collection("ss").doc(event.id).get().then((res) => {
      var dianzanid = res.data.ss_xx.dianzanid
      var yn = dianzanid.indexOf(dzrid)
      if (yn == -1) {
        //没电
        db.collection("ss").doc(event.id).update({
          data: {
            "ss_xx.dianzanid": _.push(dzrid),
            "ss_xx.dianzannb": _.inc(1)
          }
        })

        // Notification Logic
        if (lzid && lzid != event.userInfo.openId) {
          db.collection("users").where({
            _openid: lzid
          }).update({
            data: {
              dzmessage: _.push({
                name: name,
                photo: photo,
                time: time,
                type: 'dianzan',
                ywnr: ywnr,
                id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                ssid: event.id,
                isorder: false
              })
            }
          })
        }

        // console.log("点赞了")
        return
      } else {
        db.collection("ss").doc(event.id).update({
          data: {
            //这里要移除openid
            "ss_xx.dianzanid": _.pull(dzrid.toString()),
            "ss_xx.dianzannb": _.inc(-1)
          }
        })
        console.log("取消了")
        return
      }

    })

  } else if (type == 'tianmeizhoubian') {

    return db.collection("tianmeizhoubian").doc(id).get().then((res) => {
      var dianzanid = res.data.ss_xx.dianzanid
      var yn = dianzanid.indexOf(dzrid)
      if (yn == -1) {
        //没电
        db.collection("tianmeizhoubian").doc(id).update({
          data: {
            "ss_xx.dianzanid": _.push(dzrid),
            "ss_xx.dianzannb": _.inc(1)
          }
        })

        // Notification Logic
        if (lzid && lzid != event.userInfo.openId) {
          db.collection("users").where({
            _openid: lzid
          }).update({
            data: {
              dzmessage: _.push({
                name: name,
                photo: photo,
                time: time,
                type: 'dianzan',
                zilei:zilei,
                zbtitle: zbtitle,
                id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                ssid: event.id,
                isorder: false,
                subtype: 'tianmeizhoubian' // Optional: to distinguish source
              })
            }
          })
        }

        console.log("点赞了")
        return
      } else {
        db.collection("tianmeizhoubian").doc(id).update({
          data: {
            //这里要移除openid
            "ss_xx.dianzanid": _.pull(dzrid.toString()),
            "ss_xx.dianzannb": _.inc(-1)
          }
        })
        console.log("取消了")
        return
      }

    })





  }

  if (type == 'sspinglun') {
    var collectionName = event.collection || "ss"; // PATCH: Support dynamic collection
    db.collection(collectionName).doc(id).get().then((res) => {


      var huifunr = res.data.ss_xx.huifunr

      var index = -1;
      var dianzhanID = [];

      for (var i = 0; i < huifunr.length; i++) {
        // Fallback to synthetic ID for legacy comments
        let currentPinglunID = huifunr[i].pinglunID || (id + "_" + i);
        if (currentPinglunID == plid) {
          dianzhanID = huifunr[i].dianzhanID || [];
          index = i;
          break;
        }
      }

      if (index === -1) {
        console.log("Comment not found for plid:", plid);
        return;
      }

      var yn = dianzhanID.indexOf(dzrid)

      // console.log("xxxxxxxxxxx",yn,dianzhanID)

      if (yn == -1) {
        //没d点


        db.collection(collectionName).doc(id).update({
          data: {

            [`ss_xx.huifunr.${index}.dianzhanID`]: _.push(dzrid),
            [`ss_xx.huifunr.${index}.pldianzannb`]: _.inc(1),


          }
        })

        // Notification Logic
        if (pllzid && pllzid != dzrid) {
          db.collection("users").doc(pllzid).update({
            data: {
              dzmessage: _.push({
                name: name,
                photo: photo,
                time: time,
                type: 'pldianzan',
                zilei:zilei,
                plnr: plnr,
                bhfpl: plnr,
                id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                ssid: event.id,
                isorder: false,
                subtype: collectionName == 'tianmeizhoubian' ? 'tianmeizhoubian' : ''
              })
            }
          })
        }

        console.log("点赞了zilei",zilei)
        return
      } else {

        db.collection(collectionName).doc(id).update({
          data: {
            [`ss_xx.huifunr.${index}.dianzhanID`]: _.pull(dzrid),
            [`ss_xx.huifunr.${index}.pldianzannb`]: _.inc(-1),

          }
        })
        console.log("取消了")
        return
      }

    })


  }

}
