const jwt = require('jsonwebtoken');

// In production, JWT_SECRET MUST be set via environment variable.
// Never use a hardcoded default in production.
if (!process.env.JWT_SECRET && process.env.NODE_ENV === 'production') {
    throw new Error('FATAL: JWT_SECRET environment variable is not set. Cannot start in production without it.');
}

const JWT_SECRET = process.env.JWT_SECRET || 'smartedu_dev_only_secret_do_not_use_in_prod';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

function generateToken(userPayload) {
    return jwt.sign(
        {
            id: userPayload.id,
            username: userPayload.username,
            email: userPayload.email,
            role: userPayload.role,
            isDemo: Boolean(userPayload.isDemo)
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
    );
}

function verifyToken(token) {
    return jwt.verify(token, JWT_SECRET);
}

module.exports = {
    generateToken,
    verifyToken
};
