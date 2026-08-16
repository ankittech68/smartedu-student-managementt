const marksService = require('../services/marksService');

async function addMarks(req, res, next) {
    try {
        const marks = await marksService.addMarks(req.body);
        return res.json(marks);
    } catch (error) {
        next(error);
    }
}

async function getAllMarks(req, res, next) {
    try {
        const marksList = await marksService.getAllMarks();
        return res.json(marksList);
    } catch (error) {
        next(error);
    }
}

async function getMarksByStudent(req, res, next) {
    try {
        const { studentId } = req.params;
        const userRole = req.user.role ? req.user.role.toUpperCase().replace(/^ROLE_/, '') : '';
        if (userRole === 'STUDENT') {
            const marksList = await marksService.getApprovedMarksByStudent(studentId);
            return res.json(marksList);
        }
        const marksList = await marksService.getMarksByStudent(studentId);
        return res.json(marksList);
    } catch (error) {
        next(error);
    }
}

async function updateMarks(req, res, next) {
    try {
        const { id } = req.params;
        const marks = await marksService.updateMarks(id, req.body);
        return res.json(marks);
    } catch (error) {
        next(error);
    }
}

async function approveMarks(req, res, next) {
    try {
        const { id } = req.params;
        const marks = await marksService.updateApprovalStatus(id, 'APPROVED');
        return res.json(marks);
    } catch (error) {
        next(error);
    }
}

async function rejectMarks(req, res, next) {
    try {
        const { id } = req.params;
        const marks = await marksService.updateApprovalStatus(id, 'REJECTED');
        return res.json(marks);
    } catch (error) {
        next(error);
    }
}

async function deleteMarks(req, res, next) {
    try {
        const { id } = req.params;
        await marksService.deleteMarks(id);
        return res.json({ success: true, message: 'Marks record deleted successfully' });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    addMarks,
    getAllMarks,
    getMarksByStudent,
    updateMarks,
    approveMarks,
    rejectMarks,
    deleteMarks
};
