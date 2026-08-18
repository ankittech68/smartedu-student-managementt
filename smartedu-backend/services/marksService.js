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

async function getMarksById(id, isDemo = false) {
    const demoFlag = isDemo ? 1 : 0;
    const [rows] = await pool.execute(`
        SELECT m.*, s.first_name, s.last_name, s.email as s_email, s.username as s_username, s.user_id as s_user_id
        FROM marks m
        JOIN students s ON m.student_id = s.id
        WHERE m.id = ? AND m.is_demo = ?
    `, [id, demoFlag]);
    if (rows.length === 0) {
        throw new Error('Marks record not found with id: ' + id);
    }
    return mapMarksRow(rows[0]);
}

async function addMarks(marksData, isDemo = false) {
    const demoFlag = isDemo ? 1 : 0;
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
        'INSERT INTO marks (subject, marks_obtained, total_marks, grade, approval_status, student_id, is_demo) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [subject, marksObtained, totalMarks, grade, approvalStatus, studentId, demoFlag]
    );

    await notificationService.createNotificationForRole(
        'ADMIN',
        'Pending Marks',
        'New marks record pending approval.',
        isDemo
    );

    return getMarksById(result.insertId, isDemo);
}

async function getMarksByStudent(studentId, isDemo = false) {
    const demoFlag = isDemo ? 1 : 0;
    const [rows] = await pool.execute(`
        SELECT m.*, s.first_name, s.last_name, s.email as s_email, s.username as s_username, s.user_id as s_user_id
        FROM marks m
        JOIN students s ON m.student_id = s.id
        WHERE m.student_id = ? AND m.is_demo = ?
        ORDER BY m.id DESC
    `, [studentId, demoFlag]);
    return rows.map(mapMarksRow);
}

async function getApprovedMarksByStudent(studentId, isDemo = false) {
    const demoFlag = isDemo ? 1 : 0;
    const [rows] = await pool.execute(`
        SELECT m.*, s.first_name, s.last_name, s.email as s_email, s.username as s_username, s.user_id as s_user_id
        FROM marks m
        JOIN students s ON m.student_id = s.id
        WHERE m.student_id = ? AND m.approval_status = 'APPROVED' AND m.is_demo = ?
        ORDER BY m.id DESC
    `, [studentId, demoFlag]);
    return rows.map(mapMarksRow);
}

async function getAllMarks(isDemo = false) {
    const demoFlag = isDemo ? 1 : 0;
    const [rows] = await pool.execute(`
        SELECT m.*, s.first_name, s.last_name, s.email as s_email, s.username as s_username, s.user_id as s_user_id
        FROM marks m
        JOIN students s ON m.student_id = s.id
        WHERE m.is_demo = ?
        ORDER BY m.id DESC
    `, [demoFlag]);
    return rows.map(mapMarksRow);
}

async function updateMarks(id, marksDetails, isDemo = false) {
    await getMarksById(id, isDemo);
    const demoFlag = isDemo ? 1 : 0;

    const subject = marksDetails.subject;
    const marksObtained = parseFloat(marksDetails.marksObtained);
    const totalMarks = parseFloat(marksDetails.totalMarks);
    const grade = calculateGrade(marksObtained, totalMarks);
    const approvalStatus = 'PENDING';

    await pool.execute(
        'UPDATE marks SET subject = ?, marks_obtained = ?, total_marks = ?, grade = ?, approval_status = ? WHERE id = ? AND is_demo = ?',
        [subject, marksObtained, totalMarks, grade, approvalStatus, id, demoFlag]
    );

    await notificationService.createNotificationForRole(
        'ADMIN',
        'Pending Marks',
        'Marks record updated and pending approval.',
        isDemo
    );

    return getMarksById(id, isDemo);
}

async function updateApprovalStatus(id, status, isDemo = false) {
    await getMarksById(id, isDemo);
    const demoFlag = isDemo ? 1 : 0;

    await pool.execute(
        'UPDATE marks SET approval_status = ? WHERE id = ? AND is_demo = ?',
        [status, id, demoFlag]
    );

    const updated = await getMarksById(id, isDemo);

    if (updated.student && updated.student.userId) {
        await notificationService.createNotification(
            updated.student.userId,
            `Marks ${status}`,
            `Your marks for ${updated.subject} were ${status}`,
            isDemo
        );
    }

    return updated;
}

async function deleteMarks(id, isDemo = false) {
    await getMarksById(id, isDemo);
    const demoFlag = isDemo ? 1 : 0;
    await pool.execute('DELETE FROM marks WHERE id = ? AND is_demo = ?', [id, demoFlag]);
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
