const approvalService = require('../services/approvalService');

async function getPendingApprovals(req, res, next) {
    try {
        const data = await approvalService.getPendingApprovals();
        return res.json(data);
    } catch (error) {
        next(error);
    }
}

async function approveAllPending(req, res, next) {
    try {
        const result = await approvalService.approveAllPending();
        return res.json(result);
    } catch (error) {
        next(error);
    }
}

async function rejectAllPending(req, res, next) {
    try {
        const result = await approvalService.rejectAllPending();
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
