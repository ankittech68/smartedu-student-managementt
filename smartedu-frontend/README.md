# SmartEdu - Student Management Portal

## Overview

SmartEdu is a full-stack Student Management Portal designed to streamline academic administration and improve communication between students, teachers, and administrators.

The platform enables secure authentication, student record management, attendance tracking, marks management, notifications, and role-based access control through an intuitive web interface.

## Features

### Authentication & Security

* JWT-based Authentication
* Role-Based Authorization
* Secure Password Encryption using BCrypt
* Protected Routes

### Student Module

* Student Dashboard
* View Attendance Records
* View Academic Marks
* Profile Management
* Notification Center

### Teacher Module

* Manage Student Attendance
* Upload Marks
* View Student Information
* Academic Tracking

### Admin Module

* User Management
* Student Management
* Teacher Management
* System Monitoring
* Notification Management

### Notifications

* Real-time Academic Notifications
* Registration Alerts
* System Announcements

---

# Technology Stack

## Frontend

* React.js
* Vite
* React Router
* Axios
* Tailwind CSS

## Backend

* Java
* Spring Boot
* Spring Security
* JWT Authentication
* Spring Data JPA
* Hibernate

## Database

* PostgreSQL (Production)
* MySQL (Development)

## Deployment

* Frontend: Vercel
* Backend: Render
* Database: Render PostgreSQL

---

# Architecture

```text
                    ┌─────────────────┐
                    │     Client      │
                    │ React + Vite UI │
                    └────────┬────────┘
                             │
                             │ HTTPS
                             ▼
                    ┌─────────────────┐
                    │ Spring Boot API │
                    │ Authentication  │
                    │ Business Logic  │
                    └────────┬────────┘
                             │
                             │ JPA/Hibernate
                             ▼
                    ┌─────────────────┐
                    │ PostgreSQL DB   │
                    │ Student Records │
                    │ Attendance      │
                    │ Marks           │
                    │ Notifications   │
                    └─────────────────┘
```

---

# Project Structure

```text
smartedu-student-management/

├── smartedu-frontend/
│   ├── src/
│   ├── public/
│   ├── components/
│   ├── pages/
│   ├── context/
│   ├── services/
│   └── assets/
│
├── smartedu-backend/
│   ├── controller/
│   ├── service/
│   ├── repository/
│   ├── model/
│   ├── dto/
│   ├── security/
│   └── config/
│
└── README.md
```

---

# How to Run Locally

## Frontend Setup

```bash
cd smartedu-frontend
npm install
npm run dev
```

Frontend runs at:

```text
http://localhost:5173
```

---

## Backend Setup

```bash
cd smartedu-backend
mvn clean install
mvn spring-boot:run
```

Backend runs at:

```text
http://localhost:9999
```

---

# Environment Variables

## Frontend (.env)

```env
VITE_API_URL=https://smartedu-backend1.onrender.com/api
```

## Backend

```env
SPRING_DATASOURCE_URL=<postgres-url>
SPRING_DATASOURCE_USERNAME=<username>
SPRING_DATASOURCE_PASSWORD=<password>

JWT_SECRET=<secret-key>
JWT_EXPIRATION_MS=86400000
```

---

# API Endpoints

## Authentication

```http
POST /api/auth/signup
POST /api/auth/signin
```

## Students

```http
GET /api/students
POST /api/students
PUT /api/students/{id}
DELETE /api/students/{id}
```

## Attendance

```http
GET /api/attendance
POST /api/attendance
```

## Marks

```http
GET /api/marks
POST /api/marks
```

---

# Key Design Decisions

### JWT Authentication

Implemented stateless authentication for scalability and security.

### Role-Based Access Control

Separate dashboards and permissions for Admin, Teacher, and Student users.

### PostgreSQL Deployment

Production database migrated to PostgreSQL for cloud deployment compatibility.

### RESTful Architecture

Backend designed using REST APIs for easy frontend-backend integration.

---

# Trade-offs

### Chosen

* JWT Authentication
* PostgreSQL Cloud Database
* React Context API
* Spring Security

### Not Implemented

* Redis Caching
* WebSocket Notifications
* File Storage Service
* Microservices Architecture

These were intentionally excluded to keep the project manageable while maintaining production-level functionality.

---

# Future Enhancements

* Real-Time Notifications
* Student Performance Analytics
* PDF Report Generation
* Email Notifications
* Mobile Application
* AI-Based Academic Insights

---

# Deployment Links

Frontend:
https://smartedu-student-management.vercel.app

Backend:
https://smartedu-backend1.onrender.com

---

# Author

Ankit

B.Tech Computer Science & Engineering

Lovely Professional University
