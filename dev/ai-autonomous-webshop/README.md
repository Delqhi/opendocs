# NEXUS AI Shop — README.md (Feb 2026)

> 🚀 **The World's Most Advanced Autonomous AI-Driven Storefront.**

NEXUS is a production-ready, global commerce platform designed for 2026. It combines high-conversion retail design (Amazon-style) with a fully autonomous backend (Supabase + n8n + AI).

---

## ✨ 2026 High-End Features

### 🛍️ Unified Global Shop
*   **Retail Excellence**: Amazon-benchmark design with high-conversion Hero Sliders, Flash Deals, and Visual Category Teasers.
*   **Adaptive UX**: Panel-based A11y (Font Scaling, Contrast, Motion) and Voice Command Mode.
*   **Collaborative Cart**: Generate shared session links for co-shopping.
*   **Predictive UX**: Micro-moment tab-recovery notifications.

### 🤖 AI Orchestration
*   **User-Pays Chatbot**: Integrated Puter.js for anonymous, zero-cost buyer support.
*   **Multi-Model Admin**: NVIDIA / Kimi K2.5 Multimodal LLM for backoffice automations.
*   **AI Scout**: Real-time trend sourcing from TikTok and Amazon.
*   **Dynamic Pricing**: AI-driven margin optimization.

### 🦾 Autonomous Operations
*   **Fulfillment Autopilot**: Direct supplier API integration via Supabase Edge Functions.
*   **Workflow Engine**: n8n-powered automation for complex fulfillment chains.
*   **Identity Bridge**: OpenClaw for social auth and messaging without vendor lock-in.
*   **Live Dashboard**: Real-time KPIs calculated from the core database.

### 🔐 Enterprise Infrastructure (v2.0 - Feb 2026)
*   **CI/CD Pipeline**: GitHub Actions (ci, release, codeql, dependabot, e2e, load-test)
*   **Logging**: Pino + Winston with structured logging and file rotation
*   **Docker**: Multi-stage builds optimization (deps → builder → runner)
*   **Monitoring**: Prometheus + Grafana dashboard
*   **Backup**: PostgreSQL + Redis daily backups (7-day retention)
*   **Load Testing**: k6 stress tests (basic, stress, API)
*   **Rate Limiting**: Express middleware with Redis store
*   **Caching**: Redis + LRU in-memory fallback
*   **Health Checks**: /health, /live, /ready, /health/detailed endpoints
*   **SSL/TLS**: Let's Encrypt auto-renewal + HSTS headers
*   **CDN**: Cloudflare middleware integration
*   **API Versioning**: v1/v2 with deprecation headers
*   **WebSocket**: Socket.io with rooms/channels
*   **Email**: Nodemailer + Handlebars templates
*   **File Upload**: S3-compatible with presigned URLs
*   **Search**: Elasticsearch full-text search
*   **Authentication**: OAuth2 (Google, GitHub) + JWT
*   **Authorization**: RBAC (admin > moderator > user > guest)
*   **Audit Logging**: Immutable audit trail
*   **Feature Flags**: Boolean, percentage, variant (A/B)
*   **A/B Testing**: Experiment tracking with winner selection
*   **E2E Tests**: Playwright test suite (65 tests)
*   **User Onboarding**: 6-step interactive wizard
*   **API Documentation**: Typedoc with GitHub Pages

---

## 🔑 Demo Access
| Role | Credentials |
|:---|:---|
| **Admin** | `demo` / `demo` (Link in Footer) |
| **User** | `user@test.com` / `password` |

---

## 🚀 Quick Setup (CEO Guide)

1.  **Docker Start**:
    ```bash
    docker-compose up -d
    ```
2.  **Database Setup**:
    *   Copy contents of `docs/sql/001_core_schema.sql` into Supabase SQL Editor.
3.  **Config**:
    *   Add Supabase URL/Key in **Admin -> Settings**.
4.  **Go Live**:
    *   Check `USER-PLAN.md` for the final 3 steps.

---

## 📁 Technical Documentation
*   **[ARCHITECTURE.md](./ARCHITECTURE.md)**: Full project map and data flows.
*   **[SUPABASE.md](./SUPABASE.md)**: Database and Edge Function setup.
*   **[OPENCLAW.md](./OPENCLAW.md)**: Identity and Social messaging bridge.
*   **[N8N.md](./N8N.md)**: Workflow automation guide.
*   **[ONBOARDING.md](./ONBOARDING.md)**: Onboarding guide for owners and devs.
*   **[API-ENDPOINTS.md](./API-ENDPOINTS.md)**: Complete API reference with versioning.

---

## 🧪 Testing & Quality Assurance

### E2E Tests (Playwright)
```bash
npm run test:e2e
```

### Load Tests (k6)
```bash
npm run test:load
```

### API Tests
```bash
npm run test:api
```

---

**Made with ❤️ for the 2026 Global Marketplace.** 🌐
