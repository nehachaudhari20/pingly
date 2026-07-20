# AI Collaboration Log

## Overview

This project was built using an AI-assisted engineering workflow. Rather than using AI to generate the entire application in one go, I used it throughout the development lifecycle to understand the assignment, plan the architecture, break the implementation into manageable tasks, generate boilerplate, debug issues, refine the frontend, and prepare the final documentation.

All generated code was manually reviewed, modified where required, tested locally, and integrated incrementally into the project.

---

# AI Tech Stack

| Tool | Model | Purpose |
|------|-------|---------|
| ChatGPT | GPT-5.5 | Understanding the assignment, architecture planning, backend design, README, engineering discussions |
| Claude | Sonnet 5 | Breaking the implementation into structured engineering tasks and milestones |
| Cursor | Composer 2.5 | Implementing individual backend/frontend tasks, iterative code generation|
| Codex | 5.6 Terra | Debugging, code edits |
| Bolt | Bolt Agent | Generating the initial React dashboard UI and component structure |

---

# The Prompts that Shipped It

The following are representative prompts used during the development of the project.

---

## 1. Understanding the Assignment (ChatGPT)

```text
Read the assignment carefully and explain exactly what they are asking for, what will actually be evaluated, what features are mandatory vs optional, and how you would approach building it.
```

---

## 2. Planning the Product (ChatGPT)

```text
okay got it, now can you give me the modified plan for the product details like the solution in depth, so i can plan accordingly. like everything solution features approach tech stack repo docker cloud etc and all. also the name of the product as Pingly.
```

---

## 3. Breaking the Project into Tasks (Claude)

```text
I have finalized the architecture. Break this project into small engineering tasks that can be completed one by one.

Each task should:

- build on the previous one
- be independently testable
- avoid changing unrelated files
- be suitable for individual Git commits
- keep the project as a strict MVP
- follow good engineering practices

Generate the complete implementation roadmap from project setup until final Docker deployment.
```

---

## 4. Backend Implementation (Cursor)

### Task 3

```text
Implement Task 3.

Create the SQLAlchemy database setup, session management, Base model, and SQLite configuration.

Do not modify unrelated files.

Follow the existing project structure.
```

---

### Task 4

```text
Implement Task 4.

Create Website and HealthCheck SQLAlchemy models along with their relationships.

Generate clean, production-ready code that follows the existing architecture.
```

---

### Task 5

```text
Implement Task 5.

Build CRUD APIs for website management using FastAPI.

Include:

- Add Website
- List Websites
- Delete Website

Use proper request validation and response models.
```

---

## 5. Frontend Generation (Bolt)

```text
Build a modern, production-quality frontend for a project called **Pingly**.

## About the Project

Pingly is a lightweight website uptime monitoring platform. It allows users to register websites they want to monitor and provides a clean dashboard showing the health of each website in near real time.

The purpose of the application is to give users a simple way to answer questions like:

• Is my website currently online?
• How quickly is it responding?
• When was it last checked?
• What has its recent health history been?

Think of it as a simplified version of Better Stack, UptimeRobot, or Pingdom.

The backend is already fully implemented using FastAPI. Build ONLY the frontend. Do not generate backend code, database models, or API implementations.

Use:

- React
- Vite
- TypeScript
- Tailwind CSS
- Axios

Create:

- Dashboard
- Summary cards
- Website table
- Add Website modal
- History drawer
- Responsive SaaS UI
```

---

## 6. Frontend Iterations (Bolt)

```text
Add a live current time in the navigation bar.

Improve the dashboard spacing.

Make the history drawer cleaner.

Improve empty states.

Add better loading states and toast notifications.

The UI should feel closer to Better Stack and Linear.
```

---

## 7. Docker Setup (Cursor)

```text
Generate Dockerfiles for both backend and frontend and create a docker-compose.yml so the complete application runs using a single docker compose up --build command.
```

---

## 8. Testing & Verification

```text
Give me a few URLs that reliably return a DOWN state so I can verify the monitoring logic and document the testing steps in the README.
```

---

# Course Corrections

Throughout development, AI suggestions were reviewed critically and refined where necessary.

---

## 1. Simplifying the Overall Architecture

### Initial AI Suggestion

Because many of my previous projects involved distributed systems, the initial architecture leaned toward a much larger production-grade system including:

- Kafka
- Microservices
- Background workers
- CSV bulk uploads
- Website scraping
- Distributed monitoring
- Cloud-native deployment across multiple providers
- Detailed infrastructure documentation

### Issue

The assignment specifically asked for a **strict MVP** focused on engineering quality rather than production scale.

This architecture introduced unnecessary complexity and increased implementation scope.

### Resolution

The architecture was simplified considerably.

Prompt used:

```text
This feels like over-engineering for the assignment.

Let's simplify everything.

Keep it as a clean MVP.

Remove distributed components, Kafka, bulk upload, unnecessary cloud architecture and focus only on what the assignment actually evaluates.
```

---

## 2. Deployment Documentation

### Initial AI Suggestion

The README initially included detailed deployment guides covering:

- AWS ECS
- EC2
- Railway
- Render
- Cloud Run
- CloudFront
- Deployment checklist
- Infrastructure recommendations

### Issue

The assignment only requested a brief deployment sketch.

### Resolution

The documentation was reduced to a lightweight deployment architecture diagram together with a short explanation describing how the application could be hosted on a cloud provider.

---

## 3. Unknown Monitoring State

### Initial AI Suggestion

The frontend initially displayed an **Unknown** monitoring state before the first successful health check.

### Issue

After reviewing the assignment and backend behavior, websites receive an immediate health check once they are added.

Therefore an Unknown state would never actually be visible to users.

### Resolution

The UI was simplified to only display:

- Healthy
- Down

making it consistent with the backend implementation.

---

## 4. Bulk Website Upload

### Initial AI Suggestion

Bulk CSV upload was suggested as an additional feature.

### Issue

Although useful, it was outside the scope of the assignment and conflicted with the "strict MVP" requirement.

### Resolution

The feature was intentionally removed to keep the implementation focused.

---

## 5. SQLAlchemy ORM Error

### Problem

During development the backend failed with:

```text
sqlalchemy.exc.InvalidRequestError:

expression 'HealthCheck' failed to locate a name
```

### Resolution

Using AI-assisted debugging, the ORM relationships and import order were reviewed.

The issue was resolved by ensuring all ORM models were imported before mapper configuration and database initialization.

---

## 6. FastAPI Endpoint Validation

### Problem

While integrating the frontend, a few API responses did not match the expected payload shape.

### Resolution

The FastAPI implementation was reviewed alongside the official FastAPI documentation.

Response models and endpoint behavior were corrected before connecting the frontend.

---

# Engineering Validation

AI-generated code was never accepted without verification.

The following validation steps were performed throughout development:

- Backend APIs tested using Swagger UI
- Manual API testing using HTTP requests
- Frontend interactions validated against backend responses
- Docker setup verified using `docker compose up --build`
- Scheduler verified through automatic monitoring
- Manual "Check Now" functionality tested
- Monitoring history validated
- Dashboard summary verified
- Healthy and unreachable URLs tested to confirm both UP and DOWN states
- End-to-end testing performed before finalizing the project

---

# Reflection

AI significantly accelerated planning, boilerplate generation, debugging, documentation, and frontend iteration throughout this project. However, architectural decisions, implementation strategy, feature prioritization, integration, testing, debugging, and final engineering decisions remained manual responsibilities.

Rather than relying on AI to generate the complete solution, it was used as a collaborative engineering assistant throughout the development process. Every generated output was reviewed, refined, and validated before being incorporated into the final implementation.