const attendanceService = require('../services/attendanceService');

async function markAttendance(req, res, next) {
    try {
        const attendance = await attendanceService.markAttendance(req.body, Boolean(req.user?.isDemo));
        return res.json(attendance);
    } catch (error) {
        next(error);
    }
}

async function getAllAttendance(req, res, next) {
    try {
        const attendanceList = await attendanceService.getAllAttendance(Boolean(req.user?.isDemo));
        return res.json(attendanceList);
    } catch (error) {
        next(error);
    }
}

async function getAttendanceByStudent(req, res, next) {
    try {
        const { studentId } = req.params;
        const userRole = req.user.role ? req.user.role.toUpperCase().replace(/^ROLE_/, '') : '';
        const isDemo = Boolean(req.user?.isDemo);
        if (userRole === 'STUDENT') {
            const attendanceList = await attendanceService.getApprovedAttendanceByStudent(studentId, isDemo);
            return res.json(attendanceList);
        }
        const attendanceList = await attendanceService.getAttendanceByStudent(studentId, isDemo);
        return res.json(attendanceList);
    } catch (error) {
        next(error);
    }
}

async function updateAttendance(req, res, next) {
    try {
        const { id } = req.params;
        const attendance = await attendanceService.updateAttendance(id, req.body, Boolean(req.user?.isDemo));
        return res.json(attendance);
    } catch (error) {
        next(error);
    }
}

async function approveAttendance(req, res, next) {
    try {
        const { id } = req.params;
        const attendance = await attendanceService.updateApprovalStatus(id, 'APPROVED', Boolean(req.user?.isDemo));
        return res.json(attendance);
    } catch (error) {
        next(error);
    }
}

async function rejectAttendance(req, res, next) {
    try {
        const { id } = req.params;
        const attendance = await attendanceService.updateApprovalStatus(id, 'REJECTED', Boolean(req.user?.isDemo));
        return res.json(attendance);
    } catch (error) {
        next(error);
    }
}

async function deleteAttendance(req, res, next) {
    try {
        const { id } = req.params;
        await attendanceService.deleteAttendance(id, Boolean(req.user?.isDemo));
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
