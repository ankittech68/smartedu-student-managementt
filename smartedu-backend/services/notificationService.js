const pool = require('../config/db');

async function createNotification(userId, title, message) {
    const timestamp = new Date();
    const [result] = await pool.execute(
        'INSERT INTO notifications (title, message, timestamp, is_read, user_id) VALUES (?, ?, ?, ?, ?)',
        [title, message, timestamp, false, userId]
    );
    return { id: result.insertId, title, message, timestamp, isRead: false, read: false, userId };
}

async function createNotificationForRole(role, title, message) {
    const normalizedRole = role.toUpperCase().replace(/^ROLE_/, '');
    const [users] = await pool.execute('SELECT id FROM users WHERE role = ?', [normalizedRole]);
    const timestamp = new Date();
    for (const user of users) {
        await pool.execute(
            'INSERT INTO notifications (title, message, timestamp, is_read, user_id) VALUES (?, ?, ?, ?, ?)',
            [title, message, timestamp, false, user.id]
        );
    }
}

async function getUserNotifications(userId) {
    const [rows] = await pool.execute(
        'SELECT id, title, message, timestamp, is_read AS isRead, user_id AS userId FROM notifications WHERE user_id = ? ORDER BY timestamp DESC',
        [userId]
    );
    return rows.map(r => ({
        ...r,
        isRead: Boolean(r.isRead),
        read: Boolean(r.isRead)
    }));
}

async function markAsRead(id) {
    const [rows] = await pool.execute('SELECT * FROM notifications WHERE id = ?', [id]);
    if (rows.length === 0) {
        throw new Error('Notification not found with id: ' + id);
    }
    await pool.execute('UPDATE notifications SET is_read = ? WHERE id = ?', [true, id]);
    const [updated] = await pool.execute('SELECT id, title, message, timestamp, is_read AS isRead, user_id AS userId FROM notifications WHERE id = ?', [id]);
    return {
        ...updated[0],
        isRead: Boolean(updated[0].isRead),
        read: Boolean(updated[0].isRead)
    };
}

async function markAllAsRead(userId) {
    await pool.execute('UPDATE notifications SET is_read = ? WHERE user_id = ?', [true, userId]);
    return { message: 'All notifications marked as read' };
}

module.exports = {
    createNotification,
    createNotificationForRole,
    getUserNotifications,
    markAsRead,
    markAllAsRead
};
