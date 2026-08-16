const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    // Enable keep-alive for hosted MySQL (e.g. PlanetScale, Railway, Aiven)
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
});

// Verify database connectivity on startup
pool.getConnection()
    .then(conn => {
        console.log('✅ MySQL database connected successfully');
        conn.release();
    })
    .catch(err => {
        console.error('❌ MySQL connection failed:', err.message);
        console.error('Check DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME in your .env');
        // Do not exit — let Express start so /api/health still responds (useful for debugging on Render)
    });

module.exports = pool;
