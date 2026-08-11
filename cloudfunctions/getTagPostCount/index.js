const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

exports.main = async (event, context) => {
  const db = cloud.database()
  const _ = db.command
  const tags = event.tags || []
  
  try {
   // 统计每个标签的帖子数量
   const result = {}
    
   // 为每个标签分别统计
   for (const tag of tags) {
     // 统计总数量（不考虑举报）
     const totalCount = await db.collection('ss').where({
       'ss_xx.choosetitle': tag
     }).count()
     
     // 统计正常帖子数量（举报值<=19）
     const normalCount = await db.collection('ss').where({
       'ss_xx.choosetitle': tag,
       'ss_xx.jubao.1': _.lte(19)
     }).count()
     
     // 统计被举报的帖子数量
     const reportedCount = await db.collection('ss').where({
       'ss_xx.choosetitle': tag,
       'ss_xx.jubao.1': _.gt(19)
     }).count()
     
     result[tag] = {
       total: totalCount.total,      // 总帖子数
       normal: normalCount.total,    // 正常帖子数
       reported: reportedCount.total // 被举报帖子数
     }
   }
   
   return result
 } catch (error) {
   console.error('获取标签帖子数量失败：', error)
   return {}
 }
}