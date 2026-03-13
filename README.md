# AttendScan — QR Code Attendance & Verification System

A full-stack web app for real-time QR-code-based attendance tracking.

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Fill in .env at the repo root
#    DATABASE_URL=postgresql://...

# 3. Run everything with one command
npm run dev
# → Backend:  http://localhost:5000
# → Frontend: http://localhost:5173
```

**Required root `.env` values:**
| Variable | Description |
|---|---|
| `DATABASE_URL` | Your PostgreSQL connection string |
| `JWT_SECRET` | A long random secret (change before production) |
| `ADMIN_EMAIL` | Admin login email (default: `admin@qr.com`) |
| `ADMIN_PASSWORD` | Admin login password (default: `admin123`) |
| `FRONTEND_URL` | Frontend origin for CORS (default: `http://localhost:5173`) |
| `VITE_API_URL` | Frontend API base URL (use `/api` for Vercel) |

---

## 📱 Usage

| URL | Description |
|---|---|
| `/scanner` | QR camera scanner (public) |
| `/login` | Admin login |
| `/admin` | Dashboard with stats |
| `/admin/register` | Register a new user + generate QR |
| `/admin/attendance` | Attendance logs with filters + CSV export |

**Default admin credentials:** `admin@qr.com` / `admin123`

---

## 🗂️ Project Structure

```
event-scanner/
├── package.json        ← Root scripts (npm run dev starts everything)
├── backend/            ← Node.js + Express backend
│   ├── controllers/    — Business logic
│   ├── routes/         — Express routers
│   ├── middleware/     — JWT auth + rate limiting
│   ├── prisma/         — Prisma schema + migrations
│   └── server.js
├── public/             ← Vite public assets
└── src/                ← React + Vite frontend
    ├── pages/          — Scanner, Admin, Register, Attendance, Login
    ├── components/     — Navbar, ProtectedRoute
    ├── context/        — AuthContext (JWT)
    └── services/       — Axios API client
```

---

## 🔐 Security

- QR codes encode **only a UUID** — no PII ever in the QR
- Admin routes protected by JWT middleware
- Rate limiting on `/api/scan/verify` (30 req/min per IP)
- MongoDB sanitization via `express-mongo-sanitize`
- CORS restricted to configured frontend origin

---

## 🌐 Deployment (Vercel)

- The root `vercel.json` builds the Vite app and routes `/api/*` to the Express backend.
- Add the same `.env` values in the Vercel project settings.

# cloud-vision-scanner
