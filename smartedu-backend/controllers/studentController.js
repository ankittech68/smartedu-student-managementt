const studentService = require('../services/studentService');

async function createStudent(req, res, next) {
    try {
        const student = await studentService.saveStudent(req.body);
        return res.json(student);
    } catch (error) {
        next(error);
    }
}

async function getAllStudents(req, res, next) {
    try {
        const students = await studentService.getAllStudents();
        return res.json(students);
    } catch (error) {
        next(error);
    }
}

async function getStudentById(req, res, next) {
    try {
        const { id } = req.params;
        const student = await studentService.getStudentById(id);
        return res.json(student);
    } catch (error) {
        next(error);
    }
}

async function getStudentByUserId(req, res, next) {
    try {
        const { userId } = req.params;
        const student = await studentService.getStudentByUserId(userId);
        return res.json(student);
    } catch (error) {
        next(error);
    }
}

async function getMyStudentProfile(req, res, next) {
    try {
        const userId = req.user.id;
        const student = await studentService.getStudentByUserId(userId);
        return res.json(student);
    } catch (error) {
        next(error);
    }
}

async function updateStudent(req, res, next) {
    try {
        const { id } = req.params;
        const student = await studentService.updateStudent(id, req.body);
        return res.json(student);
    } catch (error) {
        next(error);
    }
}

async function deleteStudent(req, res, next) {
    try {
        const { id } = req.params;
        await studentService.deleteStudent(id);
        return res.json({ success: true, message: 'Student deleted successfully' });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    createStudent,
    getAllStudents,
    getStudentById,
    getStudentByUserId,
    getMyStudentProfile,
    updateStudent,
    deleteStudent
};
