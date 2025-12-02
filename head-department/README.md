# Department Head Service - University Platform

A complete microservice for managing university department operations including timetables, subjects, groups, teachers, students, requests, and analytics.

## 🏗️ Architecture

This is a standalone microservice with:
- **Backend**: Node.js + Express + PostgreSQL
- **Frontend**: React + React Router
- **Authentication**: JWT (handled by separate auth service)

## 📋 Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## 🚀 Quick Start



### 2. Backend Setup

```bash
cd backend
npm install
npm start
```

The backend will run on `http://localhost:5000`

### 3. Frontend Setup

```bash
cd frontend
npm install
npm start
```

The frontend will run on `http://localhost:3000`

## 📁 Project Structure

```
head/
├── backend/
│   ├── config/
│   │   └── database.js          # PostgreSQL connection
│   ├── controllers/             # Business logic
│   │   ├── dashboardController.js
│   │   ├── timetableController.js
│   │   ├── subjectsController.js
│   │   ├── groupsController.js
│   │   ├── teachersController.js
│   │   ├── studentsController.js
│   │   ├── requestsController.js
│   │   ├── analyticsController.js
│   │   ├── roomsController.js
│   │   ├── levelsController.js
│   │   └── specialtiesController.js
│   ├── middleware/
│   │   └── auth.js              # JWT authentication
│   ├── routes/                  # API routes
│   │   ├── dashboardRoutes.js
│   │   ├── timetableRoutes.js
│   │   ├── subjectsRoutes.js
│   │   ├── groupsRoutes.js
│   │   ├── teachersRoutes.js
│   │   ├── studentsRoutes.js
│   │   ├── requestsRoutes.js
│   │   ├── analyticsRoutes.js
│   │   ├── roomsRoutes.js
│   │   ├── levelsRoutes.js
│   │   └── specialtiesRoutes.js
│   ├── .env                     # Environment variables
│   ├── package.json
│   └── server.js                # Entry point
│
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/
    │   │   └── Layout.js        # Main layout with sidebar
    │   ├── context/
    │   │   └── AuthContext.js   # Authentication context
    │   ├── pages/               # React pages
    │   │   ├── Login.js
    │   │   ├── Dashboard.js
    │   │   ├── Timetable.js
    │   │   ├── Subjects.js
    │   │   ├── Groups.js
    │   │   ├── Teachers.js
    │   │   ├── Students.js
    │   │   ├── Requests.js
    │   │   └── Analytics.js
    │   ├── services/
    │   │   └── api.js           # Axios instance
    │   ├── App.js
    │   ├── index.js
    │   └── index.css
    ├── .env
    └── package.json
```

## 🔌 API Endpoints

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/dashboard/activity` - Get recent activity
- `GET /api/dashboard/upcoming-sessions` - Get upcoming sessions

### Timetable
- `GET /api/timetable` - Get all timetable slots
- `GET /api/timetable/:id` - Get timetable slot by ID
- `POST /api/timetable` - Create new timetable slot
- `PUT /api/timetable/:id` - Update timetable slot
- `DELETE /api/timetable/:id` - Delete timetable slot
- `GET /api/timetable/conflicts` - Check for conflicts

### Subjects
- `GET /api/subjects` - Get all subjects
- `GET /api/subjects/:id` - Get subject by ID
- `POST /api/subjects` - Create new subject
- `PUT /api/subjects/:id` - Update subject
- `DELETE /api/subjects/:id` - Delete subject

### Groups
- `GET /api/groups` - Get all groups
- `GET /api/groups/:id` - Get group by ID
- `POST /api/groups` - Create new group
- `PUT /api/groups/:id` - Update group
- `DELETE /api/groups/:id` - Delete group

### Teachers
- `GET /api/teachers` - Get all teachers
- `GET /api/teachers/:id` - Get teacher by ID
- `GET /api/teachers/:id/stats` - Get teacher statistics

### Students
- `GET /api/students` - Get all students
- `GET /api/students/:id` - Get student by ID
- `GET /api/students/:id/stats` - Get student statistics

### Requests
- `GET /api/requests/absence` - Get all absence requests
- `GET /api/requests/absence/:id` - Get absence request by ID
- `POST /api/requests/absence/:id/approve` - Approve absence request
- `POST /api/requests/absence/:id/reject` - Reject absence request
- `GET /api/requests/makeup-sessions` - Get all makeup sessions

### Analytics
- `GET /api/analytics/absences` - Get absence analytics
- `GET /api/analytics/room-occupancy` - Get room occupancy analytics
- `GET /api/analytics/teacher-workload` - Get teacher workload analytics
- `GET /api/analytics/student-performance` - Get student performance analytics
- `GET /api/analytics/summary` - Get department summary

### Rooms
- `GET /api/rooms` - Get all rooms
- `GET /api/rooms/:id` - Get room by ID
- `GET /api/rooms/check-availability` - Check room availability

### Levels
- `GET /api/levels` - Get all levels
- `GET /api/levels/:id` - Get level by ID

### Specialties
- `GET /api/specialties` - Get all specialties
- `GET /api/specialties/:id` - Get specialty by ID

## 🔐 Authentication

All API endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

The token should be obtained from the separate authentication service.

## 🎨 Frontend Features

- **Dashboard**: Overview with statistics and recent activity
- **Timetable Management**: Create, view, edit, and delete timetable slots with conflict detection
- **Subjects Management**: Manage courses and subjects
- **Groups Management**: Manage student groups
- **Teachers**: View faculty members and their workload
- **Students**: View enrolled students
- **Requests**: Approve/reject absence requests, view makeup sessions
- **Analytics**: Comprehensive analytics including:
  - Teacher workload analysis
  - Room occupancy analysis
  - Student performance metrics
  - Absence trends

## 🛠️ Technologies Used

### Backend
- Express.js - Web framework
- PostgreSQL - Database
- pg - PostgreSQL client
- jsonwebtoken - JWT authentication
- bcryptjs - Password hashing
- cors - Cross-origin resource sharing
- helmet - Security headers
- morgan - HTTP request logger

### Frontend
- React - UI library
- React Router - Routing
- Axios - HTTP client
- Context API - State management
