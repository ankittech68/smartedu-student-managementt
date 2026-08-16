const notificationService = require('../services/notificationService');

async function getMyNotifications(req, res, next) {
    try {
        const userId = req.user.id;
        const notifications = await notificationService.getUserNotifications(userId);
        return res.json(notifications);
    } catch (error) {
        next(error);
    }
}

async function markAsRead(req, res, next) {
    try {
        const { id } = req.params;
        const notification = await notificationService.markAsRead(id);
        return res.json(notification);
    } catch (error) {
        next(error);
    }
}

async function markAllAsRead(req, res, next) {
    try {
        const userId = req.user.id;
        const result = await notificationService.markAllAsRead(userId);
        return res.json(result);
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getMyNotifications,
    markAsRead,
    markAllAsRead
};
