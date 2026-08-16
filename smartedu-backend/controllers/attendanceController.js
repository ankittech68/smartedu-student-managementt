const attendanceService = require('../services/attendanceService');

async function markAttendance(req, res, next) {
    try {
        const attendance = await attendanceService.markAttendance(req.body);
        return res.json(attendance);
    } catch (error) {
        next(error);
    }
}

async function getAllAttendance(req, res, next) {
    try {
        const attendanceList = await attendanceService.getAllAttendance();
        return res.json(attendanceList);
    } catch (error) {
        next(error);
    }
}

async function getAttendanceByStudent(req, res, next) {
    try {
        const { studentId } = req.params;
        const userRole = req.user.role ? req.user.role.toUpperCase().replace(/^ROLE_/, '') : '';
        if (userRole === 'STUDENT') {
            const attendanceList = await attendanceService.getApprovedAttendanceByStudent(studentId);
            return res.json(attendanceList);
        }
        const attendanceList = await attendanceService.getAttendanceByStudent(studentId);
        return res.json(attendanceList);
    } catch (error) {
        next(error);
    }
}

async function updateAttendance(req, res, next) {
    try {
        const { id } = req.params;
        const attendance = await attendanceService.updateAttendance(id, req.body);
        return res.json(attendance);
    } catch (error) {
        next(error);
    }
}

async function approveAttendance(req, res, next) {
    try {
        const { id } = req.params;
        const attendance = await attendanceService.updateApprovalStatus(id, 'APPROVED');
        return res.json(attendance);
    } catch (error) {
        next(error);
    }
}

async function rejectAttendance(req, res, next) {
    try {
        const { id } = req.params;
        const attendance = await attendanceService.updateApprovalStatus(id, 'REJECTED');
        return res.json(attendance);
    } catch (error) {
        next(error);
    }
}

async function deleteAttendance(req, res, next) {
    try {
        const { id } = req.params;
        await attendanceService.deleteAttendance(id);
        return res.json({ success: true, message: 'Attendance deleted successfully' });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    markAttendance,
    getAllAttendance,
    getAttendanceByStudent,
    updateAttendance,
    approveAttendance,
    rejectAttendance,
    deleteAttendance
};
