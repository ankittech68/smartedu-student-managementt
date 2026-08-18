# 🎓 SmartEdu - Student Management Portal

> **A placement-ready, full-stack enterprise web application** built with **React 19 + Node.js + Express.js + MySQL**. SmartEdu streamlines academic administration with role-based dashboards, attendance tracking, marks management, approval workflows, and real-time notifications.

[![GitHub Repo](https://img.shields.io/badge/GitHub-smartedu--student--managementt-181717?logo=github&style=flat-square)](https://github.com/ankittech68/smartedu-student-managementt)
![React](https://img.shields.io/badge/React-19-61dafb?logo=react&style=flat-square)
![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&style=flat-square)
![Express.js](https://img.shields.io/badge/Express.js-4-000000?logo=express&style=flat-square)
![MySQL](https://img.shields.io/badge/MySQL-8.0-4479a1?logo=mysql&style=flat-square)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-06b6d4?logo=tailwindcss&style=flat-square)

---

## � Production Deployment (NEW!)

> **Your SmartEdu application is now production-ready!** Complete deployment guides and configuration templates are included.

### 📚 Deployment Documentation

| Guide | Purpose | Time |
|---|---|---|
| [**DEPLOYMENT_COMPLETE_SUMMARY.md**](./DEPLOYMENT_COMPLETE_SUMMARY.md) | ⭐ **START HERE** - Complete summary of files changed, env vars needed, and deployment steps | 5 min |
| [**PRODUCTION_DEPLOYMENT.md**](./PRODUCTION_DEPLOYMENT.md) | Step-by-step deployment guide for Render + MySQL + Vercel | 1-2 hours |
| [**DATABASE_EXPORT_IMPORT.md**](./DATABASE_EXPORT_IMPORT.md) | How to export local database and import to production MySQL | 30 min |
| [**VERCEL_FRONTEND_DEPLOYMENT.md**](./VERCEL_FRONTEND_DEPLOYMENT.md) | How to update frontend API URL and deploy to Vercel | 15 min |
| [**PRODUCTION_REFERENCE.md**](./PRODUCTION_REFERENCE.md) | Quick reference: env variables, Render settings, Vercel settings, troubleshooting | Ongoing |

### 🎯 Quick Deployment Checklist

1. **Read** `DEPLOYMENT_COMPLETE_SUMMARY.md` (overview of everything needed)
2. **Export** local database: Follow `DATABASE_EXPORT_IMPORT.md`
3. **Create** cloud MySQL: PlanetScale, Railway, or AWS RDS
4. **Deploy** backend: Render Web Service with Node.js
5. **Update** frontend: Set `VITE_API_URL` to your Render backend
6. **Test** everything: Use guides in `PRODUCTION_REFERENCE.md`

### ✅ What's Already Done

- ✓ Node.js Express server configured for cloud deployment
- ✓ MySQL connection pool with proper error handling
- ✓ JWT authentication secure and configurable
- ✓ CORS properly set up for production
- ✓ `.gitignore` blocks all `.env` files (secrets safe)
- ✓ Database schema exported and ready
- ✓ Docker support ready (Dockerfile included)

### 🔧 What You Need To Do

1. Export local database backup (SQL file)
2. Create managed MySQL (PlanetScale/Railway/AWS)
3. Deploy backend to Render
4. Update frontend API URL
5. Test production stack

**Total Time**: 2-4 hours | **Downtime**: None | **Cost**: Free tier available

---

## �📸 Application Preview

| Login Page | Admin Dashboard | Students Page |
|---|---|---|
| Dark glassmorphic login with 1-click demo presets | Live stat cards + Chart.js analytics | Searchable student table with inline edit |

| Marks & Marksheet | Attendance Log | Approvals Panel |
|---|---|---|
| Auto-grade + Printable PDF report card | 3-status selector + CSV export | Bulk Approve All / Clear All |

---

## 🌟 Key Features

### 🔐 Authentication & Security
- **JWT (JSON Web Token)** stateless session management
- **BCrypt.js** salted password hashing (10 salt rounds)
- **Role-Based Access Control (RBAC)**: Distinct permissions for `ADMIN`, `TEACHER`, and `STUDENT`
- **Protected Client Routes**: Automatic redirect & unauthorized access prevention
- **1-Click Recruiter Demo Login**: Instant login pre-sets for Admin, Faculty, and Student roles
- **Password Visibility Toggle**: Eye/EyeOff toggle on Login & Register pages

### 📊 Dashboard & Analytics
- Real-time stat summary cards (Total Students, Attendance Rate, Average Marks, Pending Requests)
- **Chart.js Visualizations**: Interactive Doughnut chart for Attendance breakdown & Bar chart for Subject Performance
- **Smart Empty States**: No misleading fallback charts when no data is recorded yet

### 👥 Student Directory
- Manage student records: First/Last Name, Enrollment Date, Phone, Address, Date of Birth
- Unlinked account badges & user account linking
- Instant real-time search filter by name or email
- CSV export of student records

### 📅 Attendance Log
- Daily attendance marking: `PRESENT` / `ABSENT` / `LATE`
- Visual 3-button inline status selector
- Per-record Edit & Delete support
- Faculty submission → Admin approval pipeline
- **CSV Data Export** functionality

### 📚 Academic Marks & Marksheet
- Subject-wise score management (`marksObtained` / `totalMarks`)
- Auto-calculated letter grades: `O`, `A+`, `A`, `B+`, `B`, `C`, `D`, `F`
- Inline percentage progress bars per subject
- **Printable Report Cards**: High-resolution printable marksheet with PDF save support via `window.print()`
- Subject-based filter dropdown & keyword search

### 📋 Pending Approvals Workflow (Admin Only)
- Separate approval queues for Attendance Requests and Marks Requests
- Single-click **✓ Approve All** (all pending items approved in bulk)
- Single-click **✗ Clear All** (all pending items rejected in bulk)
- Individual approval/rejection per record

### 🔔 Notifications
- Header notification bell with live unread badge counter (auto-refreshes every 30 seconds)
- **Read All** single-click clears all unread notifications
- Per-notification mark-as-read action

### 🧑‍💼 Profile Management
- User account overview card with gradient avatar, role badge, and account status
- Inline Edit Profile modal (username + email update)
- Secure session info display

### 📝 Create Account (Multi-Step Registration)
- **Step 1**: Username, Email, Password with real-time 4-bar strength meter
- **Step 2**: Visual role card selector (Student 🟢 / Faculty 🟣 / Admin 🔵)
- Step progress indicator with animated transitions

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend Core** | React 19, Vite 8, JavaScript (ES6+) |
| **Routing** | React Router DOM v7 |
| **HTTP Client** | Axios (auto-injecting JWT Bearer token) |
| **Styling** | TailwindCSS v4, Custom CSS Design System |
| **UI Fonts** | Google Fonts: `Inter`, `Plus Jakarta Sans` |
| **Icons** | Lucide React |
| **Charts** | Chart.js, `react-chartjs-2` |
| **Notifications** | React Hot Toast |
| **Backend Runtime** | Node.js (v18+) |
| **Backend Framework** | Express.js |
| **Database** | MySQL 8.0 |
| **DB Driver** | `mysql2/promise` (async connection pooling) |
| **Auto Seeder** | Custom `initDb.js` (creates schema + demo accounts) |
| **Authentication** | `jsonwebtoken`, `bcryptjs` |
| **Security** | `cors`, role-based middleware guards |
| **Dev Tooling** | `nodemon` (backend), Vite HMR (frontend) |

---

## 🏗️ Project Architecture

```
Student Management Portal/
├── README.md                     # ← You are here
├── .gitignore
│
├── smartedu-backend/             # Node.js + Express.js + MySQL REST API
│   ├── config/
│   │   ├── db.js                 # mysql2 connection pool
│   │   └── initDb.js             # Auto schema creation + demo account seeder
│   ├── controllers/              # Request handlers
│   │   ├── authController.js
│   │   ├── studentController.js
│   │   ├── attendanceController.js
│   │   ├── marksController.js
│   │   ├── approvalController.js
│   │   ├── notificationController.js
│   │   └── userController.js
│   ├── middleware/
│   │   ├── authMiddleware.js     # JWT verification
│   │   ├── roleMiddleware.js     # RBAC role guard
│   │   └── errorMiddleware.js
│   ├── routes/                   # Express route definitions
│   ├── services/                 # SQL logic layer
│   ├── utils/
│   │   └── jwt.js                # Token helpers
│   ├── schema.sql                # Database DDL
│   ├── server.js                 # Express entry point (Port 9999)
│   └── package.json
│
└── smartedu-frontend/            # React 19 + Vite SPA
    ├── src/
    │   ├── components/
    │   │   ├── Layout.jsx
    │   │   ├── Sidebar.jsx
    │   │   ├── Navbar.jsx
    │   │   └── NotificationDropdown.jsx
    │   ├── context/
    │   │   └── AuthContext.jsx   # Global auth state + JWT storage
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   ├── Dashboard.jsx
    │   │   ├── Students.jsx
    │   │   ├── Attendance.jsx
    │   │   ├── Marks.jsx
    │   │   ├── Approvals.jsx
    │   │   └── Profile.jsx
    │   ├── services/
    │   │   └── api.js            # Axios instance with JWT interceptor
    │   └── index.css             # Custom design tokens & utilities
    ├── index.html
    ├── vite.config.js
    └── package.json
```

---

## 🚦 Getting Started

### ✅ Prerequisites
- **Node.js** v18.0.0 or higher → [Download](https://nodejs.org)
- **MySQL Server** v8.0 or higher → [Download](https://dev.mysql.com/downloads/)
- **Git** → [Download](https://git-scm.com/)

---

### Step 1: Clone the Repository
```bash
git clone https://github.com/ankittech68/smartedu-student-managementt.git
cd smartedu-student-managementt
```

---

### Step 2: Database Setup
Open MySQL and create the database:
```sql
CREATE DATABASE smartedu;
```
> 💡 The `initDb.js` seeder will **automatically create all tables** and insert demo accounts when the backend starts for the first time.

---

### Step 3: Backend Setup
```bash
cd smartedu-backend
npm install
```

Create a `.env` file inside `smartedu-backend/`:
```env
PORT=9999
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=smartedu
JWT_SECRET=your_super_secret_jwt_key_here
```

Start the development server:
```bash
npm run dev
```
> ✅ Server runs on `http://localhost:9999`. Tables and demo accounts are created automatically.

---

### Step 4: Frontend Setup
```bash
cd ../smartedu-frontend
npm install
npm run dev
```
> ✅ App runs on `http://localhost:5173`

---

## 🔑 Recruiter Demo Accounts

| Role | Username | Password | Access Level |
|---|---|---|---|
| **🔴 Administrator** | `admin` | `admin123` | Full access: All modules, Approvals, User management |
| **🟣 Faculty Member** | `teacher` | `teacher123` | Add/Edit: Attendance & Marks, View Students |
| **🟢 Student** | `student` | `student123` | View Only: Own Attendance, Marks, Profile |

> 💡 These credentials are pre-loaded on backend startup by `initDb.js`.

---

## 🔌 REST API Overview

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/login` | ❌ | User login → returns JWT |
| `POST` | `/api/auth/register` | ❌ | Register new account |
| `GET` | `/api/students` | ✅ | Get all students |
| `POST` | `/api/students` | ✅ ADMIN/TEACHER | Add new student |
| `PUT` | `/api/students/:id` | ✅ ADMIN/TEACHER | Update student |
| `DELETE` | `/api/students/:id` | ✅ ADMIN | Delete student |
| `GET` | `/api/attendance` | ✅ | Get attendance records |
| `POST` | `/api/attendance` | ✅ ADMIN/TEACHER | Mark attendance |
| `PUT` | `/api/attendance/:id/approve` | ✅ ADMIN | Approve attendance |
| `GET` | `/api/marks` | ✅ | Get marks records |
| `POST` | `/api/marks` | ✅ ADMIN/TEACHER | Add subject marks |
| `PUT` | `/api/marks/:id/approve` | ✅ ADMIN | Approve marks |
| `GET` | `/api/approvals/pending` | ✅ ADMIN | Get all pending requests |
| `PUT` | `/api/approvals/approve-all` | ✅ ADMIN | Bulk approve all |
| `PUT` | `/api/approvals/reject-all` | ✅ ADMIN | Bulk clear all |
| `GET` | `/api/notifications` | ✅ | Get user notifications |
| `PUT` | `/api/notifications/read-all` | ✅ | Mark all as read |

---

## 🎨 UI Design System

The frontend features a premium custom design system built on TailwindCSS:

- **Dark Sidebar** (`slate-950`) with gradient SmartEdu branding
- **Glassmorphic Cards** with `backdrop-filter: blur` and subtle border highlights
- **Custom Utility Classes**: `.glass-card`, `.glass-input`, `.btn-primary`, `.btn-secondary`, `.badge`, `.modal-overlay`
- **Consistent Badge System**: Role & status badges (indigo, emerald, amber, rose, purple variants)
- **Smooth Micro-animations**: `animate-fade-in-up` page transitions, button hover lifts, modal slide-in
- **Typography**: Google Fonts `Inter` (body) + `Plus Jakarta Sans` (headings)
- **Color Palette**: Indigo/Violet gradient brand, semantic status colors across all components

---

## 👤 Author

**Ankit** — [@ankittech68](https://github.com/ankittech68)

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<div align="center">
  <strong>⭐ Star this repo if it helped you! ⭐</strong>
</div>
