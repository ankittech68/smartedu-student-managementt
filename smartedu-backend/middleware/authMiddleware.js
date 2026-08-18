const { verifyToken } = require('../utils/jwt');

function requireAuth(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, message: 'Unauthorized: Missing or invalid token' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = verifyToken(token);
        req.user = {
            ...decoded,
            isDemo: Boolean(decoded.isDemo)
        };
        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: 'Unauthorized: Invalid or expired token' });
    }
}

module.exports = {
    requireAuth
};
