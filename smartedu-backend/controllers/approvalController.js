const approvalService = require('../services/approvalService');

async function getPendingApprovals(req, res, next) {
    try {
        const data = await approvalService.getPendingApprovals(Boolean(req.user?.isDemo));
        return res.json(data);
    } catch (error) {
        next(error);
    }
}

async function approveAllPending(req, res, next) {
    try {
        const result = await approvalService.approveAllPending(Boolean(req.user?.isDemo));
        return res.json(result);
    } catch (error) {
        next(error);
    }
}

async function rejectAllPending(req, res, next) {
    try {
        const result = await approvalService.rejectAllPending(Boolean(req.user?.isDemo));
        return res.json(result);
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getPendingApprovals,
    approveAllPending,
    rejectAllPending
};
