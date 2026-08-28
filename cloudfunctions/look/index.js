const cloud = require('wx-server-sdk')

cloud.init({
  // API 调用都保持和云函数当前所在环境一致
  env: cloud.DYNAMIC_CURRENT_ENV
})

exports.main = async (event, context) => {
  const id = event && event.id
  const type = event && event.type
  const targets = {
    ss: {
      collection: 'ss',
      field: 'ss_xx.look',
      increment: event.num == 1 ? 1 : 6
    },
    tianmeizhoubian: {
      collection: 'tianmeizhoubian',
      field: 'ss_xx.zoubianlook',
      increment: 7
    },
    tj: {
      collection: 'tj',
      field: 'look',
      increment: 1
    }
  }

  if (event && event.action === 'incrementDownload') {
    if (typeof id !== 'string' || !id.trim()) {
      return { success: false, errCode: 'INVALID_ID', errMsg: 'Missing post id' }
    }
    const result = await cloud.database().collection('tianmeizhoubian').doc(id).update({
      data: { 'ss_xx.downloads': cloud.database().command.inc(1) }
    })
    return { success: true, action: event.action, stats: result.stats }
  }

  if (typeof id !== 'string' || !id.trim()) {
    return { success: false, errCode: 'INVALID_ID', errMsg: 'Missing post id' }
  }
  if (!targets[type]) {
    return { success: false, errCode: 'INVALID_TYPE', errMsg: 'Unsupported post type' }
  }

  const target = targets[type]
  const updateResult = await cloud.database().collection(target.collection).doc(id).update({
    data: {
      [target.field]: cloud.database().command.inc(target.increment)
    }
  })

  return {
    success: true,
    type,
    increment: target.increment,
    stats: updateResult.stats
  }
}
