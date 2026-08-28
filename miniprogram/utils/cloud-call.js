const ERROR_MESSAGES = {
  UNAUTHENTICATED: '请先登录',
  PERMISSION_DENIED: '无权执行此操作',
  ALREADY_VOTED: '投过票啦',
  ALREADY_REPORTED: '已经举报过了',
  COMMENT_NOT_FOUND: '评论已不存在',
  REPLY_NOT_FOUND: '回复已不存在',
  USER_NOT_FOUND: '用户状态异常，请重新登录',
  SELF_POST: '自己的帖子无需马住'
}

function errorMessage(error, fallback) {
  const result = error && error.result
  const code = result && result.errCode
  return ERROR_MESSAGES[code] || (error && error.errMsg) || fallback || '操作失败，请重试'
}

function callCloudFunction(name, data) {
  return wx.cloud.callFunction({ name, data }).then((response) => {
    const result = response.result || {}
    if (result.success === false || (typeof result.errCode === 'number' && result.errCode < 0)) {
      const error = new Error(result.errMsg || result.errCode || 'CLOUD_FUNCTION_FAILED')
      error.result = result
      throw error
    }
    return result
  })
}

module.exports = { callCloudFunction, errorMessage }
