const cloud = require('wx-server-sdk')

cloud.init({
    env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database()

async function isAdmin(openid) {
    const userResult = await db.collection('users').where({ _openid: openid }).limit(1).get()
    const user = userResult.data[0]
    if (!user) return false
    const systemResult = await db.collection('system').doc('system01').get()
    const ids = systemResult.data && systemResult.data.system && systemResult.data.system.glids
    return Array.isArray(ids) && ids.includes(user._id)
}

exports.main = async (event = {}, context) => {
    const { id, status, reason } = event

    if (!await isAdmin(cloud.getWXContext().OPENID)) {
        return { errCode: -3, errMsg: 'Permission denied' };
    }

    if (!id || ![1, 2].includes(status)) {
        return { errCode: -1, errMsg: 'Invalid id or status' };
    }

    try {
        // 1. Get the post to find the author
        const postRes = await db.collection('tianmeizhoubian').doc(id).get();
        const post = postRes.data;
        const authorId = post.ss_xx.lzid; // or use _openid if lzid isn't reliable, but lzid is usually user doc id

        // 2. Update Post Status
        const updateRes = await db.collection('tianmeizhoubian').doc(id).update({
            data: {
                'ss_xx.checked': status
            }
        });

        // 3. If Rejected (status === 2), send notification
        if (status === 2 && authorId) {
            const notification = {
                id: Date.now().toString(), // Unique ID for message
                ssid: id, // Related Post ID
                postId: id,
                postType: 'zhoubian',
                source: 'message',
                type: 'reject', // Message Type
                name: '系统通知', // Sender Name
                photo: '/images/icon/system_notice.png', // System Icon (Fallback or specific)
                time: new Date().getTime(),
                plnr: reason || '无理由', // Reason as content
                ywnr: post.ss_xx.nr || '您的发布', // Snippet of original post
                isorder: false
            };

            await db.collection("users").doc(authorId).update({
                data: {
                    message: db.command.push(notification)
                }
            });
        }

        return { stats: updateRes.stats, notificationSent: status === 2 };
    } catch (e) {
        console.error(e)
        return { errCode: -2, errMsg: e.errMsg };
    }
}
