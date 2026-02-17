# 01-BACKEND-GO-ARCHITECTURE.md - Go Migration Plan

> **Goal**: Migrate backend logic from Supabase Edge Functions/Monolith to a high-performance Go service.

## 🏗️ Architecture (Go Standard Layout)

We will adopt the standard Go project layout for maintainability and scalability.

```text
backend/
├── cmd/
│   └── server/
│       └── main.go        # Entry point
├── internal/
│   ├── api/               # API Handlers & Routes
│   │   ├── handlers/
│   │   ├── middleware/
│   │   └── router.go
│   ├── config/            # Configuration (Env vars)
│   ├── db/                # Database Access (Supabase/Postgres)
│   ├── models/            # Data Models
│   └── services/          # Business Logic
├── pkg/                   # Public Libraries (if any)
├── go.mod                 # Module definition
└── go.sum                 # Dependencies
```

## 📝 Implementation Tasks

### 1. Initialization
*   [x] Create `backend/` directory.
*   [x] Run `go mod init github.com/jeremy/ai-autonomous-webshop/backend`.
*   [x] Install essential dependencies:
    *   `github.com/gin-gonic/gin` (or `echo`, `chi` - we'll use Gin for speed/ecosystem).
    *   `github.com/joho/godotenv` (Env vars).
    *   `gorm.io/gorm` (ORM) or `github.com/jackc/pgx` (Raw SQL - preferred for perf).

### 2. Core Infrastructure
*   [x] **Config**: Implement `internal/config` to load env vars.
*   [x] **Database**: Implement `internal/db` to connect to Supabase PostgreSQL.
*   [x] **Router**: Set up Gin router in `internal/api/router.go`.
*   [x] **Middleware**: Auth middleware (JWT validation), CORS, Logger.

### 3. Feature Migration (Supabase -> Go)
*   [x] **Auth**: User registration, login, session management (integrate with Supabase Auth or custom).
*   [x] **Catalog**: Product listing, search, details.
*   [x] **Cart**: Add/remove items, update quantities.
*   [x] **Orders**: Checkout process, order creation, payment integration.
*   [x] **Admin**: Dashboard stats, product management.

### 4. API Design (RESTful)
*   `GET /api/v1/products`
*   `GET /api/v1/products/:id`
*   `POST /api/v1/cart`
*   `POST /api/v1/checkout`
*   `GET /api/v1/orders`

## 🚀 Performance Goals
*   < 50ms API response time.
*   Concurrent request handling (Goroutines).
*   Efficient DB queries (Indexing, Prepared Statements).
