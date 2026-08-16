const pool = require('../config/db');
const notificationService = require('./notificationService');

function calculateGrade(marksObtained, totalMarks) {
    if (!totalMarks || totalMarks <= 0) return 'F';
    const percentage = (marksObtained / totalMarks) * 100;
    if (percentage >= 90) return 'O';
    if (percentage >= 80) return 'A+';
    if (percentage >= 70) return 'A';
    if (percentage >= 60) return 'B+';
    if (percentage >= 50) return 'B';
    if (percentage >= 40) return 'C';
    if (percentage >= 33) return 'D';
    return 'F';
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

async function getMarksById(id) {
    const [rows] = await pool.execute(`
        SELECT m.*, s.first_name, s.last_name, s.email as s_email, s.username as s_username, s.user_id as s_user_id
        FROM marks m
        JOIN students s ON m.student_id = s.id
        WHERE m.id = ?
    `, [id]);
    if (rows.length === 0) {
        throw new Error('Marks record not found with id: ' + id);
    }
    return mapMarksRow(rows[0]);
}

async function addMarks(marksData) {
    const studentId = marksData.studentId || marksData.student?.id;
    if (!studentId) {
        throw new Error('Student ID is required');
    }

    const subject = marksData.subject;
    const marksObtained = parseFloat(marksData.marksObtained);
    const totalMarks = parseFloat(marksData.totalMarks);
    const grade = calculateGrade(marksObtained, totalMarks);
    const approvalStatus = 'PENDING';

    const [result] = await pool.execute(
        'INSERT INTO marks (subject, marks_obtained, total_marks, grade, approval_status, student_id) VALUES (?, ?, ?, ?, ?, ?)',
        [subject, marksObtained, totalMarks, grade, approvalStatus, studentId]
    );

    await notificationService.createNotificationForRole(
        'ADMIN',
        'Pending Marks',
        'New marks record pending approval.'
    );

    return getMarksById(result.insertId);
}

async function getMarksByStudent(studentId) {
    const [rows] = await pool.execute(`
        SELECT m.*, s.first_name, s.last_name, s.email as s_email, s.username as s_username, s.user_id as s_user_id
        FROM marks m
        JOIN students s ON m.student_id = s.id
        WHERE m.student_id = ?
        ORDER BY m.id DESC
    `, [studentId]);
    return rows.map(mapMarksRow);
}

async function getApprovedMarksByStudent(studentId) {
    const [rows] = await pool.execute(`
        SELECT m.*, s.first_name, s.last_name, s.email as s_email, s.username as s_username, s.user_id as s_user_id
        FROM marks m
        JOIN students s ON m.student_id = s.id
        WHERE m.student_id = ? AND m.approval_status = 'APPROVED'
        ORDER BY m.id DESC
    `, [studentId]);
    return rows.map(mapMarksRow);
}

async function getAllMarks() {
    const [rows] = await pool.execute(`
        SELECT m.*, s.first_name, s.last_name, s.email as s_email, s.username as s_username, s.user_id as s_user_id
        FROM marks m
        JOIN students s ON m.student_id = s.id
        ORDER BY m.id DESC
    `);
    return rows.map(mapMarksRow);
}

async function updateMarks(id, marksDetails) {
    await getMarksById(id);

    const subject = marksDetails.subject;
    const marksObtained = parseFloat(marksDetails.marksObtained);
    const totalMarks = parseFloat(marksDetails.totalMarks);
    const grade = calculateGrade(marksObtained, totalMarks);
    const approvalStatus = 'PENDING';

    await pool.execute(
        'UPDATE marks SET subject = ?, marks_obtained = ?, total_marks = ?, grade = ?, approval_status = ? WHERE id = ?',
        [subject, marksObtained, totalMarks, grade, approvalStatus, id]
    );

    await notificationService.createNotificationForRole(
        'ADMIN',
        'Pending Marks',
        'Marks record updated and pending approval.'
    );

    return getMarksById(id);
}

async function updateApprovalStatus(id, status) {
    await getMarksById(id);

    await pool.execute(
        'UPDATE marks SET approval_status = ? WHERE id = ?',
        [status, id]
    );

    const updated = await getMarksById(id);

    if (updated.student && updated.student.userId) {
        await notificationService.createNotification(
            updated.student.userId,
            `Marks ${status}`,
            `Your marks for ${updated.subject} were ${status}`
        );
    }

    return updated;
}

async function deleteMarks(id) {
    await getMarksById(id);
    await pool.execute('DELETE FROM marks WHERE id = ?', [id]);
}

module.exports = {
    addMarks,
    getMarksByStudent,
    getApprovedMarksByStudent,
    getAllMarks,
    updateMarks,
    updateApprovalStatus,
    deleteMarks
};
