# 🐳 Docker + MongoDB Atlas Production Deployment Guide (Render)

This project is configured to run as a **Docker container** on Render, connected to **MongoDB Atlas Cloud Database**.

---

## 🏗️ Architecture Overview

```
 ┌───────────────────────────┐         ┌───────────────────────────┐
 │   Render Static Site      │         │   Render Docker Web       │
 │   (React + Vite Frontend) │  ────>  │   (Express + Mongoose)    │
 └───────────────────────────┘         └─────────────┬─────────────┘
                                                     │
                                                     ▼
                                       ┌───────────────────────────┐
                                       │   MongoDB Atlas Cloud     │
                                       │   (Managed MongoDB DB)    │
                                       └───────────────────────────┘
```

---

## Step 1: Set up MongoDB Atlas (Free Cloud Database)

1. Sign up / Log in to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a **Free M0 Shared Cluster**.
3. Under **Database Access**: Create a Database User (Username & Password).
4. Under **Network Access**: Add IP Address `0.0.0.0/0` (Allow Access from Anywhere).
5. Click **Database** ➔ **Connect** ➔ **Drivers** (Node.js) and copy your connection string:
   ```text
   mongodb+srv://<username>:<password>@cluster0.xxxx.mongodb.net/school_mgmt?retryWrites=true&w=majority
   ```

---

## Step 2: Deploy to Render via Blueprint (`render.yaml`)

1. Commit and push your code to **GitHub**:
   ```bash
   git add .
   git commit -m "Update project for Docker + MongoDB Atlas deployment"
   git push origin main
   ```

2. Open [Render Dashboard](https://dashboard.render.com).
3. Click **New +** ➔ **Blueprint**.
4. Connect your GitHub repository. Render will automatically read `render.yaml` and create 2 services:
   - 🐳 `school-mgmt-backend` (Docker Web Service)
   - ⚡ `school-mgmt-frontend` (Static Site)

5. Fill in Environment Variables in Render Dashboard for `school-mgmt-backend`:

| Key | Value / Description |
|---|---|
| `MONGO_URI` | `mongodb+srv://<user>:<pass>@cluster0.xxxx.mongodb.net/school_mgmt?retryWrites=true&w=majority` |
| `CLIENT_URL` | `https://school-mgmt-frontend.onrender.com` |
| `EMAIL_HOST` | `smtp.gmail.com` |
| `EMAIL_PORT` | `587` |
| `EMAIL_USER` | `your_gmail@gmail.com` |
| `EMAIL_PASS` | `your_16_char_google_app_password` |
| `EMAIL_FROM` | `your_gmail@gmail.com` |

6. Click **Apply**. Render will build the Docker container for the backend and deploy the React frontend static site.

---

## Step 3: Local Docker Testing (Optional)

If you want to test running the Docker container locally connected to MongoDB Atlas:

```bash
cd backend
docker build -t school-backend .
docker run -p 5000:5000 -e MONGO_URI="mongodb+srv://<user>:<pass>@cluster0.xxxx.mongodb.net/school_mgmt?retryWrites=true&w=majority" school-backend
```
