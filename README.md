# 🎓 SmartEdu - Student Management Portal

A placement-ready, full-stack enterprise web application built using **React 19**, **Node.js**, **Express.js**, and **MySQL**. SmartEdu streamlines academic administration, tracking student directory information, daily attendance, subject scores & report cards, and bulk request approval workflows with role-based access control (RBAC).

---

## 🌟 Key Features

### 🔐 Authentication & Security
- **JWT (JSON Web Token)** stateless session management.
- **BCrypt.js** salted password hashing.
- **Role-Based Access Control (RBAC)**: Distinct permissions for `ADMIN`, `TEACHER`, and `STUDENT`.
- **Protected Client Routes**: Automatic redirect & unauthorized access prevention.
- **1-Click Recruiter Demo Login**: Instant login pre-sets for Admin, Faculty, and Student roles.

### 📊 Dashboard & Analytics
- Real-time stat summary cards (Total Students, Attendance Rate, Average Marks, Pending Requests).
- **Chart.js Visualizations**: Interactive Doughnut chart for Attendance status breakdown & Bar chart for Subject Performance.
- Dynamic Empty State handling (no misleading fallback graphs).

### 👥 Student Directory
- Manage student records (First/Last Name, Enrollment Date, Phone, Address, Date of Birth).
- Unlinked account badges & user account linking.
- Instant search filter by name or email.

### 📅 Attendance Log
- Track daily student attendance status (`PRESENT`, `ABSENT`, `LATE`).
- Visual 3-button status selector.
- CSV Data Export functionality.
- Faculty submission & Admin approval pipeline.

### 📚 Academic Marks & Marksheet
- Subject-wise score management (`marksObtained` / `totalMarks`).
- Auto-calculated Grades (`O`, `A+`, `A`, `B+`, `B`, `C`, `D`, `F`) and inline percentage progress bars.
- **Printable Report Cards / Marksheets**: High-resolution printable marksheet view with PDF save support.

### 📋 Pending Approvals Workflow (Admin Only)
- Single-click **Approve All** & **Clear All** bulk approval actions.
- Individual approval/rejection per attendance or marks request.

### 🔔 Real-time Notifications
- Header notification dropdown with unread badge counter.
- **Read All** single-click action to clear pending notifications.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend Core** | React 19, Vite, JavaScript (ES6+) |
| **Routing & HTTP** | React Router DOM v7, Axios |
| **Styling & UI** | TailwindCSS v4, Custom Design System (Glassmorphic surfaces, Inter & Plus Jakarta Sans fonts) |
| **Data Visualization** | Chart.js, react-chartjs-2, Lucide React Icons |
| **Backend Runtime** | Node.js (v18+) |
| **Backend Framework**| Express.js |
| **Database Engine** | MySQL (with `mysql2/promise` connection pooling) |
| **Database Seeder** | Custom Auto-Seeder (`initDb.js`) |
| **Auth & Security** | JSON Web Tokens (`jsonwebtoken`), `bcryptjs`, `cors` |

---

## 🏗️ Project Architecture

```
Student Management Portal/
├── smartedu-backend/         # Node.js + Express.js + MySQL REST API
│   ├── config/               # Database pool & initDb seeder
│   ├── controllers/          # Request handlers
│   ├── middleware/           # JWT authentication & RBAC guards
│   ├── routes/               # Express API routes
│   ├── services/             # SQL query & business logic layer
│   ├── schema.sql            # Database DDL schema
│   ├── server.js             # Express server entry point
│   └── package.json
│
└── smartedu-frontend/        # React 19 + Vite Frontend
    ├── src/
    │   ├── components/       # Navbar, Sidebar, Layout, NotificationDropdown
    │   ├── context/          # AuthContext provider
    │   ├── pages/            # Dashboard, Students, Attendance, Marks, Approvals, Profile, Login, Register
    │   ├── services/         # Axios API instance
    │   └── index.css         # Custom design system & tokens
    ├── package.json
    └── vite.config.js
```

---

## 🚦 Getting Started

### Prerequisites
- **Node.js** (v18.0.0 or higher)
- **MySQL Server** (v8.0 or higher)

### 1. Database Setup
Create a MySQL database named `smartedu` (or configure your credentials in `.env`):
```sql
CREATE DATABASE smartedu;
```

### 2. Backend Setup
```bash
cd smartedu-backend
npm install
```

Create a `.env` file in `smartedu-backend/`:
```env
PORT=9999
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=smartedu
JWT_SECRET=your_jwt_secret_key
```

Run the dev server (auto-creates tables and seeds demo accounts):
```bash
npm run dev
```

### 3. Frontend Setup
```bash
cd smartedu-frontend
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## 🔑 Recruiter Demo Accounts

| Role | Username | Password |
|---|---|---|
| **Administrator** | `admin` | `admin123` |
| **Faculty Member** | `teacher` | `teacher123` |
| **Student** | `student` | `student123` |

---

## 📄 License
This project is open source and available under the [MIT License](LICENSE).
