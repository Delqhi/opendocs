# NEXUS AI — ONBOARDING.md (Feb 2026)

> **Role**: Dual-Purpose Strategic & Technical Onboarding Guide.

---

## 🎯 For the CEO / Owner (Strategy)
*Welcome to your autonomous retail empire.*

### How this works
NEXUS is not a traditional shop. It is a **coordinated bot cluster**.
1.  **Sourcing Bot**: Scans social media for high-velocity trends.
2.  **Pricing Bot**: Dynamically adjusts margins based on competition.
3.  **Fulfillment Bot**: Sits in your Supabase Edge Functions, buying from suppliers as soon as customers pay.
4.  **Support Bot**: (Puter.js) handles all pre-sales questions for $0.

### Your Daily Routine
1.  Check the **Dashboard** for Revenue/Profit.
2.  Approve new **Supplier Suggestions** (AI Scouts).
3.  Check **Operations Queue** for any stuck shipments (manual retry available).

---

## 💻 For the Developer (Infrastructure)
*The most modular, best-practice stack of 2026.*

### Tech Stack
- **Frontend**: React 19, TS, Tailwind v4.
- **State**: Zustand (Atomic slices).
- **Backend**: Supabase (Postgres + Edge Functions).
- **Automation**: n8n (multi-step logic).
- **Identity**: OpenClaw (vendor-decoupled).

### Core Design Rules
*   **Icons over Emojis**: Always use Lucide icons.
*   **Mobile-First**: High-touch targets, bottom nav.
*   **Zen-Retail**: Minimum noise, maximum product focus.
*   **User-Pays AI**: Keep buyer chat on Puter.js to avoid cost spikes.

### Key Directories
- `src/utils/`: Business logic (AI Clients, Checkout Engine, Sync).
- `src/components/`: Pure UI components.
- `docs/sql/`: Database schema migrations.
- `supabase/`: Serverless logic.
