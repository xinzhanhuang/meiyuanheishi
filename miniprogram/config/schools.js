const DEFAULT_SCHOOL_ID = 'tjarts'

const SCHOOLS = Object.freeze({
  tjarts: Object.freeze({
    id: DEFAULT_SCHOOL_ID,
    name: '天津美术学院',
    shortName: '天美',
    status: 'active'
  })
})

function getSchool(schoolId) {
  return SCHOOLS[schoolId] || SCHOOLS[DEFAULT_SCHOOL_ID]
}

module.exports = { DEFAULT_SCHOOL_ID, SCHOOLS, getSchool }
