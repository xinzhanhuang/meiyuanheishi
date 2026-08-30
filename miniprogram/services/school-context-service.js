const {
  DEFAULT_SCHOOL_ID,
  SCHOOLS,
  getSchools,
  getSchool
} = require('../config/schools')
const { loadSchoolCatalog } = require('./school-service')

// These names are reserved for future school-scoped caches. Existing user/session
// storage (badgeCount, pendingPostTarget, user, token) is intentionally untouched.
const SCHOOL_CACHE_FIELDS = ['zuiress_xx1', 'zilei', 'schoolHomeCache', 'schoolListCache']
const SCHOOL_CACHE_KEYS = ['schoolHomeCache', 'schoolListCache', 'homeCache', 'postListCache']
const listeners = new WeakMap()
const refreshes = new WeakMap()

function wxApi() {
  return typeof wx === 'undefined' ? null : wx
}

function readStoredSchoolId() {
  const api = wxApi()
  if (!api || typeof api.getStorageSync !== 'function') return DEFAULT_SCHOOL_ID
  try {
    return api.getStorageSync('currentSchoolId') || DEFAULT_SCHOOL_ID
  } catch (error) {
    return DEFAULT_SCHOOL_ID
  }
}

function writeStoredSchoolId(schoolId) {
  const api = wxApi()
  if (!api || typeof api.setStorageSync !== 'function') return
  try {
    api.setStorageSync('currentSchoolId', schoolId)
  } catch (error) {
    console.warn('保存学校上下文失败', error)
  }
}

function get(app) {
  const current = app && app.currentSchool
  if (current && current.id) return current
  return getSchool(app && app.currentSchoolId || readStoredSchoolId())
}

function list(app) {
  return app && app.schools && typeof app.schools === 'object' ? app.schools : getSchools()
}

function clearCaches(app) {
  if (app && typeof app === 'object') {
    SCHOOL_CACHE_FIELDS.forEach(field => {
      if (Object.prototype.hasOwnProperty.call(app, field)) app[field] = null
    })
    if (app.globalData && typeof app.globalData === 'object') {
      SCHOOL_CACHE_FIELDS.forEach(field => {
        if (Object.prototype.hasOwnProperty.call(app.globalData, field)) app.globalData[field] = null
      })
    }
  }
  const api = wxApi()
  if (!api || typeof api.removeStorageSync !== 'function') return
  SCHOOL_CACHE_KEYS.forEach(key => {
    try { api.removeStorageSync(key) } catch (error) { console.warn('清理学校缓存失败', key, error) }
  })
}

function contextSnapshot(app, reason) {
  const school = get(app)
  return {
    school,
    schoolId: school.id,
    schools: list(app),
    reason: reason || ''
  }
}

function notify(app, reason) {
  const subscribers = listeners.get(app)
  if (!subscribers || !subscribers.size) return
  const snapshot = contextSnapshot(app, reason)
  subscribers.forEach(listener => {
    try { listener(snapshot) } catch (error) { console.warn('学校上下文订阅回调失败', error) }
  })
}

function set(app, schoolId, options = {}) {
  if (!app || typeof app !== 'object') return get(null)
  const previous = get(app)
  const catalog = list(app)
  const requestedId = String(schoolId || '').trim()
  // 分享路由可能早于云端学校目录返回；先保留目标 ID，刷新后再解析完整配置。
  const pending = requestedId && !catalog[requestedId] && app.schoolConfigReady !== true
    ? { id: requestedId, name: requestedId, shortName: requestedId, status: 'pending' }
    : null
  const selected = catalog[requestedId] || pending || catalog[DEFAULT_SCHOOL_ID] || getSchool(DEFAULT_SCHOOL_ID)
  app.currentSchool = selected
  app.currentSchoolId = selected.id
  writeStoredSchoolId(selected.id)

  if (previous.id !== selected.id) {
    if (options.clearCache !== false) clearCaches(app)
    notify(app, options.reason || 'set')
  }
  return selected
}

function refresh(app) {
  if (!app || typeof app !== 'object') return Promise.resolve({ schools: SCHOOLS, currentSchoolId: DEFAULT_SCHOOL_ID, source: 'local' })
  if (refreshes.has(app)) return refreshes.get(app)
  const promise = loadSchoolCatalog().then(result => {
    app.schools = result.schools || getSchools()
    const school = set(app, readStoredSchoolId(), { reason: 'refresh' })
    app.schoolConfigReady = true
    return Object.assign({}, result, { currentSchoolId: school.id })
  }).catch(error => {
    console.warn('学校配置加载失败，继续使用本地默认配置', error)
    app.schools = SCHOOLS
    const school = set(app, DEFAULT_SCHOOL_ID, { reason: 'refresh-fallback' })
    app.schoolConfigReady = true
    return { schools: app.schools, currentSchoolId: school.id, source: 'local', reason: 'app-refresh-failed', error }
  }).finally(() => refreshes.delete(app))
  refreshes.set(app, promise)
  return promise
}

function subscribe(app, listener) {
  if (!app || typeof listener !== 'function') return () => {}
  if (!listeners.has(app)) listeners.set(app, new Set())
  const subscribers = listeners.get(app)
  subscribers.add(listener)
  try { listener(contextSnapshot(app, 'subscribe')) } catch (error) { console.warn('学校上下文订阅回调失败', error) }
  return () => subscribers.delete(listener)
}

module.exports = { get, list, set, refresh, subscribe, clearCaches, SCHOOL_CACHE_FIELDS, SCHOOL_CACHE_KEYS }
