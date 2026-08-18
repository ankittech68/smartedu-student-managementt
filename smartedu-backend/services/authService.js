const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const { generateToken } = require('../utils/jwt');
const notificationService = require('./notificationService');

async function authenticateUser(username, password) {
    const [users] = await pool.execute('SELECT * FROM users WHERE username = ?', [username]);
    if (users.length === 0) {
        throw new Error('Bad credentials');
    }

    const user = users[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        throw new Error('Bad credentials');
    }

    // Role format returned to frontend
    const roleWithPrefix = user.role.startsWith('ROLE_') ? user.role : `ROLE_${user.role}`;

    const isDemo = Boolean(user.is_demo);

    const tokenPayload = {
        id: user.id,
        username: user.username,
        email: user.email,
        role: roleWithPrefix,
        isDemo: isDemo
    };

    const token = generateToken(tokenPayload);

    return {
        token,
        type: 'Bearer',
        id: user.id,
        username: user.username,
        email: user.email,
        role: roleWithPrefix,
        isDemo: isDemo
    };
}

async function registerUser({ username, email, password, role }) {
    const [existingUser] = await pool.execute('SELECT id FROM users WHERE username = ?', [username]);
    if (existingUser.length > 0) {
        throw new Error('Error: Username is already taken!');
    }

    const [existingEmail] = await pool.execute('SELECT id FROM users WHERE email = ?', [email]);
    if (existingEmail.length > 0) {
        throw new Error('Error: Email is already in use!');
    }

    let userRole = 'STUDENT';
    if (role) {
        const cleanRole = role.toUpperCase().replace(/^ROLE_/, '');
        if (['ADMIN', 'TEACHER', 'STUDENT'].includes(cleanRole)) {
            userRole = cleanRole;
        } else {
            throw new Error('Error: Invalid role specified.');
        }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await pool.execute(
        'INSERT INTO users (username, email, password, role, is_demo) VALUES (?, ?, ?, ?, 0)',
        [username, email, hashedPassword, userRole]
    );

    if (userRole === 'STUDENT') {
        await notificationService.createNotificationForRole(
            'ADMIN',
            'New Student Registered',
            `A new student (${username}) has registered.`,
            false // isDemo = false for normal user registrations
        );
    }

    return { message: 'User registered successfully!' };
}

module.exports = {
    authenticateUser,
    registerUser
};
