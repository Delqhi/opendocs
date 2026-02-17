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

---

**Made with ❤️ for the 2026 Global Marketplace.** 🌐
