const { callCloudFunction } = require('../utils/cloud-call')
const commentService = require('./comment-service')

const db = wx.cloud.database()

function getPost(collection, postId) {
  if (!postId) return Promise.resolve(null)
  return db.collection(collection).doc(postId).get().then(result => result.data || null)
}

function getPendingPosts(limit = 20) {
  return db.collection('ss').where({ 'ss_xx.sstype': true }).orderBy('time', 'desc').limit(limit).get()
    .then(result => result.data || [])
}

function incrementView(postId, postType) {
  return callCloudFunction('look', { id: postId, type: postType, num: 1 })
}

function incrementDownload(postId) {
  return callCloudFunction('look', { action: 'incrementDownload', id: postId })
}

function managePost(action, data) {
  return callCloudFunction('delete', Object.assign({ action }, data))
}

function reportPost(data) {
  const app = getApp()
  return callCloudFunction('jubao', Object.assign({ schoolId: app.getCurrentSchoolId() }, data))
}

function moderatePost(data) {
  const app = getApp()
  return callCloudFunction('jubaoplus', Object.assign({ schoolId: app.getCurrentSchoolId() }, data))
}

function bookmarkPost(postId) {
  return callCloudFunction('dianzan', { type: 'mazhu', id: postId })
}

function toggleLike(data) {
  const app = getApp()
  return callCloudFunction('dianzan', Object.assign({ type: 'ss', schoolId: app.getCurrentSchoolId() }, data))
}

function takeOrder(data) {
  const app = getApp()
  return callCloudFunction('ordernotice', Object.assign({ schoolId: app.getCurrentSchoolId() }, data))
}

function publishPost(data) {
  const app = getApp()
  return callCloudFunction('publishPost', Object.assign({ schoolId: app.getCurrentSchoolId() }, data))
}

function buildPublishRecord({ form, pageData, userInfo }) {
  const user = userInfo.userinfo
  return {
    choosetitle: pageData.choosetitle111,
    firsttime: new Date().getTime(),
    username: user.username,
    zhuanye: user.zhuanye,
    gender: user.gender,
    userphoto: user.userphoto,
    nr: form.wbnr,
    orderdetail: {
      takeorder: false,
      takeorderid: "",
      takeordername: "",
      takeorderphone: "",
      openlocationtitle: pageData.openlocationtitle,
      ordertitle: form.ordertitle,
      jg: form.jg,
      starPOINT: form.starPOINT,
      endPOINT: form.endPOINT,
      lianxi: form.lianxi,
      weixin: form.weixin
    },
    tp: [],
    huifunr: [],
    huifunb: 0,
    dianzanid: [],
    Mazhu: [],
    dianzannb: 0,
    jubao: [[], 0],
    look: 0,
    lzid: userInfo._id
  }
}

function readFile(filePath) {
  return new Promise((resolve, reject) => {
    wx.getFileSystemManager().readFile({ filePath, success: res => resolve(res.data), fail: reject })
  })
}

function reviewText(text) {
  return commentService.checkText(text).catch(error => {
    // checkText 的业务拒绝仍由发帖页显示“文字审核失败”，网络错误交给页面显示网络提示。
    if (error && error.result && error.result.errCode !== undefined) return false
    throw error
  })
}

async function reviewImages(filePaths, enabled) {
  if (!enabled) return true
  const results = await Promise.all(filePaths.map(filePath =>
    readFile(filePath).then(media => commentService.checkImage(media))
  ))
  return !results.some(code => code == 87014 || code == -604102)
}

function uploadImages(filePaths, { userId, format }) {
  return Promise.all(filePaths.map((filePath, index) => new Promise((resolve, reject) => {
    const time = new Date().getTime()
    const cloudPath = `ss_img1/${userId}-${time}-${index}.${format}`
    wx.cloud.uploadFile({
      cloudPath,
      filePath,
      success: res => resolve(res.fileID),
      fail: reject
    })
  })))
}

module.exports = {
  getPost,
  getPendingPosts,
  incrementView,
  incrementDownload,
  managePost,
  reportPost,
  moderatePost,
  bookmarkPost,
  toggleLike,
  takeOrder,
  publishPost,
  buildPublishRecord,
  reviewText,
  reviewImages,
  uploadImages
}
