# NEXUS AI — n8n.md (Feb 2026)

> **Role**: Workflow Automation Engine for Complex Fulfillment.
> **Philosophy**: Use n8n for tasks that need multi-step logic (e.g., check stock → pay supplier → wait for tracking → update customer).

---

## 🏗 Workflows
Located in `/n8n/workflows/`.

1.  **`fulfillment-automation.json`**:
    *   **Trigger**: Supabase DB Insert (`orders`).
    *   **Logic**:
        *   If category = Tech: Use Supplier A.
        *   If category = Beauty: Use Supplier B.
        *   Generate invoice.
        *   Send Slack alert to Ops.

---

## 🐳 Integration (Docker)
n8n runs alongside our other services.

```yaml
n8n:
  image: n8nio/n8n:latest
  ports:
    - "5678:5678"
  environment:
    - N8N_HOST=localhost
    - WEBHOOK_URL=http://localhost:5678/
```

---

## 📡 Webhooks
n8n exposes endpoints that we call from our AI-Chat or Edge Functions.

- **Fulfillment**: `POST http://localhost:5678/webhook/fulfill`
- **Analytics Sync**: `POST http://localhost:5678/webhook/sync-metrics`
