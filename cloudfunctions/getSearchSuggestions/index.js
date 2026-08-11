// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境

const db = cloud.database()
const _ = db.command
const $ = db.command.aggregate

// 云函数入口函数
exports.main = async (event, context) => {
    const keyword = event.keyword || ''

    if (!keyword.trim()) {
        return { list: [] }
    }

    try {
        // 聚合查询 searchLogs
        const result = await db.collection('searchLogs')
            .aggregate()
            // 1. 筛选：只查找以 keyword 开头的记录 (不区分大小写 - 需看DB是否支持正则，聚合暂不支持$match正则，这里做折中)
            // 注意：由于小程序云开发聚合操作对 match 正则支持有限，且性能考虑，
            // 如果数据量大，直接 match 正则可能慢。
            // 为简单起见，且通常 searchText 是准确的，我们先用简单 match。
            // 更兼容的方式是：先 match 正则 (效率低) 或 match 全等 (无法模糊)。
            // 鉴于 '1' -> '12', 这是一个前缀匹配。
            // 云开发聚合 $match 支持正则。
            .match({
                searchText: db.RegExp({
                    regexp: '^' + keyword, // Strict prefix match
                    options: 'i' // Case insensitive
                })
            })
            // 2. 分组：按 searchText 分组并计数
            .group({
                _id: '$searchText',
                count: $.sum(1),
                latestTime: $.max('$timestamp')
            })
            // 3. 排序：按数量降序
            .sort({
                count: -1, // Most popular first
                latestTime: -1 // Tie-breaker: most recent
            })
            // 4. 限制：只取前 5 个
            .limit(5) // Limit to top 5
            .end()

        // 格式化输出为前端需要的格式 { keyword: 'xxx', count: 10 }
        const list = result.list.map(item => ({
            keyword: item._id,
            count: item.count
        }))

        return {
            list,
            msg: 'success'
        }

    } catch (err) {
        console.error(err)
        return {
            list: [],
            error: err
        }
    }
}
