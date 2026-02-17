import { useShopStore } from '../store/shopStore';
import { Plug, CreditCard, Truck, LineChart, Link2 } from 'lucide-react';

export function AdminIntegrations() {
  const { integrations, updateIntegrations } = useShopStore();

  const updateAnalytics = (field: 'googleAnalyticsId' | 'metaPixelId' | 'tiktokPixelId', value: string) => {
    updateIntegrations({ analytics: { ...integrations.analytics, [field]: value } });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Integrations</h2>
        <p className="text-sm text-gray-500">Connect payment, shipping, and analytics providers.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass rounded-2xl p-5 space-y-4">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2"><CreditCard className="w-4 h-4" /> Payments</h3>
          <div className="space-y-2">
            {integrations.payments.map((item) => (
              <div key={item} className="flex items-center justify-between px-3 py-2 rounded-xl bg-white/5 text-sm text-gray-300">
                <span>{item}</span>
                <span className="text-xs text-emerald-400">Connected</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass rounded-2xl p-5 space-y-4">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2"><Truck className="w-4 h-4" /> Shipping carriers</h3>
          <div className="space-y-2">
            {integrations.shippingCarriers.map((item) => (
              <div key={item} className="flex items-center justify-between px-3 py-2 rounded-xl bg-white/5 text-sm text-gray-300">
                <span>{item}</span>
                <span className="text-xs text-emerald-400">Active</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass rounded-2xl p-5 space-y-4">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2"><LineChart className="w-4 h-4" /> Analytics</h3>
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs text-gray-500">Google Analytics ID</label>
              <input
                className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white w-full"
                value={integrations.analytics.googleAnalyticsId}
                onChange={(event) => updateAnalytics('googleAnalyticsId', event.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-gray-500">Meta Pixel ID</label>
              <input
                className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white w-full"
                value={integrations.analytics.metaPixelId}
                onChange={(event) => updateAnalytics('metaPixelId', event.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-gray-500">TikTok Pixel ID</label>
              <input
                className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white w-full"
                value={integrations.analytics.tiktokPixelId}
                onChange={(event) => updateAnalytics('tiktokPixelId', event.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="glass rounded-2xl p-5">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Plug className="w-4 h-4" />
          Add API credentials in Settings to activate AI automation with your preferred providers.
        </div>
        <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
          <Link2 className="w-3 h-3" />
          Webhooks are configured in Settings for order and inventory sync.
        </div>
      </div>
    </div>
  );
}
