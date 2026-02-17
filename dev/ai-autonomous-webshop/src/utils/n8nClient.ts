import { useShopStore } from '../store/shopStore';

/**
 * n8n Webhook Client (Feb 2026)
 */
export const n8nClient = {
  async trigger(payload: any) {
    const { settings } = useShopStore.getState();
    const url = settings.n8nWebhookUrl || 'http://localhost:5678/webhook/fulfill';
    
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...payload,
          store: settings.storeName,
          timestamp: new Date().toISOString()
        }),
      });
      return res.json();
    } catch (e) {
      console.error('n8n trigger failed', e);
      throw e;
    }
  }
};
