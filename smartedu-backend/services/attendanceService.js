const pool = require('../config/db');
const notificationService = require('./notificationService');

function mapAttendanceRow(row) {
    if (!row) return null;
    return {
        id: row.id,
        date: row.date ? row.date.toISOString().split('T')[0] : null,
        status: row.status,
        approvalStatus: row.approval_status,
        student: {
            id: row.student_id,
            firstName: row.first_name,
            lastName: row.last_name,
            email: row.s_email,
            username: row.s_username,
            userId: row.s_user_id
        }
    };
}

async function getAttendanceById(id) {
    const [rows] = await pool.execute(`
        SELECT a.*, s.first_name, s.last_name, s.email as s_email, s.username as s_username, s.user_id as s_user_id
        FROM attendance a
        JOIN students s ON a.student_id = s.id
        WHERE a.id = ?
    `, [id]);
    if (rows.length === 0) {
        throw new Error('Attendance not found with id: ' + id);
    }
    return mapAttendanceRow(rows[0]);
}

async function markAttendance(attendanceData) {
    const studentId = attendanceData.studentId || attendanceData.student?.id;
    if (!studentId) {
        throw new Error('Student ID is required');
    }

    const date = attendanceData.date;
    const status = attendanceData.status;
    const approvalStatus = 'PENDING';

    const [result] = await pool.execute(
        'INSERT INTO attendance (date, status, approval_status, student_id) VALUES (?, ?, ?, ?)',
        [date, status, approvalStatus, studentId]
    );

    await notificationService.createNotificationForRole(
        'ADMIN',
        'Pending Attendance',
        'New attendance record pending approval.'
    );

    return getAttendanceById(result.insertId);
}

async function getAttendanceByStudent(studentId) {
    const [rows] = await pool.execute(`
        SELECT a.*, s.first_name, s.last_name, s.email as s_email, s.username as s_username, s.user_id as s_user_id
        FROM attendance a
        JOIN students s ON a.student_id = s.id
        WHERE a.student_id = ?
        ORDER BY a.date DESC
    `, [studentId]);
    return rows.map(mapAttendanceRow);
}

async function getApprovedAttendanceByStudent(studentId) {
    const [rows] = await pool.execute(`
        SELECT a.*, s.first_name, s.last_name, s.email as s_email, s.username as s_username, s.user_id as s_user_id
        FROM attendance a
        JOIN students s ON a.student_id = s.id
        WHERE a.student_id = ? AND a.approval_status = 'APPROVED'
        ORDER BY a.date DESC
    `, [studentId]);
    return rows.map(mapAttendanceRow);
}

async function getAllAttendance() {
    const [rows] = await pool.execute(`
        SELECT a.*, s.first_name, s.last_name, s.email as s_email, s.username as s_username, s.user_id as s_user_id
        FROM attendance a
        JOIN students s ON a.student_id = s.id
        ORDER BY a.date DESC
    `);
    return rows.map(mapAttendanceRow);
}

async function updateAttendance(id, attendanceDetails) {
    await getAttendanceById(id);

    const date = attendanceDetails.date;
    const status = attendanceDetails.status;
    const approvalStatus = 'PENDING';

    await pool.execute(
        'UPDATE attendance SET date = ?, status = ?, approval_status = ? WHERE id = ?',
        [date, status, approvalStatus, id]
    );

    await notificationService.createNotificationForRole(
        'ADMIN',
        'Pending Attendance',
        'Attendance record updated and pending approval.'
    );

    return getAttendanceById(id);
}

async function updateApprovalStatus(id, status) {
    const attendance = await getAttendanceById(id);

    await pool.execute(
        'UPDATE attendance SET approval_status = ? WHERE id = ?',
        [status, id]
    );

    const updated = await getAttendanceById(id);

    if (updated.student && updated.student.userId) {
        await notificationService.createNotification(
            updated.student.userId,
            `Attendance ${status}`,
            `Your attendance for ${updated.date} was ${status}`
        );
    }

    return updated;
}

async function deleteAttendance(id) {
    await getAttendanceById(id);
    await pool.execute('DELETE FROM attendance WHERE id = ?', [id]);
}

module.exports = {
    markAttendance,
    getAttendanceByStudent,
    getApprovedAttendanceByStudent,
    getAllAttendance,
    updateAttendance,
    updateApprovalStatus,
    deleteAttendance
};
