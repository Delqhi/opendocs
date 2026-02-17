# NEXUS AI — ARCHITECTURE.md (Feb 2026)

> **Purpose**: Technical truth for the NEXUS autonomous commerce engine.
> **Philosophy**: Modular, Decoupled, AI-First.

---

## 📋 Folder & File Registry (100% Comprehensive)

```text
project-root/
├── docs/                      # Technical Documentation
│   └── sql/                   # Supabase Migrations
│       ├── 001_core_schema.sql
│       ├── 002_affiliate_schema.sql
│       └── 003_rls_policies.sql
├── n8n/                       # Automation Workflows
│   └── workflows/
│       └── fulfillment-automation.json
├── public/                    # Static Assets & PWA
│   ├── manifest.webmanifest
│   └── sw.js
├── src/
│   ├── App.tsx                # Main Router & Global Shell
│   ├── index.css              # Design Tokens & Framework Styles
│   ├── main.tsx               # React Entry & SW Loader
│   ├── store/
│   │   └── shopStore.ts       # Central Zustand State (Products, Orders, Settings)
│   ├── utils/                 # Business Logic & Infrastructure
│   │   ├── aiClient.ts        # Nvidia/Kimi AI Client
│   │   ├── aiCommandHub.ts    # AI-to-UI Action Bridge
│   │   ├── analytics.ts       # PageView & Event Tracking
│   │   ├── catalogImport.ts   # Supplier Feed CSV/JSON Parser
│   │   ├── n8nClient.ts       # Workflow Webhook Client
│   │   ├── openclawClient.ts  # Identity & Social SDK
│   │   ├── supabaseClient.ts  # Database Factory
│   │   ├── supabaseData.ts    # CRUD & Sync Layer
│   │   ├── affiliateProgram.ts# Cookie & Click Tracking
│   │   └── cn.ts              # Class Merge Helper
│   ├── hooks/
│   │   └── useFocusTrap.ts    # Accessibility Hook
│   ├── types/
│   │   └── puter.d.ts         # Puter.js Global Typings
│   └── components/            # UI Layer (Atomic/Modular)
│       ├── Account/           # Customer Account Components
│       ├── Legal/             # GDPR & Compliance Pages
│       ├── Support/           # Customer Service Views
│       ├── AICenter.tsx       # AI Diagnostics UI
│       ├── AIChatBot.tsx      # Puter.js Concierge
│       ├── AdminAutomationRules.tsx   # Edge Workflow Engine
│       ├── AdminSupplierSuggestions.tsx # AI Trend Sourcing
│       ├── AdminOperations.tsx # Order Queue & Logistics
│       ├── AdminLayout.tsx    # Protected Admin Shell
│       ├── CartSidebar.tsx    # Multi-Step Checkout Drawer
│       ├── Navbar.tsx         # Amazon-Style Sticky Header
│       ├── ShopView.tsx       # Conversion-Optimized Home
│       ├── ProductCard.tsx    # High-Velocity Product Tile
│       ├── ProductDetail.tsx  # Feature-Rich Product Page
│       ├── CommandPalette.tsx # Cmd+K Power Control
│       ├── OnboardingFlow.tsx # 2026 Conversion Coach
│       ├── VoiceController.tsx# Web Speech Control Mode
│       └── AdaptivePanel.tsx  # Accessibility Controls
├── .env.example               # Environment Template
├── AGENTS-PLAN.md             # Delivery Roadmap
├── API-ENDPOINTS.md           # Interface Definition
├── ARCHITECTURE.md            # This File
├── docker-compose.yml         # Full-Stack Local Containers
├── ONBOARDING.md              # User & Dev Guide
├── OPENCLAW.md                # Social Identity Guide
├── README.md                  # Landing Documentation
├── SUPABASE.md                # Backend Configuration
└── USER-PLAN.md               # Post-Build Checklist
```

---

## 🛠️ State Architecture (Zustand)

NEXUS uses a single, persistent source of truth in `shopStore.ts`.

| State Module | Responsibility |
|:---|:---|
| **Catalog** | Active products, categories, pricing logic. |
| **User** | Session, addresses, order history, loyalty. |
| **Settings** | API Keys (Supabase, Nvidia, OpenClaw), Auto-Pilot flags. |
| **Cart** | Items, shipping methods, applied coupons, share link. |
| **Admin** | Fulfillment queue, campaign stats, supplier katalog links. |

---

## 🔗 Deep Integration Dataflow

1.  **Search**: `Navbar` -> `CommandPalette` -> `shopStore` (Fuzzy Match).
2.  **Checkout**: `CartSidebar` -> `checkoutAndFulfill` -> `Supabase Edge Function` -> `Supplier API`.
3.  **Chat**: `AIChatBot` -> `Puter.js` -> Browser Context (No Backend Latency).
4.  **Identity**: `OpenClaw` (Local Container) -> OAuth Provider (Google/Meta) -> `Supabase Auth`.

---

## 🏁 Best Practices Feb 2026
- **Zero-Latency**: Instant UI response, optimistic updates.
- **Privacy-First**: Anonymous chat (Puter), local social tokens (OpenClaw).
- **Infinite Scalability**: JSONB product schemas in Supabase.
- **Conversion-Psychology**: Dynamic scarcity, social proof, and biometrics.
