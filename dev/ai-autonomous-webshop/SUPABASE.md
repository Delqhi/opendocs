# NEXUS AI — SUPABASE.md (Feb 2026)

> **Role**: Primary Backend, Data Store, and Serverless Execution Layer.
> **Philosophy**: Decoupled AI orchestration via Edge Functions.

---

## 🏗 Schema Configuration
Run the migrations in `docs/sql/*.sql` to setup your production database.

### Core Tables List
1.  **`products`**: UUID, name, price, **data** (jsonb), created_at.
2.  **`orders`**: order_number, customer_email, total, **items** (jsonb), status.
3.  **`suppliers`**: name, api_config (jsonb), lead_time, catalog_feed_url.
4.  **`affiliate_partners`**: code, user_id, commission_rate.
5.  **`affiliate_clicks`**: click_id, affiliate_id, ip_address, converted (bool).
6.  **`fulfillment_queue`**: order_id, supplier_id, status, retry_count.
7.  **`admin_profile`**: identity, email, role, supabase_settings.

---

## ⚡ Integrated Edge Functions
Located in `/supabase/functions/`. Deploy with `supabase functions deploy [name]`.

| Function | Logic | Action |
|:---|:---|:---|
| `create-order` | Validation | Checks stock + creates order entry. |
| `fulfill-order` | Logistics | Purchases product from dropship API. |
| `send-email` | Comms | High-fidelity Resend templates. |
| `affiliate-convert`| Commission | Attribution logic and ledger writing. |
| `payment-webhook` | Finance | Stripe/PayPal status updates. |

---

## 🐳 Docker (Local Stack)
To run Supabase locally with NEXUS pre-configured:

```bash
# 1. Start Docker Stack
docker-compose up -d

# 2. Run Migrations
supabase db reset

# 3. Environment Config
# Copy Supabase URL/Anon Key into Admin -> Settings
```

---

## 🛡️ Security (RLS)
The system uses strict **Row Level Security** by default.
*   **Anon**: Can only `SELECT` active products.
*   **User**: Can only `SELECT` their own orders.
*   **Service Role**: Full access for backend automation bots.
