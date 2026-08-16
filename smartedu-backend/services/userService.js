const pool = require('../config/db');

async function getUnassignedStudents() {
    const [rows] = await pool.execute(`
        SELECT u.id, u.username, u.email, u.role 
        FROM users u
        LEFT JOIN students s ON u.id = s.user_id
        WHERE u.role = 'STUDENT' AND s.id IS NULL
    `);
    return rows;
}

async function updateUser(id, userDetails) {
    const [users] = await pool.execute('SELECT * FROM users WHERE id = ?', [id]);
    if (users.length === 0) {
        throw new Error('User not found with id: ' + id);
    }

    const username = userDetails.username || users[0].username;
    const email = userDetails.email || users[0].email;

    await pool.execute(
        'UPDATE users SET username = ?, email = ? WHERE id = ?',
        [username, email, id]
    );

    // Sync corresponding student profile if present
    await pool.execute(
        'UPDATE students SET username = ?, email = ? WHERE user_id = ?',
        [username, email, id]
    );

    const [updatedUsers] = await pool.execute('SELECT id, username, email, role FROM users WHERE id = ?', [id]);
    return updatedUsers[0];
}

module.exports = {
    getUnassignedStudents,
    updateUser
};
