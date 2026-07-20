# 🚀 Pingly

**Pingly** is a lightweight, full-stack website uptime monitoring application that periodically checks the availability of registered websites and displays their latest health status, HTTP status codes, response times, and historical monitoring data through a modern dashboard.

Built as a production-quality MVP using **FastAPI**, **React**, **SQLite**, and **Docker Compose**.

---

# ✨ Features

## Backend

- Register websites for uptime monitoring
- Automatic health checks every 60 seconds using APScheduler
- Manual **Check Now** monitoring
- Stores every health check with:
  - Website status (Healthy / Down)
  - HTTP status code
  - Response time
  - Timestamp
- Dashboard summary API
- Website monitoring history
- Soft delete for monitored websites
- Duplicate URL protection

---

## Frontend

- Modern responsive uptime monitoring dashboard
- Dashboard summary cards showing:
  - Total Websites
  - Healthy Websites
  - Down Websites
  - Average Response Time
- Website management (Add & Delete)
- Website monitoring table displaying:
  - Website URL
  - Current Status
  - HTTP Status Code
  - Response Time
  - Last Checked Time
- Manual **Check Now** action
- Website history drawer with chronological monitoring history
- Toast notifications
- Loading & empty states
- Clean SaaS-inspired UI

---

# 🛠 Tech Stack

## Backend

- FastAPI
- SQLAlchemy
- APScheduler
- SQLite
- HTTPX
- Pydantic

## Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- Axios

## DevOps

- Docker
- Docker Compose

---

# 📁 Project Structure

```text
pingly/
│
├── backend/
│   ├── app/
│   ├── Dockerfile
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   ├── Dockerfile
│   └── package.json
│
├── docker-compose.yml
├── README.md
└── AI_LOG.md
```

---

# 🚀 Getting Started

## Prerequisites

Before running the project, ensure:

- Docker Desktop is installed.
- Docker Desktop is **running**.
- Git is installed.

---

## Clone the Repository

```bash
git clone <repository-url>
```

---

## Navigate to the Project

```bash
cd pingly
```

---

## Start the Entire Application

Run:

```bash
docker compose up --build
```

This starts:

- React Frontend
- FastAPI Backend
- SQLite persistence

---

## Open the Application

Frontend

```
http://localhost:5173
```

Backend API

```
http://localhost:8000
```

Swagger Documentation

```
http://localhost:8000/docs
```

---

## Stop the Application

```bash
docker compose down
```

---

# 🧪 System Verification

To verify the application behaves correctly:

---

## Step 1 — Add a Healthy Website

Click **Add Website**

Enter:

```
https://example.com
```

Expected Result:

- Website appears in dashboard
- Status becomes **Healthy**
- HTTP Status Code displayed
- Response Time displayed
- Dashboard summary updates

---

## Step 2 — Add an Unreachable Website

Add:

```
http://localhost:9999
```

(or any unreachable URL)

Expected Result:

- Website appears
- Status becomes **Down**
- Failed response recorded
- Dashboard updates accordingly

---

## Step 3 — Trigger Manual Monitoring

Click:

```
Check Now
```

Expected Result:

- New health check runs immediately
- Latest status updates
- History drawer displays the new record

---

## Step 4 — View Monitoring History

Click any website row.

Expected Result:

- History drawer opens
- Previous health checks are displayed
- Latest checks appear first

---

## Step 5 — Delete a Website

Delete any monitored website.

Expected Result:

- Website disappears from dashboard
- Dashboard summary refreshes automatically

---

# 📡 Monitoring Workflow

```text
User
   │
   ▼
React Dashboard
   │
REST API
   ▼
FastAPI Backend
   │
Scheduler (Every 60 Seconds)
   │
HTTP Request
   ▼
Target Website
   │
Store Health Check
   ▼
SQLite Database
   │
Dashboard Summary
   ▼
Frontend
```

---

# 📖 API Overview

| Method | Endpoint | Description |
|---------|----------|-------------|
| GET | `/` | Health Check |
| POST | `/api/websites` | Register Website |
| GET | `/api/websites` | List Active Websites |
| DELETE | `/api/websites/{id}` | Delete Website |
| POST | `/api/websites/{id}/check` | Run Manual Health Check |
| GET | `/api/websites/{id}/status` | Latest Website Status |
| GET | `/api/websites/{id}/history` | Monitoring History |
| GET | `/api/dashboard` | Dashboard Summary |

Swagger UI:

```
http://localhost:8000/docs
```

---

# ☁️ Deployment Sketch

For a lightweight cloud deployment, the application can be hosted using the following architecture:

```text
                 Internet
                     │
                     ▼
            Load Balancer / Nginx
                     │
          ┌──────────┴──────────┐
          │                     │
          ▼                     ▼
   React Frontend         FastAPI Backend
      (Vite)              (Scheduler + API)
                                 │
                                 ▼
                      SQLite (MVP) / PostgreSQL
```

### Example Cloud Deployment

| Component | Service |
|----------|---------|
| Frontend | AWS S3 + CloudFront |
| Backend | AWS EC2 or ECS |
| Database | SQLite (MVP) or PostgreSQL (Production) |
| Reverse Proxy | Nginx |

For production, SQLite can be replaced with PostgreSQL while keeping the overall application architecture unchanged.

---

# 🚀 Future Improvements

Potential enhancements beyond the MVP:

- Authentication
- Email / Slack alerts
- SSL certificate monitoring
- Response time analytics
- Search & filtering
- Custom monitoring intervals
- Notification integrations
- Multi-user workspaces

---

# 🤖 AI Collaboration

The AI-assisted development process, prompts, engineering decisions, and course corrections are documented in:

```
AI_LOG.md
```