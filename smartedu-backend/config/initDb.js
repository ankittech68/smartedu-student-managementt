const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const pool = require('./db');

async function seedDemoUsers() {
    try {
        const demoUsers = [
            { username: 'admin', email: 'admin@smartedu.com', password: 'admin123', role: 'ADMIN' },
            { username: 'teacher', email: 'teacher@smartedu.com', password: 'teacher123', role: 'TEACHER' },
            { username: 'student', email: 'student@smartedu.com', password: 'student123', role: 'STUDENT' }
        ];

        for (const u of demoUsers) {
            const [existing] = await pool.execute('SELECT id, password FROM users WHERE username = ?', [u.username]);

            if (existing.length === 0) {
                // New user — create with hashed password and is_demo = 1
                const hashedPassword = await bcrypt.hash(u.password, 10);
                const [userRes] = await pool.execute(
                    'INSERT INTO users (username, email, password, role, is_demo) VALUES (?, ?, ?, ?, 1)',
                    [u.username, u.email, hashedPassword, u.role]
                );

                // If student, seed a default student profile too
                if (u.role === 'STUDENT') {
                    const [studentRes] = await pool.execute(
                        `INSERT INTO students (first_name, last_name, date_of_birth, enrollment_date, phone, address, user_id, email, username, is_demo)
                         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
                        ['Alex', 'Morgan', '2004-05-15', '2023-08-01', '+1 555-0199', '123 University Campus, Block A', userRes.insertId, u.email, u.username]
                    );

                    // Seed sample attendance and marks for demo student
                    await pool.execute(
                        'INSERT INTO attendance (date, status, approval_status, student_id, is_demo) VALUES (?, ?, ?, ?, 1), (?, ?, ?, ?, 1), (?, ?, ?, ?, 1)',
                        ['2026-08-10', 'PRESENT', 'APPROVED', studentRes.insertId,
                         '2026-08-11', 'PRESENT', 'APPROVED', studentRes.insertId,
                         '2026-08-12', 'LATE', 'APPROVED', studentRes.insertId]
                    );

                    await pool.execute(
                        'INSERT INTO marks (subject, marks_obtained, total_marks, grade, approval_status, student_id, is_demo) VALUES (?, ?, ?, ?, ?, ?, 1), (?, ?, ?, ?, ?, ?, 1), (?, ?, ?, ?, ?, ?, 1)',
                        ['Data Structures & Algorithms', 92, 100, 'O', 'APPROVED', studentRes.insertId,
                         'Database Management Systems', 85, 100, 'A+', 'APPROVED', studentRes.insertId,
                         'Computer Networks', 78, 100, 'A', 'APPROVED', studentRes.insertId]
                    );
                }
                console.log(`✅ Seeded demo user: ${u.username} (${u.role})`);
            } else {
                // Ensure existing demo user accounts have is_demo = 1
                await pool.execute('UPDATE users SET is_demo = 1 WHERE username = ?', [u.username]);
                console.log(`✓ Demo user verified & marked as demo: ${u.username}`);
            }
        }

        // Ensure associated demo student profiles, attendance, marks & notifications have is_demo = 1
        await pool.execute("UPDATE students SET is_demo = 1 WHERE username IN ('admin', 'teacher', 'student') OR email LIKE '%smartedu.com%'");
        await pool.execute("UPDATE attendance SET is_demo = 1 WHERE student_id IN (SELECT id FROM students WHERE is_demo = 1)");
        await pool.execute("UPDATE marks SET is_demo = 1 WHERE student_id IN (SELECT id FROM students WHERE is_demo = 1)");
        await pool.execute("UPDATE notifications SET is_demo = 1 WHERE user_id IN (SELECT id FROM users WHERE is_demo = 1)");

    } catch (error) {
        console.error('Error seeding demo users:', error);
    }
}

async function initDb() {
    try {
        console.log('🔧 Checking and initializing database schema...');

        const host = process.env.DB_HOST;
        const port = parseInt(process.env.DB_PORT || '3306', 10);
        const user = process.env.DB_USER;
        const password = process.env.DB_PASSWORD;
        const dbName = process.env.DB_NAME || 'smartedu';

        try {
            const tempConn = await mysql.createConnection({ host, port, user, password });
            await tempConn.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
            await tempConn.end();
        } catch (dbCreateErr) {
            console.warn('⚠️  Could not auto-create database (may already exist or provider restricts it):', dbCreateErr.message);
        }

        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
              id BIGINT AUTO_INCREMENT PRIMARY KEY,
              username VARCHAR(255) NOT NULL UNIQUE,
              password VARCHAR(255) NOT NULL,
              email VARCHAR(255) NOT NULL,
              role VARCHAR(50) NOT NULL,
              is_demo TINYINT(1) NOT NULL DEFAULT 0
            )
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS students (
              id BIGINT AUTO_INCREMENT PRIMARY KEY,
              first_name VARCHAR(255) NOT NULL,
              last_name VARCHAR(255) NOT NULL,
              date_of_birth DATE NULL,
              enrollment_date DATE NOT NULL,
              phone VARCHAR(255) NULL,
              address VARCHAR(255) NULL,
              user_id BIGINT UNIQUE NULL,
              email VARCHAR(255) NULL,
              username VARCHAR(255) NULL,
              is_demo TINYINT(1) NOT NULL DEFAULT 0,
              CONSTRAINT fk_students_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
            )
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS attendance (
              id BIGINT AUTO_INCREMENT PRIMARY KEY,
              date DATE NOT NULL,
              status VARCHAR(50) NOT NULL,
              approval_status VARCHAR(20) NOT NULL DEFAULT 'APPROVED',
              student_id BIGINT NOT NULL,
              is_demo TINYINT(1) NOT NULL DEFAULT 0,
              CONSTRAINT fk_attendance_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
            )
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS marks (
              id BIGINT AUTO_INCREMENT PRIMARY KEY,
              subject VARCHAR(255) NOT NULL,
              marks_obtained DOUBLE NOT NULL,
              total_marks DOUBLE NOT NULL,
              grade VARCHAR(5) NULL,
              approval_status VARCHAR(20) NOT NULL DEFAULT 'APPROVED',
              student_id BIGINT NOT NULL,
              is_demo TINYINT(1) NOT NULL DEFAULT 0,
              CONSTRAINT fk_marks_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
            )
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS notifications (
              id BIGINT AUTO_INCREMENT PRIMARY KEY,
              title VARCHAR(255) NOT NULL,
              message VARCHAR(500) NOT NULL,
              timestamp DATETIME NOT NULL,
              is_read TINYINT(1) NOT NULL DEFAULT 0,
              user_id BIGINT NOT NULL,
              is_demo TINYINT(1) NOT NULL DEFAULT 0,
              CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);

        // Migration: add is_demo column to pre-existing tables if missing
        const tables = ['users', 'students', 'attendance', 'marks', 'notifications'];
        for (const t of tables) {
            try {
                await pool.query(`ALTER TABLE \`${t}\` ADD COLUMN is_demo TINYINT(1) NOT NULL DEFAULT 0;`);
            } catch (e) {
                // Column already exists or table was just created
            }
        }

        // Data migration: normalize any null approval_status values
        try {
            await pool.query("UPDATE attendance SET approval_status = 'APPROVED' WHERE approval_status IS NULL");
            await pool.query("UPDATE marks SET approval_status = 'APPROVED' WHERE approval_status IS NULL");
        } catch (e) {
            // Ignore if columns or tables don't exist yet
        }

        // Seed recruiter demo users & update flags
        await seedDemoUsers();

        console.log('✅ Database schema & demo user verification complete.');
    } catch (error) {
        console.error('❌ Error initializing database schema:', error);
    }
}

module.exports = initDb;

