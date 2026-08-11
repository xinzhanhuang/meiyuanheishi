function previewImage(event) {
  const imageData = event.currentTarget.dataset.tp;
  const index = imageData[0];
  const images = imageData[1];

  wx.previewImage({
    current: images[index],
    urls: images
  });
}

function setCommentExpanded(page, index, expanded) {
  page.setData({
    [`ss_xx.ss_xx.huifunr[${index}].zhankai`]: expanded
  });
}

function setInputFocus(page, focused) {
  page.setData({
    isKeyboardOpen: focused,
    focus: focused
  });
}

module.exports = { previewImage, setCommentExpanded, setInputFocus };
