# NEXUS AI — OPENCLAW.md (Feb 2026)

> **Role**: Local-first Authentication and Unified App Integration Bridge.
> **Philosophy**: No direct dependency on big-tech vendor SDKs. Use OpenClaw as a proxy.

---

## 🏗 Why OpenClaw?
*   **Decoupled Auth**: Switch between Google, Apple, and Email auth without changing code.
*   **Privacy**: All social tokens are stored in your local OpenClaw container.
*   **Bot-Access**: OpenClaw provides a standard interface for our KI-Chat to access external apps (WhatsApp, Instagram, n8n).

---

## 🛠 Features
1.  **Unified Social Login**: Google, Meta, Apple.
2.  **Messaging Bridge**: Send WhatsApp/Telegram updates via OpenClaw.
3.  **App Permissions**: Manage what our AI can do in the store.

---

## 🐳 Integration (Docker)
OpenClaw is part of our `docker-compose.yml`.

```yaml
openclaw:
  image: openclaw/openclaw:latest
  ports:
    - "8080:8080"
  environment:
    - OPENCLAW_SECRET=your_secret
    - STORAGE_TYPE=supabase
```

---

## 📡 API Usage
The frontend communicates with OpenClaw via `src/utils/openclawClient.ts`.

```javascript
// Example: Trigger WhatsApp notification through OpenClaw
openclaw.app('whatsapp').send({
  to: '+49...',
  text: 'Your order is on its way!'
});
```
