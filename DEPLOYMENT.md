# 🚀 Complete Render.com Dual Deployment Guide

This guide explains how to deploy **BOTH the Backend API and the Frontend Web App** on Render.com using the included `render.yaml` Blueprint.

---

## Step 1: Push Code to GitHub / GitLab

Make sure your project repository is committed and pushed to GitHub.

```bash
git add .
git commit -m "Configure dual deployment for Render"
git push origin main
```

---

## Step 2: Deploy Both Services via Render Blueprint

1. Go to [Render Dashboard](https://dashboard.render.com).
2. Click **New +** (top right) → Select **Blueprint**.
3. Connect your GitHub repository.
4. Render will automatically read `render.yaml` and create **2 services**:
   - 🔹 **`school-mgmt-backend`** (Node.js Web Service)
   - 🔹 **`school-mgmt-frontend`** (Static Site with SPA rewrite rules)

---

## Step 3: Configure Environment Variables in Render Dashboard

Fill in the environment variables for each service in the Render UI:

### A. For `school-mgmt-backend`:
| Key | Required Value / Description |
|---|---|
| `MONGO_URI` | Your MongoDB Atlas connection URI (e.g., `mongodb+srv://user:pass@cluster.mongodb.net/school_mgmt`) |
| `CLIENT_URL` | Your live frontend Render URL (e.g., `https://school-mgmt-frontend.onrender.com`) |
| `EMAIL_USER` | `pkeshav282@gmail.com` |
| `EMAIL_PASS` | `zovi lqbo mdgm xsmr` (Google 16-char App Password) |
| `EMAIL_FROM` | `pkeshav282@gmail.com` |

### B. For `school-mgmt-frontend`:
| Key | Required Value / Description |
|---|---|
| `VITE_API_URL` | Your live backend Render URL (e.g., `https://school-mgmt-backend.onrender.com`) |

---

## Step 4: Click "Apply" & Verify

1. Render will build and deploy both services automatically.
2. Open your live frontend URL (`https://school-mgmt-frontend.onrender.com`).
3. Login using `admin@school.com` / `password123` or your credentials.
4. Test OTP email delivery to your Gmail inbox!
