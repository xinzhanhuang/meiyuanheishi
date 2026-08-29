const fs = require('fs')
const path = require('path')

const root = path.resolve(__dirname, '..')
const contractPath = path.join(root, '多院校字段契约.json')
const scanRoots = ['miniprogram', 'cloudfunctions']

function filesUnder(directory) {
  if (!fs.existsSync(directory)) return []
  return fs.readdirSync(directory, { withFileTypes: true }).reduce((files, entry) => {
    if (entry.name === 'node_modules' || entry.name === 'miniprogram_npm' || entry.name === '.git') return files
    const fullPath = path.join(directory, entry.name)
    if (entry.isDirectory()) return files.concat(filesUnder(fullPath))
    return /\.(js|json|wxml|wxss)$/.test(entry.name) ? files.concat(fullPath) : files
  }, [])
}

function buildReport() {
  const contract = JSON.parse(fs.readFileSync(contractPath, 'utf8'))
  const sourceFiles = scanRoots.reduce((files, directory) => files.concat(filesUnder(path.join(root, directory))), [])
  const source = sourceFiles.map(file => fs.readFileSync(file, 'utf8')).join('\n')
  const collectionRefs = Array.from(source.matchAll(/collection\(['"]([^'"]+)['"]\)/g)).map(match => match[1])
  const collectionUsage = contract.collections.map(item => ({
    name: item.name,
    references: collectionRefs.filter(name => name === item.name).length,
    legacyFill: item.legacyFill,
    isolation: item.isolation,
    plan: item.schoolId === 'deferred'
      ? '暂缓，不生成迁移写入计划'
      : item.legacyFill === 'tjarts'
        ? '统计缺失 schoolId，生成补 tjarts 计划（本脚本不执行）'
        : '先人工确认字段语义，再生成补字段计划（本脚本不执行）'
  }))
  return {
    readOnly: true,
    databaseWrites: 0,
    runtimeDatabaseAccess: false,
    generatedAt: new Date().toISOString(),
    defaultSchoolId: contract.defaultSchoolId,
    scannedFiles: sourceFiles.map(file => path.relative(root, file)),
    schoolIdOccurrences: (source.match(/schoolId/g) || []).length,
    collectionUsage
  }
}

if (require.main === module) console.log(JSON.stringify(buildReport(), null, 2))

module.exports = { buildReport }
