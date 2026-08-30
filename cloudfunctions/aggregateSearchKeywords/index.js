// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境

const db = cloud.database()
const _ = db.command
const $ = db.command.aggregate
const DEFAULT_SCHOOL_ID = 'tjarts'

// 云函数入口函数
exports.main = async (event, context) => {
    try {
        // 1. 聚合搜索日志，统计每个关键词的出现次数
        // 注意：如果数据量巨大（超过几万条），可能需要分批处理或使用更高级的MapReduce
        const result = await db.collection('searchLogs')
            .aggregate()
            .group({
                _id: '$searchText', //以此字段分组
                count: $.sum(1)     // 统计数量
            })
            .limit(10000) // 防止溢出，一次最多处理10000个唯一词
            .end()

        const list = result.list
        console.log(`找到 ${list.length} 个唯一搜索词`)

        if (list.length === 0) {
            return { msg: '没有找到搜索记录' }
        }

        // 2. 批量写入/更新 search_keywords
        // 这里的策略是：直接覆盖或更新。为简单起见，我们遍历写入。
        // 如果想要更高效，可以使用 Promise.all 并发，但要注意数据库并发限制。

        let successCount = 0
        let errorCount = 0

        // 每次处理 20 个，避免并发过高
        const BATCH_SIZE = 20;
        for (let i = 0; i < list.length; i += BATCH_SIZE) {
            const batch = list.slice(i, i + BATCH_SIZE);

            const tasks = batch.map(async (item) => {
                const keyword = item._id; // 关键词
                const count = item.count; // 次数

                if (!keyword || !keyword.trim()) return; // 跳过空关键词

                try {
                    // 检查是否存在
                    const checkRes = await db.collection('search_keywords').where({
                        keyword: keyword
                    }).get();

                    if (checkRes.data.length > 0) {
                        // 已存在，更新（这里选择保留原有 update_time 或者更新它，这里我们更新为当前时间）
                        // 注意：这里我们选择 "累加" 还是 "覆盖"？
                        // 既然是迁移，我们假设 search_keywords 是新的，所以直接 set 或 update count 都可以。
                        // 为了安全，我们用 update 设置 count
                        await db.collection('search_keywords').doc(checkRes.data[0]._id).update({
                            data: {
                                count: count, // 直接设置为统计出的总数（或者 _.inc(count) 如果你想累加）
                                update_time: new Date()
                            }
                        })
                    } else {
                        // 不存在，新增
                        await db.collection('search_keywords').add({
                            data: {
                                keyword: keyword,
                                count: count,
                                schoolId: DEFAULT_SCHOOL_ID,
                                update_time: new Date()
                            }
                        })
                    }
                    successCount++;
                } catch (err) {
                    console.error(`处理关键词 ${keyword} 失败`, err)
                    errorCount++;
                }
            });

            await Promise.all(tasks);
        }

        return {
            success: true,
            totalKeywords: list.length,
            processed: successCount,
            errors: errorCount,
            msg: '迁移完成'
        }

    } catch (err) {
        console.error(err)
        return {
            success: false,
            error: err
        }
    }
}
