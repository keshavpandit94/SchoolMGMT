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

---

## 🚀 Recent System Upgrades & Redesign (July 2026)

### 1. Visual & Aesthetic Redesign (Indian Luxury Theme)
We transformed the interface from a generic bootstrap-style layout into a high-end, premium dashboard with an elegant Indian aesthetic:
- **Colors**: Adopted a royal custom palette using Midnight Indigo (deep background), Royal Saffron (primary accents), Peacock Teal (secondary highlights), and subtle Sandalwood Gold details.
- **Background**: Integrated a beautiful repeating Mandala pattern background overlay with soft glowing amber diya backdrops.
- **Typography**: Implemented the serif typeface **'Marcellus'** for titles and headers to give a premium, authentic feel.
- **Glassmorphic Cards**: Designed modern transparent container cards with saffron-glowing border highlights.

### 2. Added Features & Enhancements
- **Principal Account Registration**: Added a selector in the registration modal to directly create "School Principal" and "System Admin" accounts. Unrelated support-staff fields (e.g. shift, department) are hidden dynamically when selecting these roles.
- **Leave & Suspension Dialog Forms**: Changing status to "On Leave" or "Suspended" now prompts the user with a dialog to provide the **Reason (Why)** and **Duration (in Days)**.
- **Principal Approval Workflow**:
  - Principals can directly mark teachers or staff "On Leave".
  - If a Principal attempts to **Delete (Fire)** or set status to **Suspended**, **Resigned**, or **Retired**, the request is saved in a pending state.
  - Admin accounts can review these pending requests with their reasons/durations and click **Approve** or **Reject** directly from the roster table.
- **Touch Kiosk Security PIN Controls**:
  - **Auto-Generation**: Security PINs are automatically generated as random 4-digit numbers on creation and are read-only.
  - **Role Restriction**: Only Admin accounts are authorized to modify a user's Security PIN during editing.
  - **14-Day Lock**: Implemented a security rule restricting Security PIN changes to a maximum of once every 14 days (both front-end and back-end enforced).

### 3. Removed Features
- **Manual Save Attendance Button**: Removed the bulk "Save Attendance" button as attendance entries are logged dynamically by the check-in systems.
- **Self Check-in Kiosk Sidebar Tab**: Hidden the "Self Check-in Kiosk" navigation tab from the dashboard sidebar layout.
- **Bulk Attendance Marks**: Removed the "Mark All Present" and "Mark All Absent" buttons from both Student and Staff/Teacher lists to ensure high integrity and prevent manual spoofing of records.
- **Manual Attendance Edits**: Replaced the clickable ButtonGroup status toggle elements in the tables with read-only **Status Chips** (Present, Absent, Late, On Leave) to prevent manual override errors.

### 4. Technical Implementation Summary
#### Database Schema Updates
- **User Model**: Added `pinUpdatedAt` (Date) to track security PIN modifications.
- **Teacher & Staff Models**: Added fields for leaf/suspension metadata and approval flows:
  - `statusReason` / `statusDuration`
  - `pendingStatus` / `pendingReason` / `pendingDuration`

#### API Endpoint Modifications
- `PATCH /api/teachers/:id/status` & `PATCH /api/staff/:id/status`: Integrated role checks and request logic.
- `PATCH /api/teachers/:id/approve-status` & `PATCH /api/staff/:id/approve-status` **[NEW]**: Allows Admins to approve/reject status changes or deletion requests.
- `PUT /api/teachers/:id` & `PUT /api/staff/:id`: Enforced the 14-day PIN change rules and Admin role restrictions.
- `DELETE /api/teachers/:id` & `DELETE /api/staff/:id`: Modified to submit pending requests under Principal accounts.

