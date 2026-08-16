const authService = require('../services/authService');

async function signin(req, res, next) {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ success: false, message: 'Username and password are required' });
        }
        const response = await authService.authenticateUser(username, password);
        return res.json(response);
    } catch (error) {
        return res.status(401).json({ success: false, message: error.message || 'Authentication failed' });
    }
}

async function signup(req, res, next) {
    try {
        const { username, email, password, role } = req.body;
        if (!username || !email || !password) {
            return res.status(400).json({ success: false, message: 'Username, email, and password are required' });
        }
        const response = await authService.registerUser({ username, email, password, role });
        return res.json(response);
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message || 'Registration failed' });
    }
}

module.exports = {
    signin,
    signup
};
