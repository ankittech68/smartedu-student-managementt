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

async function getAttendanceById(id, isDemo = false) {
    const demoFlag = isDemo ? 1 : 0;
    const [rows] = await pool.execute(`
        SELECT a.*, s.first_name, s.last_name, s.email as s_email, s.username as s_username, s.user_id as s_user_id
        FROM attendance a
        JOIN students s ON a.student_id = s.id
        WHERE a.id = ? AND a.is_demo = ?
    `, [id, demoFlag]);
    if (rows.length === 0) {
        throw new Error('Attendance not found with id: ' + id);
    }
    return mapAttendanceRow(rows[0]);
}

async function markAttendance(attendanceData, isDemo = false) {
    const demoFlag = isDemo ? 1 : 0;
    const studentId = attendanceData.studentId || attendanceData.student?.id;
    if (!studentId) {
        throw new Error('Student ID is required');
    }

    const date = attendanceData.date;
    const status = attendanceData.status;
    const approvalStatus = 'PENDING';

    const [result] = await pool.execute(
        'INSERT INTO attendance (date, status, approval_status, student_id, is_demo) VALUES (?, ?, ?, ?, ?)',
        [date, status, approvalStatus, studentId, demoFlag]
    );

    await notificationService.createNotificationForRole(
        'ADMIN',
        'Pending Attendance',
        'New attendance record pending approval.',
        isDemo
    );

    return getAttendanceById(result.insertId, isDemo);
}

async function getAttendanceByStudent(studentId, isDemo = false) {
    const demoFlag = isDemo ? 1 : 0;
    const [rows] = await pool.execute(`
        SELECT a.*, s.first_name, s.last_name, s.email as s_email, s.username as s_username, s.user_id as s_user_id
        FROM attendance a
        JOIN students s ON a.student_id = s.id
        WHERE a.student_id = ? AND a.is_demo = ?
        ORDER BY a.date DESC
    `, [studentId, demoFlag]);
    return rows.map(mapAttendanceRow);
}

async function getApprovedAttendanceByStudent(studentId, isDemo = false) {
    const demoFlag = isDemo ? 1 : 0;
    const [rows] = await pool.execute(`
        SELECT a.*, s.first_name, s.last_name, s.email as s_email, s.username as s_username, s.user_id as s_user_id
        FROM attendance a
        JOIN students s ON a.student_id = s.id
        WHERE a.student_id = ? AND a.approval_status = 'APPROVED' AND a.is_demo = ?
        ORDER BY a.date DESC
    `, [studentId, demoFlag]);
    return rows.map(mapAttendanceRow);
}

async function getAllAttendance(isDemo = false) {
    const demoFlag = isDemo ? 1 : 0;
    const [rows] = await pool.execute(`
        SELECT a.*, s.first_name, s.last_name, s.email as s_email, s.username as s_username, s.user_id as s_user_id
        FROM attendance a
        JOIN students s ON a.student_id = s.id
        WHERE a.is_demo = ?
        ORDER BY a.date DESC
    `, [demoFlag]);
    return rows.map(mapAttendanceRow);
}

async function updateAttendance(id, attendanceDetails, isDemo = false) {
    await getAttendanceById(id, isDemo);
    const demoFlag = isDemo ? 1 : 0;

    const date = attendanceDetails.date;
    const status = attendanceDetails.status;
    const approvalStatus = 'PENDING';

    await pool.execute(
        'UPDATE attendance SET date = ?, status = ?, approval_status = ? WHERE id = ? AND is_demo = ?',
        [date, status, approvalStatus, id, demoFlag]
    );

    await notificationService.createNotificationForRole(
        'ADMIN',
        'Pending Attendance',
        'Attendance record updated and pending approval.',
        isDemo
    );

    return getAttendanceById(id, isDemo);
}

async function updateApprovalStatus(id, status, isDemo = false) {
    const attendance = await getAttendanceById(id, isDemo);
    const demoFlag = isDemo ? 1 : 0;

    await pool.execute(
        'UPDATE attendance SET approval_status = ? WHERE id = ? AND is_demo = ?',
        [status, id, demoFlag]
    );

    const updated = await getAttendanceById(id, isDemo);

    if (updated.student && updated.student.userId) {
        await notificationService.createNotification(
            updated.student.userId,
            `Attendance ${status}`,
            `Your attendance for ${updated.date} was ${status}`,
            isDemo
        );
    }

    return updated;
}

async function deleteAttendance(id, isDemo = false) {
    await getAttendanceById(id, isDemo);
    const demoFlag = isDemo ? 1 : 0;
    await pool.execute('DELETE FROM attendance WHERE id = ? AND is_demo = ?', [id, demoFlag]);
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
