# NEXUS AI — USER-PLAN.md (Feb 2026)

> **Goal**: 5-Minute Launch Guide for the Store Owner.
> **Status**: COMPLETED BUILD. READY FOR INPUTS.

---

## 🏁 Phase 1: Environment Keys (Critical)
1.  **Stripe/PayPal**: Create your developer accounts.
2.  **Supabase**: Create a new project.
3.  **NVIDIA API**: Get your multimodal LLM key (Nvidia NIM).
4.  **Resend**: Get a free API key for transactional emails.

---

## 🛠️ Phase 2: Technical Activation
1.  **Deployment**:
    *   Upload this project to Vercel or Netlify.
    *   Setup `.env` variables from `.env.example`.
2.  **Database**:
    *   Open Supabase Dashboard -> SQL Editor.
    *   Run `docs/sql/001_core_schema.sql` (and following).
3.  **Automation**:
    *   Run `supabase functions deploy fulfill-order`.
    *   Setup the n8n container using the `docker-compose.yml`.

---

## 🛍️ Phase 3: Catalog & Suppliers
1.  **Admin Login**: `demo` / `demo`.
2.  **Settings**: Enter your Supabase URL & Anon Key.
3.  **Supplier Import**:
    *   Go to **Admin -> Suppliers**.
    *   Add your first dropshipping partner.
    *   Import their JSON/CSV catalog feed.
4.  **AI Scouting**: 
    *   Open **Research Lab**.
    *   Click "Auto-Launch" to fill your shop with trending products.

---

## 🚀 Phase 4: Social & Identity (Optional)
1.  **OpenClaw**: If you want WhatsApp/Social notifications, ensure the OpenClaw container is running locally.
2.  **WhatsApp**: Authenticate your business phone via the OpenClaw dashboard.

---

## 🚀 Final CEO Production Hardening (Feb 2026)

Before scaling your ads, perform these "Director's Cut" optimizations:

### 1. Custom Brand Identity
*   **Logo Swap**: Replace the `Zap` icon in `Navbar.tsx` with your real SVG brand logo.
*   **Editorial Imagery**: The `ShopView.tsx` uses high-quality Unsplash placeholders. For production, hire a 3D artist or photographer to create custom "Studio Ratio" (4:5) product shots.
*   **Primary Accent**: Change the `--primary` variable in `index.css` to match your specific brand hex code.

### 2. Legal & Trust Layer
*   **Address & Entity**: Fill in the real company details in `LegalImprint.tsx`.
*   **Privacy Compliance**: Review `LegalPrivacy.tsx` with a legal professional in your target jurisdiction (especially for GDPR/CCPA).
*   **Merchant Account**: Ensure your Stripe/PayPal descriptors match your store name to avoid chargebacks.

### 3. AI Fulfillment Optimization
*   **n8n Webhooks**: Ensure your n8n workflows handle "Order Failure" gracefully by notifying your support email.
*   **Supplier Buffering**: Set up a "buffer" margin in your supplier negotiation bots to ensure 50%+ profit even with rising shipping costs.

### 4. Internationalization (i18n) & Global Scale
*   **Language Switcher**: The shop supports 5 languages (EN, DE, ES, FR, ZH). Access the switcher in the **Adaptive UX Panel** (Gear icon in Navbar).
*   **Multimodal AI**: Use the **NVIDIA NIM** integration for advanced product image analysis and voice-to-command accuracy (requires `VITE_NVIDIA_API_KEY`).

---

## ✅ Post-Launch Checklist
- [x] **2026 UX Suite**: Verified Voice, Adaptive, and Predictive components are active.
- [ ] **Payment Test**: Run a $1 transaction in Stripe Live Mode.
- [ ] **Fulfillment Trace**: Verify the `fulfillment_queue` in Supabase updates correctly.
- [ ] **AI-Chat Log**: Review first 10 Puter.js interactions to see if model tuning is needed.
- [ ] **PWA Audit**: Verify "Install App" prompt appears on mobile browsers.

**NEXUS is now your autonomous revenue engine. Monitor the Dashboard and scale accordingly.** 🏁
