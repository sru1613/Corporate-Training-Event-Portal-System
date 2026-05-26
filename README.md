# Corporate Training Event Portal

A full-stack MERN application for managing corporate training events, employee registrations, attendance tracking, feedback collection, and training materials — all in one place.


## Overview

I built this portal to solve a real need in corporate environments: a centralized, role-based platform where HR admins, trainers, and employees can seamlessly manage the end-to-end lifecycle of training programs. The system supports three distinct user roles, each with their own dashboard and tailored feature set.


## Features

### Role-Based Access
- **Admin** — Full control over users, events, reports, notifications, and feedback analysis
- **Trainer** — Manage assigned events, mark attendance, upload training materials
- **Employee** — Browse & register for events, track attendance, submit feedback, download materials

### Core Modules
- **Authentication** — JWT-based login, password change, profile management
- **Training Events** — Create, edit, cancel events with category, mode (Online/Offline/Hybrid), schedule, and trainer assignment
- **Registrations** — Employees register for events; automatic waitlist management when capacity is full
- **Attendance** — Trainers mark bulk attendance per session; employees view their own history
- **Training Materials** — Upload/download PDFs, presentations, videos, and documents per event
- **Feedback & Ratings** — Star-rated feedback on trainer, content, and overall experience
- **Notifications** — Real-time in-app notifications for registrations, updates, material uploads
- **Reports & Analytics** — Admin dashboard with charts for event trends, attendance rates, participation stats, completion reports, feedback analysis, and trainer performance


## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite |
| Routing | React Router v6 |
| Charts | Recharts |
| Icons | React Icons (Material Design) |
| HTTP Client | Axios |
| Notifications | React Toastify |
| Date Handling | date-fns |
| Backend | Node.js + Express 4 |
| Database | MongoDB Atlas + Mongoose 8 |
| Authentication | JWT + bcryptjs |
| File Upload | Multer |



## Project Structure


corporatetrainingeventportals/
├── client/                    # React + Vite frontend
│   ├── src/
│   │   ├── components/
│   │   │   └── common/        # Layout, Sidebar, Topbar, Loader
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── admin/         # Dashboard, Users, Events, Reports, Feedback, Notifications
│   │   │   ├── trainer/       # Dashboard, Events, Attendance, Materials
│   │   │   ├── employee/      # Dashboard, Browse Events, Registrations, Attendance, Feedback, Materials
│   │   │   ├── Login.jsx
│   │   │   ├── Profile.jsx
│   │   │   └── NotFound.jsx
│   │   ├── services/
│   │   │   └── api.js         # Axios API service layer
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── server/                    # Node.js + Express backend
│   ├── config/
│   │   └── db.js              # MongoDB connection
│   ├── controllers/           # Business logic (9 controllers)
│   ├── middleware/
│   │   ├── auth.js            # JWT protect + role authorize
│   │   └── upload.js          # Multer file upload config
│   ├── models/                # Mongoose models (7 models)
│   ├── routes/                # Express routes (9 route files)
│   ├── uploads/               # Uploaded training materials
│   ├── seed.js                # Database seeder
│   ├── server.js              # Express app entry point
│   └── package.json
│
└── .gitignore


## Getting Started

### Prerequisites
- Node.js 18+
- npm 9+
- MongoDB Atlas account 

### Installation

**1. Clone the repository**
```bash
git clone https://github.com/digambark34/corporate-training-event-portals.git
cd corporate-training-event-portals
```

**2. Set up the backend**
```bash
cd server
npm install
```

Create a `.env` file inside `server/`:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=30d
CLIENT_URL=http://localhost:5173


**3. Set up the frontend**
```bash
cd ../client
npm install
```

**4. Seed demo users**
```bash
cd ../server
node seed.js
```



## Running the Application

Open two terminals:

**Terminal 1 — Backend (port 5000)**
```bash
cd server
node server.js


**Terminal 2 — Frontend (port 5173)**
```bash
cd client
npm run dev


Open your browser at **http://localhost:5173**



## Color Palette

The entire UI is built on a custom deep blue and cyan palette:

| Variable | Color | Hex |
|---|---|---|
| `--deep-twilight` | Deep Navy | `#03045e` |
| `--french-blue` | French Blue | `#023e8a` |
| `--bright-teal-blue` | Teal Blue | `#0077b6` |
| `--blue-green` | Blue Green | `#0096c7` |
| `--turquoise-surf` | Turquoise | `#00b4d8` |
| `--sky-aqua` | Sky Aqua | `#48cae4` |
| `--frosted-blue` | Frosted Blue | `#90e0ef` |
| `--frosted-blue-2` | Frosted Blue 2 | `#ade8f4` |
| `--light-cyan` | Light Cyan | `#caf0f8` |



## API Endpoints

| Prefix | Description |
|---|---|
| `/api/auth` | Login, register, profile, password |
| `/api/users` | User management (admin) |
| `/api/events` | Training event CRUD |
| `/api/registrations` | Event registrations |
| `/api/attendance` | Attendance tracking |
| `/api/feedback` | Feedback submission and analysis |
| `/api/materials` | File upload and download |
| `/api/notifications` | In-app notifications |
| `/api/reports` | Analytics and reports (admin) |




