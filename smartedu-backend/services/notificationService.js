const pool = require('../config/db');

async function createNotification(userId, title, message, isDemo = false) {
    const demoFlag = isDemo ? 1 : 0;
    const timestamp = new Date();
    const [result] = await pool.execute(
        'INSERT INTO notifications (title, message, timestamp, is_read, user_id, is_demo) VALUES (?, ?, ?, ?, ?, ?)',
        [title, message, timestamp, false, userId, demoFlag]
    );
    return { id: result.insertId, title, message, timestamp, isRead: false, read: false, userId };
}

async function createNotificationForRole(role, title, message, isDemo = false) {
    const demoFlag = isDemo ? 1 : 0;
    const normalizedRole = role.toUpperCase().replace(/^ROLE_/, '');
    const [users] = await pool.execute('SELECT id FROM users WHERE role = ? AND is_demo = ?', [normalizedRole, demoFlag]);
    const timestamp = new Date();
    for (const user of users) {
        await pool.execute(
            'INSERT INTO notifications (title, message, timestamp, is_read, user_id, is_demo) VALUES (?, ?, ?, ?, ?, ?)',
            [title, message, timestamp, false, user.id, demoFlag]
        );
    }
}

async function getUserNotifications(userId, isDemo = false) {
    const demoFlag = isDemo ? 1 : 0;
    const [rows] = await pool.execute(
        'SELECT id, title, message, timestamp, is_read AS isRead, user_id AS userId FROM notifications WHERE user_id = ? AND is_demo = ? ORDER BY timestamp DESC',
        [userId, demoFlag]
    );
    return rows.map(r => ({
        ...r,
        isRead: Boolean(r.isRead),
        read: Boolean(r.isRead)
    }));
}

async function markAsRead(id, isDemo = false) {
    const demoFlag = isDemo ? 1 : 0;
    const [rows] = await pool.execute('SELECT * FROM notifications WHERE id = ? AND is_demo = ?', [id, demoFlag]);
    if (rows.length === 0) {
        throw new Error('Notification not found with id: ' + id);
    }
    await pool.execute('UPDATE notifications SET is_read = ? WHERE id = ? AND is_demo = ?', [true, id, demoFlag]);
    const [updated] = await pool.execute('SELECT id, title, message, timestamp, is_read AS isRead, user_id AS userId FROM notifications WHERE id = ? AND is_demo = ?', [id, demoFlag]);
    return {
        ...updated[0],
        isRead: Boolean(updated[0].isRead),
        read: Boolean(updated[0].isRead)
    };
}

async function markAllAsRead(userId, isDemo = false) {
    const demoFlag = isDemo ? 1 : 0;
    await pool.execute('UPDATE notifications SET is_read = ? WHERE user_id = ? AND is_demo = ?', [true, userId, demoFlag]);
    return { message: 'All notifications marked as read' };
}

module.exports = {
    createNotification,
    createNotificationForRole,
    getUserNotifications,
    markAsRead,
    markAllAsRead
};
