const CLOUD_ENV_BY_APP_ID = {
  wx3280f3d41b172606: 'tafaheishi-1gs4bxsvcf864035',
  wx46b1315e54c4e3b6: 'cloudbase-5gz26l7717d976f6'
}

function getCloudEnvId(accountInfo) {
  const info = accountInfo || wx.getAccountInfoSync()
  const appId = info && info.miniProgram && info.miniProgram.appId
  const envId = CLOUD_ENV_BY_APP_ID[appId]
  if (!envId) throw new Error(`未配置 AppID ${appId || '未知'} 对应的云环境`)
  return envId
}

module.exports = { CLOUD_ENV_BY_APP_ID, getCloudEnvId }
