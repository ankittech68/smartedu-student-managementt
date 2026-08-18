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
                // New user — create with hashed password
                const hashedPassword = await bcrypt.hash(u.password, 10);
                const [userRes] = await pool.execute(
                    'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
                    [u.username, u.email, hashedPassword, u.role]
                );

                // If student, seed a default student profile too
                if (u.role === 'STUDENT') {
                    const [studentRes] = await pool.execute(
                        `INSERT INTO students (first_name, last_name, date_of_birth, enrollment_date, phone, address, user_id, email, username)
                         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                        ['Alex', 'Morgan', '2004-05-15', '2023-08-01', '+1 555-0199', '123 University Campus, Block A', userRes.insertId, u.email, u.username]
                    );

                    // Seed sample attendance and marks for demo student
                    await pool.execute(
                        'INSERT INTO attendance (date, status, approval_status, student_id) VALUES (?, ?, ?, ?), (?, ?, ?, ?), (?, ?, ?, ?)',
                        ['2026-08-10', 'PRESENT', 'APPROVED', studentRes.insertId,
                         '2026-08-11', 'PRESENT', 'APPROVED', studentRes.insertId,
                         '2026-08-12', 'LATE', 'APPROVED', studentRes.insertId]
                    );

                    await pool.execute(
                        'INSERT INTO marks (subject, marks_obtained, total_marks, grade, approval_status, student_id) VALUES (?, ?, ?, ?, ?, ?), (?, ?, ?, ?, ?, ?), (?, ?, ?, ?, ?, ?)',
                        ['Data Structures & Algorithms', 92, 100, 'O', 'APPROVED', studentRes.insertId,
                         'Database Management Systems', 85, 100, 'A+', 'APPROVED', studentRes.insertId,
                         'Computer Networks', 78, 100, 'A', 'APPROVED', studentRes.insertId]
                    );
                }
                console.log(`✅ Seeded demo user: ${u.username} (${u.role})`);
            } else {
                console.log(`✓ Demo user already exists: ${u.username}`);
            }
        }
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

        // Auto-create database if it does not exist
        // Note: Some hosted MySQL providers (PlanetScale) don't allow CREATE DATABASE
        // — in that case, the database is pre-created via the provider dashboard
        try {
            const tempConn = await mysql.createConnection({ host, port, user, password });
            await tempConn.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
            await tempConn.end();
        } catch (dbCreateErr) {
            // Hosted providers may not allow this — not fatal if DB already exists
            console.warn('⚠️  Could not auto-create database (may already exist or provider restricts it):', dbCreateErr.message);
        }

        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
              id BIGINT AUTO_INCREMENT PRIMARY KEY,
              username VARCHAR(255) NOT NULL UNIQUE,
              password VARCHAR(255) NOT NULL,
              email VARCHAR(255) NOT NULL,
              role VARCHAR(50) NOT NULL
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
              CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);

        // Data migration: normalize any null approval_status values
        try {
            await pool.query("UPDATE attendance SET approval_status = 'APPROVED' WHERE approval_status IS NULL");
            await pool.query("UPDATE marks SET approval_status = 'APPROVED' WHERE approval_status IS NULL");
        } catch (e) {
            // Ignore if columns or tables don't exist yet
        }

        // Seed recruiter demo users
        await seedDemoUsers();

        console.log('✅ Database schema & demo user verification complete.');
    } catch (error) {
        console.error('❌ Error initializing database schema:', error);
    }
}

module.exports = initDb;
