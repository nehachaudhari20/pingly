# Pingly

**Pingly** is a lightweight, self-hostable uptime monitoring platform for engineering teams. Add website URLs, monitor them automatically in the background, and view live status, response times, and historical health checks from a clean dashboard.

Built as a production-quality MVP with a maintainable architecture, strong typing, and Docker-first deployment.

---

## Features

- **Website management** — Add and remove monitored URLs from the dashboard
- **Automatic monitoring** — Background scheduler pings all active websites every **60 seconds**
- **Manual checks** — Trigger an on-demand health check with **Check Now**
- **Live status** — View current **UP / DOWN** state and latest HTTP status code
- **Response time tracking** — Measure and display response time in milliseconds
- **Check history** — Paginated timeline of past health checks per website
- **Dashboard summary** — Total sites, healthy/down counts, and average response time
- **Duplicate protection** — Prevents adding the same URL twice
- **Self-hosted** — Runs entirely with Docker Compose; no external SaaS dependencies

---

| Layer | Responsibility |
|---|---|
| **Frontend** | Dashboard UI, website CRUD, history drawer, live clock |
| **FastAPI** | REST API, CORS, request validation |
| **APScheduler** | Concurrent background health checks every 60s |
| **httpx** | Async HTTP pings with 10s timeout |
| **SQLite** | Persistent storage for websites and health checks |

### Data model

**Website**
| Field | Type | Description |
|---|---|---|
| `id` | int | Primary key |
| `url` | string | Monitored URL |
| `created_at` | datetime | When the site was added |
| `is_active` | bool | Soft-delete flag |

**HealthCheck**
| Field | Type | Description |
|---|---|---|
| `id` | int | Primary key |
| `website_id` | int | Foreign key → Website |
| `status` | enum | `up` or `down` |
| `status_code` | int \| null | HTTP status code |
| `response_time_ms` | float \| null | Round-trip latency |
| `checked_at` | datetime | Timestamp of the check |

---

## Tech stack

### Backend
- Python 3.12
- FastAPI
- SQLAlchemy 2.0
- SQLite
- APScheduler
- httpx
- Pydantic
- Uvicorn

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS
- nginx (production serving)

### Infrastructure
- Docker
- Docker Compose

---

## Quick start (Docker — recommended)

