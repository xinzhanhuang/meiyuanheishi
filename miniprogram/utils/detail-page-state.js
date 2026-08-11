function markPostImageLoaded(page, index) {
  page.setData({
    [`ss_xx.ss_xx.tp2[${index}].loaded`]: true
  });
}

function markCommentImageLoaded(page, index0, index1) {
  const updateKey = index1 !== undefined
    ? `ss_xx.ss_xx.huifunr[${index0}].huifu[${index1}].tp2[0].loaded`
    : `ss_xx.ss_xx.huifunr[${index0}].tp2[0].loaded`;

  page.setData({ [updateKey]: true });
}

function setChatListHeight(page, globalData) {
  page.setData({
    chatListHeight: globalData.sysHeight - globalData.statsuBarHeight - page.data.headHeight - page.data.keyboardHeight - page.data.inutPanelHeight
  });
}

module.exports = { markPostImageLoaded, markCommentImageLoaded, setChatListHeight };
