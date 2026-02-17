# NEXUS AI — API-ENDPOINTS.md (Feb 2026)

> **Standard**: REST-compliant, JSONB payloads, Command Palette integrated.
> **Philosophy**: Every function is an endpoint. Every endpoint is an AI-Command.

---

## 🛠 Command Hub Mappings
Every endpoint is linked to a Command Palette (`Cmd+K`) or AI-Chat action.

| Command | Category | Endpoint | Description |
|:---|:---:|:---|:---|
| `/dashboard` | Nav | `frontend.render('dashboard')` | Admin metrics |
| `>add product` | Action | `POST /rest/v1/products` | Direct catalog insert |
| `>fulfill` | Action | `POST /functions/v1/fulfill-order` | Manually trigger supplier API |
| `!cart` | Quick | `ui.toggle('cart')` | Open shopper cart |
| `>negotiate` | AI | `POST /functions/v1/ai-negotiate` | AI-driven price negotiation |

---

## 📦 Storefront API (Public)

### 1. Products
*   **GET** `/products?active=eq.true`
    *   Returns the active product catalog.
*   **GET** `/products?id=eq.{uuid}`
    *   Single product detail.

### 2. Orders & Tracking
*   **POST** `/functions/v1/create-order`
    *   Initiates the multi-step checkout orchestration.
*   **GET** `/orders?email=eq.{email}`
    *   Returns authenticated user order history.

---

## 🦾 Autonomous Ops API (Admin Only)

### 1. Sourcing & Trends
*   **POST** `/functions/v1/scout-trends`
    *   Triggers the AI trend scanner (TikTok/Amazon).
*   **POST** `/functions/v1/import-catalog`
    *   Body: `{ supplier_id, feed_url, format: 'json'|'csv' }`

### 2. Fulfillment Engine
*   **POST** `/functions/v1/fulfill-order`
    *   Input: `{ order_id }`
    *   Logic: Calls supplier API -> Sets tracking -> Sends Email.

### 3. Messaging (OpenClaw)
*   **POST** `/openclaw/v1/apps/whatsapp/send`
    *   Triggers WhatsApp notification without vendor lock-in.

---

## 📈 n8n Integration Blueprints
Workflows triggered via Webhooks.

*   **Order Success**: `POST http://n8n:5678/webhook/order_success`
*   **Inventory Alert**: `POST http://n8n:5678/webhook/stock_alert`
*   **CRM Update**: `POST http://n8n:5678/webhook/user_segment`