**Prerequisites:** [Docker Desktop](https://www.docker.com/products/docker-desktop/) (or Docker Engine + Compose v2)

From the project root:

```bash
docker compose up --build
```

| Service | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:8000 |
| API health | http://localhost:8000/ → `{"message":"Pingly Backend Running"}` |

Stop the stack:

```bash
docker compose down
```

To remove persisted data (SQLite volume):

```bash
docker compose down -v
```

---

## Local development (without Docker)

### Backend

```bash
cd backend
python -m venv .venv

# Windows
.venv\Scripts\activate
# macOS / Linux
source .venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173. The frontend defaults to `http://127.0.0.1:8000` for API calls.

---

## Environment variables

### Backend

| Variable | Default | Description |
|---|---|---|
| `DATABASE_URL` | `sqlite:///./pingly.db` | SQLAlchemy database URL |
| `CORS_ORIGINS` | `http://localhost:5173,http://127.0.0.1:5173` | Comma-separated allowed frontend origins |

### Frontend (build-time)

| Variable | Default | Description |
|---|---|---|
| `VITE_API_BASE_URL` | `http://127.0.0.1:8000` | Backend API URL baked into the production build |

> **Note:** `VITE_*` variables are embedded at **build time**. Changing the API URL in production requires rebuilding the frontend image.

---

## API reference

Base URL: `http://localhost:8000`

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | Health probe |
| `GET` | `/api/dashboard` | Dashboard summary with latest status per website |
| `GET` | `/api/websites` | List active websites |
| `POST` | `/api/websites` | Add a website (`{"url": "https://example.com"}`) |
| `DELETE` | `/api/websites/{id}` | Deactivate a website |
| `GET` | `/api/websites/{id}/status` | Latest status for one website |
| `POST` | `/api/websites/{id}/check` | Trigger a manual health check |
| `GET` | `/api/websites/{id}/history?page=1&limit=20` | Paginated check history |

Interactive docs: http://localhost:8000/docs

---

## Project structure

```
pingly/
├── backend/
│   ├── app/
│   │   ├── api/           # FastAPI route handlers
│   │   ├── database/      # SQLAlchemy engine, session, Base
│   │   ├── models/        # Website, HealthCheck ORM models
│   │   ├── schemas/       # Pydantic request/response models
│   │   ├── services/      # Ping logic, URL normalization
│   │   ├── main.py        # App entry point, CORS, scheduler lifespan
│   │   └── scheduler.py   # 60s background monitoring job
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/    # UI components
│   │   ├── pages/         # Dashboard page
│   │   ├── services/      # API client
│   │   └── utils/         # Formatting helpers
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── nginx.conf
└── docker-compose.yml     # Full-stack orchestration
```

---

## Deploying to a cloud provider

This MVP is containerized and stateless on the frontend; the backend holds state in SQLite via a Docker volume. Below is a practical deployment approach I would use for a small production rollout.

### Recommended topology

```
Internet
    │
    ▼
┌──────────────┐
│ Load balancer │  (HTTPS termination)
└──────┬───────┘
       │
   ┌───┴───┐
   ▼       ▼
Frontend  Backend
(nginx)   (FastAPI + scheduler)
              │
              ▼
         Persistent volume
         (SQLite file)
```

### Option A — Single VM (simplest MVP deploy)

Best for: demos, internal tools, low-traffic self-hosting.

**Providers:** AWS EC2, Google Compute Engine, Azure VM, DigitalOcean Droplet, Hetzner Cloud

1. **Provision a VM** (Ubuntu 22.04+, 1 vCPU / 1 GB RAM minimum)
2. **Install Docker** and Docker Compose
3. **Clone the repository** onto the VM
4. **Configure environment** in `docker-compose.yml`:
   ```yaml
   environment:
     CORS_ORIGINS: https://pingly.yourdomain.com
   ```
   Rebuild frontend with:
   ```yaml
   args:
     VITE_API_BASE_URL: https://api.pingly.yourdomain.com
   ```
5. **Run the stack:**
   ```bash
   docker compose up -d --build
   ```
6. **Put nginx or Caddy in front** for HTTPS (Let's Encrypt)
7. **Open firewall ports** 80/443 only; keep 8000 internal if using a reverse proxy

**Pros:** Minimal cost, full control, matches local Docker workflow  
**Cons:** Single point of failure; you manage OS patches and backups

---

### Option B — Managed containers (balanced)

Best for: small teams wanting managed infra without Kubernetes complexity.

**Providers:** AWS ECS/Fargate, Google Cloud Run, Azure Container Apps, Railway, Render, Fly.io

#### Backend service
- Deploy `backend/Dockerfile` as a long-running service (must stay up for APScheduler)
- Mount a **persistent volume** for `/app/data` (SQLite)
- Set env vars: `DATABASE_URL`, `CORS_ORIGINS`
- Expose port 8000 behind HTTPS

#### Frontend service
- Deploy `frontend/Dockerfile` as a static web service
- Pass build arg: `VITE_API_BASE_URL=https://api.yourdomain.com`
- Map port 80 to public HTTPS URL

#### Example: Railway / Render
1. Create two services from the same repo (different Dockerfiles / root paths)
2. Attach a persistent disk to the backend service at `/app/data`
3. Set custom domains: `app.yourdomain.com` (frontend), `api.yourdomain.com` (backend)
4. Update `CORS_ORIGINS` and rebuild frontend with the public API URL

**Pros:** Auto-restarts, managed TLS, easy scaling of frontend  
**Cons:** SQLite on a single backend instance — not ideal for multi-replica scaling

---

### Option C — AWS (production-minded path)

Best for: teams already on AWS who may grow beyond MVP.

| Component | AWS service |
|---|---|
| Frontend | S3 + CloudFront (build static assets with `npm run build`) |
| Backend | ECS Fargate or EC2 |
| Database | **Upgrade to RDS PostgreSQL** (recommended before scaling) |
| Secrets | AWS Secrets Manager or SSM Parameter Store |
| TLS | ACM certificate on ALB or CloudFront |
| Logs | CloudWatch |

**Deployment steps (high level):**
1. Push images to **ECR**
2. Run backend on **ECS Fargate** with an EFS or EBS volume (or migrate to RDS)
3. Build frontend with `VITE_API_BASE_URL` pointing to the ALB/API domain
4. Upload `dist/` to **S3**, serve via **CloudFront**
5. Configure **ALB** health checks on `GET /`
6. Set `CORS_ORIGINS` to the CloudFront domain

> For a true production deployment, I would replace SQLite with **PostgreSQL** and run Alembic migrations. The current MVP intentionally uses SQLite for simplicity and self-hosting.

---

### Pre-deployment checklist

- [ ] Set `CORS_ORIGINS` to your production frontend URL(s)
- [ ] Rebuild frontend with correct `VITE_API_BASE_URL`
- [ ] Ensure backend volume persistence for SQLite (`/app/data`)
- [ ] Put HTTPS in front of both services
- [ ] Restrict backend port exposure (API need not be public if same-origin proxied)
- [ ] Configure backups for the SQLite volume (or migrate to PostgreSQL)
- [ ] Set up uptime monitoring *on Pingly itself* via an external checker (dogfooding gap for MVP)
- [ ] Review scheduler: only one backend replica should run the 60s job (avoid duplicate checks if scaling horizontally)

---

## Health check logic

- Sends an HTTP `GET` with **10s timeout**, follows redirects
- **UP** — response status code `< 500`
- **DOWN** — network error, timeout, or status `>= 500`
- Response time measured wall-clock from request start to response received

---

## Limitations (MVP scope)

- SQLite is suitable for single-instance deployments; not designed for multi-replica backend scaling
- No authentication or multi-tenancy
- No alerting (email, Slack, PagerDuty)
- No SSL certificate expiry or content validation checks
- Scheduler runs in-process with the API server

These are intentional MVP boundaries and natural extension points for future iterations.

---

## License

MIT (or specify your license here)
