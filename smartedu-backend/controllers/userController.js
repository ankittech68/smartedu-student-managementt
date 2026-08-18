const userService = require('../services/userService');

async function getUnassignedStudents(req, res, next) {
    try {
        const students = await userService.getUnassignedStudents(Boolean(req.user?.isDemo));
        return res.json(students);
    } catch (error) {
        next(error);
    }
}

async function updateUser(req, res, next) {
    try {
        const { id } = req.params;
        const updatedUser = await userService.updateUser(id, req.body, Boolean(req.user?.isDemo));
        return res.json(updatedUser);
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getUnassignedStudents,
    updateUser
};
