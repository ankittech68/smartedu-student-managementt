const pool = require('../config/db');

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

function mapMarksRow(row) {
    if (!row) return null;
    return {
        id: row.id,
        subject: row.subject,
        marksObtained: row.marks_obtained,
        totalMarks: row.total_marks,
        grade: row.grade,
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

async function getPendingApprovals(isDemo = false) {
    const demoFlag = isDemo ? 1 : 0;
    const [attendanceRows] = await pool.execute(`
        SELECT a.*, s.first_name, s.last_name, s.email as s_email, s.username as s_username, s.user_id as s_user_id
        FROM attendance a
        JOIN students s ON a.student_id = s.id
        WHERE a.approval_status = 'PENDING' AND a.is_demo = ?
        ORDER BY a.date DESC
    `, [demoFlag]);

    const [marksRows] = await pool.execute(`
        SELECT m.*, s.first_name, s.last_name, s.email as s_email, s.username as s_username, s.user_id as s_user_id
        FROM marks m
        JOIN students s ON m.student_id = s.id
        WHERE m.approval_status = 'PENDING' AND m.is_demo = ?
        ORDER BY m.id DESC
    `, [demoFlag]);

    return {
        attendance: attendanceRows.map(mapAttendanceRow),
        marks: marksRows.map(mapMarksRow)
    };
}

async function approveAllPending(isDemo = false) {
    const demoFlag = isDemo ? 1 : 0;
    await pool.execute(`UPDATE attendance SET approval_status = 'APPROVED' WHERE approval_status = 'PENDING' AND is_demo = ?`, [demoFlag]);
    await pool.execute(`UPDATE marks SET approval_status = 'APPROVED' WHERE approval_status = 'PENDING' AND is_demo = ?`, [demoFlag]);
    return { message: 'All pending requests approved' };
}

async function rejectAllPending(isDemo = false) {
    const demoFlag = isDemo ? 1 : 0;
    await pool.execute(`UPDATE attendance SET approval_status = 'REJECTED' WHERE approval_status = 'PENDING' AND is_demo = ?`, [demoFlag]);
    await pool.execute(`UPDATE marks SET approval_status = 'REJECTED' WHERE approval_status = 'PENDING' AND is_demo = ?`, [demoFlag]);
    return { message: 'All pending requests cleared' };
}

module.exports = {
    getPendingApprovals,
    approveAllPending,
    rejectAllPending
};
