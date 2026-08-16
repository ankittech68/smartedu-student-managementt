const { generateToken, verifyToken } = require('./utils/jwt');
const bcrypt = require('bcryptjs');
const authService = require('./services/authService');
const studentService = require('./services/studentService');
const attendanceService = require('./services/attendanceService');
const marksService = require('./services/marksService');
const notificationService = require('./services/notificationService');
const approvalService = require('./services/approvalService');
const userService = require('./services/userService');

async function testUnitLogic() {
    console.log('=== 1. Testing JWT Token Operations ===');
    const token = generateToken({ id: 1, username: 'testadmin', email: 'admin@test.com', role: 'ROLE_ADMIN' });
    console.log('Generated JWT:', token.substring(0, 30) + '...');
    const decoded = verifyToken(token);
    console.log('Decoded Token:', decoded);
    if (decoded.username !== 'testadmin' || decoded.role !== 'ROLE_ADMIN') {
        throw new Error('JWT verification failed');
    }
    console.log('JWT Verification: PASSED\n');

    console.log('=== 2. Testing Password Hashing (Bcrypt) ===');
    const rawPass = 'password123';
    const hash = await bcrypt.hash(rawPass, 10);
    const match = await bcrypt.compare(rawPass, hash);
    console.log('Password Hash Match:', match);
    if (!match) throw new Error('Bcrypt match failed');
    console.log('Password Hashing: PASSED\n');

    console.log('=== 3. Validating Service Function Exports ===');
    const requiredServices = [
        { name: 'authService', service: authService, methods: ['authenticateUser', 'registerUser'] },
        { name: 'userService', service: userService, methods: ['getUnassignedStudents', 'updateUser'] },
        { name: 'studentService', service: studentService, methods: ['saveStudent', 'getAllStudents', 'getStudentById', 'getStudentByUserId', 'updateStudent', 'deleteStudent'] },
        { name: 'attendanceService', service: attendanceService, methods: ['markAttendance', 'getAttendanceByStudent', 'getApprovedAttendanceByStudent', 'getAllAttendance', 'updateAttendance', 'updateApprovalStatus', 'deleteAttendance'] },
        { name: 'marksService', service: marksService, methods: ['addMarks', 'getMarksByStudent', 'getApprovedMarksByStudent', 'getAllMarks', 'updateMarks', 'updateApprovalStatus', 'deleteMarks'] },
        { name: 'notificationService', service: notificationService, methods: ['createNotification', 'createNotificationForRole', 'getUserNotifications', 'markAsRead'] },
        { name: 'approvalService', service: approvalService, methods: ['getPendingApprovals'] }
    ];

    for (const item of requiredServices) {
        for (const method of item.methods) {
            if (typeof item.service[method] !== 'function') {
                throw new Error(`Missing method ${method} on ${item.name}`);
            }
        }
        console.log(`Service [${item.name}]: All methods verified.`);
    }
    console.log('Services Export Check: PASSED\n');
}

testUnitLogic()
    .then(() => {
        console.log('All backend unit tests passed successfully!');
        process.exit(0);
    })
    .catch((err) => {
        console.error('Test error:', err);
        process.exit(1);
    });
