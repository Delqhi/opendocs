# 03-INFRA-DOCKER-MIGRATION.md - Infrastructure Plan

> **Goal**: Containerize the new Go backend and React frontend for seamless deployment.

## 🐳 Docker Architecture

We will use Docker Compose to orchestrate the services.

```yaml
services:
  backend:
    build: ./backend
    ports:
      - "8080:8080"
    environment:
      - DB_URL=...
      - JWT_SECRET=...
    depends_on:
      - db

  frontend:
    build: ./frontend (or serve static build)
    ports:
      - "3000:80"
    depends_on:
      - backend

  db:
    image: supabase/postgres (or standard postgres)
    ports:
      - "5432:5432"
    volumes:
      - db_data:/var/lib/postgresql/data

  n8n:
    image: n8nio/n8n
    ports:
      - "5678:5678"
```

## 📝 Implementation Tasks

### 1. Backend Dockerfile
*   [x] Create `backend/Dockerfile`.
*   [x] Multi-stage build (Build -> Run) for minimal image size.
*   [x] Use `alpine` or `distroless` base image.

### 2. Frontend Dockerfile
*   [x] Create `Dockerfile` for frontend (if serving via Nginx/Caddy).
*   [x] Configure Nginx for SPA routing.

### 3. Docker Compose
*   [x] Update `docker-compose.yml` to include the new Go backend service.
*   [x] Configure networking between services.

### 4. CI/CD (GitHub Actions)
*   [x] **Build**: Build Docker images on push.
*   [x] **Test**: Run Go tests and React tests.
*   [x] **Deploy**: Push images to registry and deploy to server (e.g., VPS, Cloud).

## 🚀 DevEx Goals
*   One command setup: `docker-compose up`.
*   Hot reloading for both Frontend (Vite) and Backend (Air).
