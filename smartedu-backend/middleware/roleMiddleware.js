function requireRole(...allowedRoles) {
    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            return res.status(403).json({ success: false, message: 'Access Denied: User role missing' });
        }

        const userRole = req.user.role.toUpperCase().replace(/^ROLE_/, '');
        const normalizedAllowedRoles = allowedRoles.map(r => r.toUpperCase().replace(/^ROLE_/, ''));

        if (!normalizedAllowedRoles.includes(userRole)) {
            return res.status(403).json({ success: false, message: 'Access Denied: Insufficient permissions' });
        }

        next();
    };
}

module.exports = {
    requireRole
};
