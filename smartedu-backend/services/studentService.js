const pool = require('../config/db');

function mapStudentRow(row) {
    if (!row) return null;
    return {
        id: row.id,
        firstName: row.first_name,
        lastName: row.last_name,
        dateOfBirth: row.date_of_birth ? row.date_of_birth.toISOString().split('T')[0] : null,
        enrollmentDate: row.enrollment_date ? row.enrollment_date.toISOString().split('T')[0] : null,
        phone: row.phone,
        address: row.address,
        userId: row.user_id,
        email: row.email,
        username: row.username,
        user: row.user_id ? {
            id: row.user_id,
            username: row.u_username || row.username,
            email: row.u_email || row.email,
            role: row.u_role
        } : null
    };
}

async function saveStudent(studentData, isDemo = false) {
    const demoFlag = isDemo ? 1 : 0;
    let rawUserId = studentData.user?.id || studentData.userId || null;
    let userId = (rawUserId && String(rawUserId).trim() !== '') ? rawUserId : null;

    let rawEmail = studentData.email || null;
    let email = (rawEmail && String(rawEmail).trim() !== '') ? rawEmail : null;

    let rawUsername = studentData.username || null;
    let username = (rawUsername && String(rawUsername).trim() !== '') ? rawUsername : null;

    let matchedUser = null;
    if (userId) {
        const [users] = await pool.execute('SELECT * FROM users WHERE id = ? AND is_demo = ?', [userId, demoFlag]);
        if (users.length > 0) matchedUser = users[0];
    }
    if (!matchedUser && email) {
        const [users] = await pool.execute('SELECT * FROM users WHERE LOWER(email) = LOWER(?) AND is_demo = ?', [email, demoFlag]);
        if (users.length > 0) matchedUser = users[0];
    }
    if (!matchedUser && username) {
        const [users] = await pool.execute('SELECT * FROM users WHERE LOWER(username) = LOWER(?) AND is_demo = ?', [username, demoFlag]);
        if (users.length > 0) matchedUser = users[0];
    }

    if (matchedUser) {
        userId = matchedUser.id;
        email = matchedUser.email;
        username = matchedUser.username;
    }

    const firstName = studentData.firstName;
    const lastName = studentData.lastName;

    const rawDob = studentData.dateOfBirth;
    const dateOfBirth = (rawDob && String(rawDob).trim() !== '') ? rawDob : null;

    const rawEnroll = studentData.enrollmentDate;
    const enrollmentDate = (rawEnroll && String(rawEnroll).trim() !== '') ? rawEnroll : new Date().toISOString().split('T')[0];

    const rawPhone = studentData.phone;
    const phone = (rawPhone && String(rawPhone).trim() !== '') ? rawPhone : null;

    const rawAddress = studentData.address;
    const address = (rawAddress && String(rawAddress).trim() !== '') ? rawAddress : null;

    const [result] = await pool.execute(
        `INSERT INTO students (first_name, last_name, date_of_birth, enrollment_date, phone, address, user_id, email, username, is_demo)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [firstName, lastName, dateOfBirth, enrollmentDate, phone, address, userId, email, username, demoFlag]
    );

    return getStudentById(result.insertId, isDemo);
}

async function getAllStudents(isDemo = false) {
    const demoFlag = isDemo ? 1 : 0;
    const [rows] = await pool.execute(`
        SELECT s.*, u.username as u_username, u.email as u_email, u.role as u_role
        FROM students s
        LEFT JOIN users u ON s.user_id = u.id
        WHERE s.is_demo = ?
        ORDER BY s.id ASC
    `, [demoFlag]);
    return rows.map(mapStudentRow);
}

async function getStudentById(id, isDemo = false) {
    const demoFlag = isDemo ? 1 : 0;
    const [rows] = await pool.execute(`
        SELECT s.*, u.username as u_username, u.email as u_email, u.role as u_role
        FROM students s
        LEFT JOIN users u ON s.user_id = u.id
        WHERE s.id = ? AND s.is_demo = ?
    `, [id, demoFlag]);

    if (rows.length === 0) {
        throw new Error('Student not found with id: ' + id);
    }
    return mapStudentRow(rows[0]);
}

async function getStudentByUserId(userId, isDemo = false) {
    const demoFlag = isDemo ? 1 : 0;
    const [users] = await pool.execute('SELECT * FROM users WHERE id = ? AND is_demo = ?', [userId, demoFlag]);
    if (users.length === 0) {
        throw new Error('User not found with id: ' + userId);
    }
    const user = users[0];

    // 1. Check by user_id
    let [students] = await pool.execute(`
        SELECT s.*, u.username as u_username, u.email as u_email, u.role as u_role
        FROM students s
        LEFT JOIN users u ON s.user_id = u.id
        WHERE s.user_id = ? AND s.is_demo = ?
    `, [userId, demoFlag]);

    // 2. Check by email
    if (students.length === 0 && user.email) {
        [students] = await pool.execute(`
            SELECT s.*, u.username as u_username, u.email as u_email, u.role as u_role
            FROM students s
            LEFT JOIN users u ON s.user_id = u.id
            WHERE LOWER(s.email) = LOWER(?) AND s.is_demo = ?
        `, [user.email, demoFlag]);
    }

    // 3. Check by username
    if (students.length === 0 && user.username) {
        [students] = await pool.execute(`
            SELECT s.*, u.username as u_username, u.email as u_email, u.role as u_role
            FROM students s
            LEFT JOIN users u ON s.user_id = u.id
            WHERE LOWER(s.username) = LOWER(?) AND s.is_demo = ?
        `, [user.username, demoFlag]);
    }

    // If matched by email/username but user_id was null, link them
    if (students.length > 0 && !students[0].user_id) {
        await pool.execute('UPDATE students SET user_id = ? WHERE id = ? AND is_demo = ?', [userId, students[0].id, demoFlag]);
        return getStudentById(students[0].id, isDemo);
    }

    // If still missing and user's role is STUDENT, auto-create profile
    const normalizedRole = user.role.toUpperCase().replace(/^ROLE_/, '');
    if (students.length === 0 && normalizedRole === 'STUDENT') {
        const newStudent = await saveStudent({
            firstName: user.username,
            lastName: 'Student',
            enrollmentDate: new Date().toISOString().split('T')[0],
            email: user.email,
            username: user.username,
            userId: user.id
        }, isDemo);
        return newStudent;
    }

    if (students.length === 0) {
        throw new Error('Student profile not found for user id: ' + userId);
    }

    return mapStudentRow(students[0]);
}

async function updateStudent(id, studentDetails, isDemo = false) {
    const existing = await getStudentById(id, isDemo);
    const demoFlag = isDemo ? 1 : 0;

    const firstName = studentDetails.firstName !== undefined ? studentDetails.firstName : existing.firstName;
    const lastName = studentDetails.lastName !== undefined ? studentDetails.lastName : existing.lastName;

    const rawDob = studentDetails.dateOfBirth !== undefined ? studentDetails.dateOfBirth : existing.dateOfBirth;
    const dateOfBirth = (rawDob && String(rawDob).trim() !== '') ? rawDob : null;

    const rawEnroll = studentDetails.enrollmentDate !== undefined ? studentDetails.enrollmentDate : existing.enrollmentDate;
    const enrollmentDate = (rawEnroll && String(rawEnroll).trim() !== '') ? rawEnroll : existing.enrollmentDate;

    const rawPhone = studentDetails.phone !== undefined ? studentDetails.phone : existing.phone;
    const phone = (rawPhone && String(rawPhone).trim() !== '') ? rawPhone : null;

    const rawAddress = studentDetails.address !== undefined ? studentDetails.address : existing.address;
    const address = (rawAddress && String(rawAddress).trim() !== '') ? rawAddress : null;

    await pool.execute(
        `UPDATE students 
         SET first_name = ?, last_name = ?, date_of_birth = ?, enrollment_date = ?, phone = ?, address = ?
         WHERE id = ? AND is_demo = ?`,
        [firstName, lastName, dateOfBirth, enrollmentDate, phone, address, id, demoFlag]
    );

    return getStudentById(id, isDemo);
}

async function deleteStudent(id, isDemo = false) {
    await getStudentById(id, isDemo); // Ensure exists within user's scope
    const demoFlag = isDemo ? 1 : 0;
    await pool.execute('DELETE FROM students WHERE id = ? AND is_demo = ?', [id, demoFlag]);
}

module.exports = {
    saveStudent,
    getAllStudents,
    getStudentById,
    getStudentByUserId,
    updateStudent,
    deleteStudent
};
