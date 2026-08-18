const pool = require('../config/db');

async function getUnassignedStudents(isDemo = false) {
    const demoFlag = isDemo ? 1 : 0;
    const [rows] = await pool.execute(`
        SELECT u.id, u.username, u.email, u.role 
        FROM users u
        LEFT JOIN students s ON u.id = s.user_id
        WHERE u.role = 'STUDENT' AND s.id IS NULL AND u.is_demo = ?
    `, [demoFlag]);
    return rows;
}

async function updateUser(id, userDetails, isDemo = false) {
    const demoFlag = isDemo ? 1 : 0;
    const [users] = await pool.execute('SELECT * FROM users WHERE id = ? AND is_demo = ?', [id, demoFlag]);
    if (users.length === 0) {
        throw new Error('User not found with id: ' + id);
    }

    const username = userDetails.username || users[0].username;
    const email = userDetails.email || users[0].email;

    await pool.execute(
        'UPDATE users SET username = ?, email = ? WHERE id = ? AND is_demo = ?',
        [username, email, id, demoFlag]
    );

    // Sync corresponding student profile if present
    await pool.execute(
        'UPDATE students SET username = ?, email = ? WHERE user_id = ? AND is_demo = ?',
        [username, email, id, demoFlag]
    );

    const [updatedUsers] = await pool.execute('SELECT id, username, email, role FROM users WHERE id = ? AND is_demo = ?', [id, demoFlag]);
    return updatedUsers[0];
}

module.exports = {
    getUnassignedStudents,
    updateUser
};
