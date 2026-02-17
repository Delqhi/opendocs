import { useShopStore } from '../store/shopStore';

/**
 * OpenClaw Client (Feb 2026)
 * Decoupled SDK for Auth, Messaging, and App integrations.
 */
export const openclaw = {
  async login(provider: 'google' | 'apple' | 'meta') {
    const { settings } = useShopStore.getState();
    const url = `${settings.supabaseUrl}/openclaw/v1/auth/${provider}`;
    window.location.href = url;
  },

  async sendWhatsApp(to: string, message: string) {
    const { settings } = useShopStore.getState();
    const res = await fetch(`${settings.supabaseUrl}/openclaw/v1/apps/whatsapp/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to, text: message }),
    });
    return res.json();
  },

  async triggerN8N(workflowId: string, data: any) {
    const { settings } = useShopStore.getState();
    const res = await fetch(`${settings.supabaseUrl}/openclaw/v1/connect/n8n/trigger`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workflowId, payload: data }),
    });
    return res.json();
  }
};
