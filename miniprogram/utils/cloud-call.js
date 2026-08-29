const ERROR_MESSAGES = {
  UNAUTHENTICATED: '请先登录',
  PERMISSION_DENIED: '无权执行此操作',
  ALREADY_VOTED: '投过票啦',
  ALREADY_REPORTED: '已经举报过了',
  COMMENT_NOT_FOUND: '评论已不存在',
  REPLY_NOT_FOUND: '回复已不存在',
  USER_NOT_FOUND: '用户状态异常，请重新登录',
  SELF_POST: '自己的帖子无需马住',
  ORDER_ALREADY_TAKEN: '该派单已被接取',
  ACCOUNT_BANNED: '账号已被封禁',
  INVALID_ARGUMENT: '提交数据不完整',
  INVALID_COMMENT: '评论数据不完整',
  OPTION_MISMATCH: '投票选项已失效'
}

function errorMessage(error, fallback) {
  const result = error && error.result
  const code = result && result.errCode
  return ERROR_MESSAGES[code] || (error && error.errMsg) || fallback || '操作失败，请重试'
}

function callCloudFunction(name, data) {
  return wx.cloud.callFunction({ name, data }).then((response) => {
    const rawResult = response.result
    if (rawResult === false) {
      const error = new Error('CLOUD_FUNCTION_FAILED')
      error.requestId = response.requestID || ''
      throw error
    }
    const result = rawResult || {}
    if (result.success === false || (result.success !== true && result.errCode !== undefined && result.errCode !== 0)) {
      const error = new Error(result.errMsg || result.errCode || 'CLOUD_FUNCTION_FAILED')
      error.result = result
      error.requestId = response.requestID || result.requestId || ''
      throw error
    }
    const normalized = result.data && typeof result.data === 'object'
      ? Object.assign({}, result.data, result)
      : result
    if (!normalized.requestId && response.requestID) normalized.requestId = response.requestID
    return normalized
  })
}

module.exports = { callCloudFunction, errorMessage }
