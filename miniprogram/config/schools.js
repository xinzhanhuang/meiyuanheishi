const DEFAULT_SCHOOL_ID = 'tjarts'

const SCHOOLS = Object.freeze({
  tjarts: Object.freeze({
    id: DEFAULT_SCHOOL_ID,
    name: '天津美术学院',
    shortName: '天美',
    status: 'active'
  })
})

let schoolCatalog = SCHOOLS

function getSchools() {
  return schoolCatalog
}

function getSchool(schoolId) {
  return schoolCatalog[schoolId] || schoolCatalog[DEFAULT_SCHOOL_ID] || SCHOOLS[DEFAULT_SCHOOL_ID]
}

function normalizeSchool(record) {
  if (!record || typeof record !== 'object') return null
  const id = String(record.id || record.schoolId || record._id || '').trim()
  const name = String(record.name || '').trim()
  if (!id || !name || record.status === 'inactive') return null
  return {
    id,
    name,
    shortName: String(record.shortName || name).trim(),
    status: 'active',
    city: String(record.city || '').trim(),
    logo: String(record.logo || '').trim()
  }
}

function setSchoolCatalog(records) {
  const next = {}
  ;(Array.isArray(records) ? records : []).map(normalizeSchool).filter(Boolean).forEach(school => {
    next[school.id] = Object.freeze(school)
  })
  // 保留默认学校，避免云端配置不完整时改变当前单校体验。
  if (!next[DEFAULT_SCHOOL_ID]) next[DEFAULT_SCHOOL_ID] = SCHOOLS[DEFAULT_SCHOOL_ID]
  schoolCatalog = Object.freeze(next)
  return schoolCatalog
}

module.exports = { DEFAULT_SCHOOL_ID, SCHOOLS, getSchools, getSchool, normalizeSchool, setSchoolCatalog }
