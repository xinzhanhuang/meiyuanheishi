const { DEFAULT_SCHOOL_ID, SCHOOLS, normalizeSchool, setSchoolCatalog } = require('../config/schools')

function localFallback(reason, error) {
  return {
    schools: SCHOOLS,
    currentSchoolId: DEFAULT_SCHOOL_ID,
    source: 'local',
    reason: reason || 'cloud-unavailable',
    error: error || null
  }
}

function getDatabase() {
  if (typeof wx === 'undefined' || !wx.cloud || typeof wx.cloud.database !== 'function') return null
  try {
    return wx.cloud.database()
  } catch (error) {
    return null
  }
}

function loadSchoolCatalog() {
  const db = getDatabase()
  if (!db) return Promise.resolve(localFallback('cloud-unavailable'))
  let request
  try {
    request = db.collection('schools').where({ status: 'active' }).get()
  } catch (error) {
    return Promise.resolve(localFallback('cloud-read-failed', error))
  }
  return Promise.resolve(request).then(result => {
    const records = (result && Array.isArray(result.data) ? result.data : []).map(normalizeSchool).filter(Boolean)
    if (!records.length) return localFallback('empty-or-invalid-cloud-config')
    return {
      schools: setSchoolCatalog(records),
      currentSchoolId: DEFAULT_SCHOOL_ID,
      source: 'cloud',
      reason: ''
    }
  }).catch(error => localFallback('cloud-read-failed', error))
}

module.exports = { loadSchoolCatalog, localFallback }
