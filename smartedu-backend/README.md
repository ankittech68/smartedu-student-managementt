# ⚡ SmartEdu - Express API & MySQL Backend

This is the RESTful API backend service for the **SmartEdu Student Management Portal**, built using **Node.js**, **Express.js**, and **MySQL**.

---

## ⚡ Key Features

- **JWT Authentication**: Stateless token authorization via Bearer tokens.
- **BCrypt Password Hashing**: Salt-based password encryption.
- **Auto Schema & Data Seeding**: `initDb.js` creates MySQL tables and seeds recruiter demo accounts on server startup.
- **Role-Based Guards**: Middleware enforcing permissions for `ADMIN`, `TEACHER`, and `STUDENT`.
- **Bulk Approval Endpoints**: Dedicated routes for approving or clearing pending faculty requests in bulk.

---

## 🛠️ Technology Stack

- **Runtime**: Node.js (v18+)
- **Framework**: Express.js
- **Database Engine**: MySQL (v8.0+)
- **MySQL Connection**: `mysql2` (Promise-based connection pool)
- **Security**: `jsonwebtoken`, `bcryptjs`, `cors`
- **Dev Tooling**: `nodemon`

---

## 🔌 API Endpoints

### 🔐 Auth Routes (`/api/auth`)
- `POST /api/auth/login`: Authenticate user & return JWT token
- `POST /api/auth/register`: Register new user account

### 👥 Student Routes (`/api/students`)
- `GET /api/students`: Fetch all students
- `GET /api/students/me`: Fetch current logged-in student profile
- `POST /api/students`: Create new student
- `PUT /api/students/:id`: Update student record
- `DELETE /api/students/:id`: Remove student record

### 📅 Attendance Routes (`/api/attendance`)
- `GET /api/attendance`: Fetch attendance records
- `POST /api/attendance`: Mark student attendance
- `PUT /api/attendance/:id`: Update attendance record
- `PUT /api/attendance/:id/approve`: Approve attendance
- `PUT /api/attendance/:id/reject`: Reject attendance

### 📚 Marks Routes (`/api/marks`)
- `GET /api/marks`: Fetch marks records
- `POST /api/marks`: Add subject marks
- `PUT /api/marks/:id`: Update marks record
- `PUT /api/marks/:id/approve`: Approve marks
- `PUT /api/marks/:id/reject`: Reject marks

### 📋 Approval Routes (`/api/approvals`)
- `GET /api/approvals/pending`: Get all pending attendance & marks requests
- `PUT /api/approvals/approve-all`: Bulk approve all pending requests
- `PUT /api/approvals/reject-all`: Bulk clear all pending requests

---

## ⚙️ Environment Configuration (`.env`)

```env
PORT=9999
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=smartedu
JWT_SECRET=your_jwt_secret_key
```
