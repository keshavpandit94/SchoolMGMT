# EduManage - School Management System

EduManage is a secure, role-based School Management System built using the MERN Stack (Node.js, Express, MongoDB, React, TypeScript). It features granular Role-Based Access Control (RBAC), multi-factor email verification (OTP), real-time updates via Socket.io, and is containerized using Docker for deployment pipelines.

---

## 🏗 System Architecture & RBAC Matrix

The system enforces four distinct user roles, ensuring secure segregation of duties:

| Role | Students CRUD | Inventory CRUD | Faculty Directory CRUD | Support Staff CRUD |
| :--- | :---: | :---: | :---: | :---: |
| **Admin** | ✅ Full CRUD | ✅ Full CRUD | ✅ Full CRUD | ✅ Full CRUD |
| **Principal** | ✅ Full CRUD | ✅ Full CRUD | ✅ Full CRUD | ✅ Full CRUD |
| **Teacher** | ✅ Full CRUD | ✅ Full CRUD | 👁 READ ONLY | 👁 READ ONLY |
| **Staff** | 👁 READ ONLY | ✅ Full CRUD | 👁 READ ONLY | 👁 READ ONLY |

- **Dual-Factor Authentication**: Authenticated logins trigger a secondary one-time verification passcode (OTP) dispatched using Nodemailer (with a console fallback for simulated environments).
- **Firebase Auth Google Sign-In**: Users can authenticate using Google OAuth. The backend validates their Firebase ID Tokens against Google's public certificates. If the email is registered in the school directory, it maps and links the credentials.

---

## 📂 Project Structure

```text
school-management-system/
├── .github/
│   └── workflows/
│       └── ci-cd.yml             # GitHub Actions for testing & Docker validation
├── backend/
│   ├── src/
│   │   ├── config/               # MongoDB Connection & Nodemailer setup
│   │   ├── controllers/          # Controllers (Auth, Student, Teacher, Staff, Inventory)
│   │   ├── middlewares/          # JWT, Role check, and Error handler
│   │   ├── models/               # Mongoose Schemas
│   │   ├── routes/               # Express endpoints
│   │   ├── utils/                # OTP & Firebase certificate verifier
│   │   └── server.js             # Server init & Socket.io wrapper
│   ├── Dockerfile
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/           # Sidebar layout & Protected routes guards
│   │   ├── context/              # Auth context (2FA & user states)
│   │   ├── hooks/                # useSocket hook
│   │   ├── pages/                # Dashboards, Login, Student, Inventory interfaces
│   │   ├── services/             # Axios client & Firebase setup
│   │   └── App.tsx
│   ├── Dockerfile
│   ├── package.json
│   └── .env.example
├── docker-compose.yml            # Developer orchestration
└── README.md
```

---

## 🛠 Local Setup Instructions

### Prerequisites
- [Node.js](https://nodejs.org/) v20+
- [Docker & Docker Compose](https://www.docker.com/)

### 1. Development Orchestration (Docker Compose)
To spin up all services (MongoDB, Backend Node service, Frontend Vite hot reloads) simultaneously, run:
```bash
docker-compose up --build
```
- Frontend will be active at: `http://localhost:5173`
- Backend API will be active at: `http://localhost:5000`

### 2. Manual/Local Dev Setup
#### Backend
1. Go to backend: `cd backend`
2. Create `.env` from example: `copy .env.example .env`
3. Install dependencies: `npm install`
4. Spin up server: `npm run dev`

#### Frontend
1. Go to frontend: `cd frontend`
2. Create `.env` from example: `copy .env.example .env`
3. Install dependencies: `npm install`
4. Spin up Vite: `npm run dev`

---

## 🔑 Initial Setup / Seeding

On an empty database, you must bootstrap the first administrator account:
1. Load `http://localhost:5173/login` in your browser.
2. Click **Fill Admin credentials** (developer shortcut) or fill a custom email/password.
3. The server will detect the empty database and register you as the bootstrap **Admin** user.
4. For logins, the OTP verification screen will appear. If you haven't configured a custom SMTP server, find the simulated verification code in the **backend server logs / console output**.
5. Once logged in, use the sidebar to manage students, register other teachers, staff, or log resource assets.

---

## 🧪 Testing

### Backend Jest Tests
To run API mocked unit tests:
```bash
cd backend
npm test
```

### Frontend Vitest Tests
To run front-end component tests:
```bash
cd frontend
npm run test
```
