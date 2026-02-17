import { useState } from 'react';
import { useShopStore } from '../store/shopStore';
import { testSupabaseConnection } from '../utils/supabaseData';
import { Save, Cpu, Globe, Sparkles, ShoppingCart, Bot, Server, Webhook, RefreshCw, CheckCircle, AlertTriangle, Database } from 'lucide-react';

export function AdminSettings() {
  const { settings, updateSettings, pushToast, syncFromSupabase, syncToSupabase } = useShopStore();
  const [testing, setTesting] = useState(false);
  const [syncing, setSyncing] = useState<'from' | 'to' | null>(null);

  const doTest = async () => {
    setTesting(true);
    try {
      const res = await testSupabaseConnection(settings);
      pushToast({ type: res.ok ? 'success' : 'error', message: res.message });
    } catch {
      pushToast({ type: 'error', message: 'Supabase test failed.' });
    } finally {
      setTesting(false);
    }
  };

  const doSync = async (dir: 'from' | 'to') => {
    setSyncing(dir);
    try {
      const res = dir === 'from' ? await syncFromSupabase() : await syncToSupabase();
      pushToast({ type: res.ok ? 'success' : 'error', message: res.message });
    } catch {
      pushToast({ type: 'error', message: 'Supabase sync failed.' });
    } finally {
      setSyncing(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">AI & Store Settings</h2>
          <p className="text-sm text-gray-500">Connect your model provider and define automation rules.</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span className="text-xs text-gray-300">Autopilot {settings.autopilotEnabled ? 'enabled' : 'paused'}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          <section className="glass rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2"><Cpu className="w-4 h-4" /> AI Provider (Admin / Ops)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <select
                className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white"
                value={settings.aiProvider}
                onChange={(event) => updateSettings({ aiProvider: event.target.value as typeof settings.aiProvider })}
              >
                <option value="puter">Puter (User‑Pays, no API keys)</option>
                <option value="ollama">Ollama (Local)</option>
                <option value="openai">OpenAI</option>
                <option value="anthropic">Anthropic</option>
                <option value="custom">Custom API</option>
              </select>
              <input
                className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white"
                placeholder="Model name"
                value={settings.aiModel}
                onChange={(event) => updateSettings({ aiModel: event.target.value })}
              />
              <input
                className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white"
                placeholder="API base URL"
                value={settings.aiBaseUrl}
                onChange={(event) => updateSettings({ aiBaseUrl: event.target.value })}
              />
              <input
                className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white"
                placeholder="API key"
                value={settings.aiApiKey}
                onChange={(event) => updateSettings({ aiApiKey: event.target.value })}
                type="password"
              />
              <input
                type="number"
                step="0.1"
                className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white"
                placeholder="Temperature"
                value={settings.aiTemperature}
                onChange={(event) => updateSettings({ aiTemperature: Number(event.target.value) })}
              />
              <input
                type="number"
                className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white"
                placeholder="Max tokens"
                value={settings.aiMaxTokens}
                onChange={(event) => updateSettings({ aiMaxTokens: Number(event.target.value) })}
              />
            </div>
            <div className="text-xs text-gray-500">For Ollama, keep base URL as http://localhost:11434 and set the model name (e.g., llama3.2).</div>
          </section>

          <section className="glass rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2"><Bot className="w-4 h-4" /> Buyer Chat (Storefront Concierge)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <select
                className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white"
                value={settings.buyerAiProvider}
                onChange={(event) => updateSettings({ buyerAiProvider: event.target.value as typeof settings.buyerAiProvider })}
              >
                <option value="puter">Puter (anonymous guest sessions, user‑pays)</option>
                <option value="ollama">Ollama (Local)</option>
                <option value="openai">OpenAI</option>
                <option value="anthropic">Anthropic</option>
                <option value="custom">Custom API</option>
              </select>
              <input
                className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white"
                placeholder="Buyer model (recommended: gpt-4o-mini)"
                value={settings.buyerAiModel}
                onChange={(event) => updateSettings({ buyerAiModel: event.target.value })}
              />
            </div>
            <div className="text-xs text-gray-500">
              Best practice (Feb 2026): use Puter with a lightweight model (e.g. <code className="text-gray-300">gpt-4o-mini</code>) for anonymous shoppers.
              This UI never calls <code className="text-gray-300">puter.auth.signIn()</code>.
            </div>
          </section>

          <section className="glass rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2"><Server className="w-4 h-4" /> Supabase Fulfillment Backend</h3>
              <div className="flex items-center gap-2 text-[10px]">
                {settings.supabaseUrl.trim() && settings.supabaseAnonKey.trim() ? (
                  <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
                    <CheckCircle className="w-3.5 h-3.5" /> Configured
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300">
                    <AlertTriangle className="w-3.5 h-3.5" /> Not configured
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] uppercase text-gray-500">Project URL</label>
                <input
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white"
                  placeholder="https://xyz.supabase.co"
                  value={settings.supabaseUrl}
                  onChange={(e) => updateSettings({ supabaseUrl: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase text-gray-500">Anon Key</label>
                <input
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white"
                  placeholder="eyJ..."
                  type="password"
                  value={settings.supabaseAnonKey}
                  onChange={(e) => updateSettings({ supabaseAnonKey: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] uppercase text-gray-500">Fn: Create Order</label>
                <input
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white"
                  value={settings.supabaseFnCreateOrder}
                  onChange={(e) => updateSettings({ supabaseFnCreateOrder: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase text-gray-500">Fn: Fulfill Order</label>
                <input
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white"
                  value={settings.supabaseFnFulfillOrder}
                  onChange={(e) => updateSettings({ supabaseFnFulfillOrder: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase text-gray-500">Fn: Send Email</label>
                <input
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white"
                  value={settings.supabaseFnSendEmail}
                  onChange={(e) => updateSettings({ supabaseFnSendEmail: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase text-gray-500">Fn: Tracking Update</label>
                <input
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white"
                  value={settings.supabaseFnTrackingUpdate}
                  onChange={(e) => updateSettings({ supabaseFnTrackingUpdate: e.target.value })}
                />
              </div>
            </div>
            <div className="text-xs text-gray-500">Edge Functions are called during checkout to automate supplier purchase and email sending.</div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <button
                onClick={doTest}
                disabled={testing}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-white text-black text-xs font-semibold disabled:opacity-60"
              >
                {testing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Server className="w-4 h-4" />}
                Test connection
              </button>
              <button
                onClick={() => doSync('from')}
                disabled={syncing !== null}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-gray-200 hover:bg-white/10 disabled:opacity-60"
              >
                {syncing === 'from' ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
                Sync from DB
              </button>
              <button
                onClick={() => doSync('to')}
                disabled={syncing !== null}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-gray-200 hover:bg-white/10 disabled:opacity-60"
              >
                {syncing === 'to' ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Sync to DB
              </button>
            </div>

            <div className="pt-2 border-t border-white/5">
              <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-2">Table names</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white"
                  placeholder="Products table"
                  value={settings.supabaseTableProducts ?? ''}
                  onChange={(e) => updateSettings({ supabaseTableProducts: e.target.value })}
                />
                <input
                  className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white"
                  placeholder="Suppliers table"
                  value={settings.supabaseTableSuppliers ?? ''}
                  onChange={(e) => updateSettings({ supabaseTableSuppliers: e.target.value })}
                />
                <input
                  className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white"
                  placeholder="Coupons table"
                  value={settings.supabaseTableCoupons ?? ''}
                  onChange={(e) => updateSettings({ supabaseTableCoupons: e.target.value })}
                />
                <input
                  className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white"
                  placeholder="Orders table"
                  value={settings.supabaseTableOrders ?? ''}
                  onChange={(e) => updateSettings({ supabaseTableOrders: e.target.value })}
                />
                <input
                  className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white"
                  placeholder="Admin profile table"
                  value={settings.supabaseTableAdminProfile ?? ''}
                  onChange={(e) => updateSettings({ supabaseTableAdminProfile: e.target.value })}
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Expected schema: tables contain columns <code className="text-gray-300">id</code> (text) and <code className="text-gray-300">data</code> (jsonb).
              </p>
            </div>
          </section>

          <section className="glass rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2"><Bot className="w-4 h-4" /> Automation modules</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-300">
              {[
                { key: 'autoPricing', label: 'Auto pricing' },
                { key: 'autoSourcing', label: 'Auto sourcing' },
                { key: 'autoMarketing', label: 'Auto marketing' },
                { key: 'autoSupport', label: 'Auto support' },
                { key: 'autoFulfillment', label: 'Auto fulfillment' },
                { key: 'autoContent', label: 'Auto content' },
              ].map((item) => (
                <button
                  key={item.key}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl border ${
                    settings[item.key as keyof typeof settings] ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300' : 'border-white/10 bg-white/5'
                  }`}
                  onClick={() => updateSettings({ [item.key]: !settings[item.key as keyof typeof settings] } as Partial<typeof settings>)}
                >
                  <span>{item.label}</span>
                  <span className="text-xs">{settings[item.key as keyof typeof settings] ? 'ON' : 'OFF'}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="glass rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2"><Webhook className="w-4 h-4" /> Webhooks</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white"
                placeholder="Order webhook"
                value={settings.webhookOrders}
                onChange={(event) => updateSettings({ webhookOrders: event.target.value })}
              />
              <input
                className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white"
                placeholder="Inventory webhook"
                value={settings.webhookInventory}
                onChange={(event) => updateSettings({ webhookInventory: event.target.value })}
              />
              <input
                className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white"
                placeholder="Tracking webhook"
                value={settings.webhookTracking}
                onChange={(event) => updateSettings({ webhookTracking: event.target.value })}
              />
            </div>
          </section>
        </div>

        <div className="space-y-5">
          <section className="glass rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2"><ShoppingCart className="w-4 h-4" /> Store basics</h3>
            <input
              className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white"
              placeholder="Store name"
              value={settings.storeName}
              onChange={(event) => updateSettings({ storeName: event.target.value })}
            />
            <input
              className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white"
              placeholder="Support email"
              value={settings.supportEmail}
              onChange={(event) => updateSettings({ supportEmail: event.target.value })}
            />
            <input
              className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white"
              placeholder="Support phone"
              value={settings.supportPhone}
              onChange={(event) => updateSettings({ supportPhone: event.target.value })}
            />
            <input
              className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white"
              placeholder="Default currency"
              value={settings.defaultCurrency}
              onChange={(event) => updateSettings({ defaultCurrency: event.target.value })}
            />
            <input
              className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white"
              placeholder="Timezone"
              value={settings.timezone}
              onChange={(event) => updateSettings({ timezone: event.target.value })}
            />
            <input
              className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white"
              placeholder="Primary market"
              value={settings.primaryMarket}
              onChange={(event) => updateSettings({ primaryMarket: event.target.value })}
            />
          </section>

          <section className="glass rounded-2xl p-5 space-y-3">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2"><Globe className="w-4 h-4" /> Sales channels</h3>
            {Object.entries(settings.channels).map(([key, value]) => (
              <button
                key={key}
                className={`flex items-center justify-between px-3 py-2 rounded-xl border ${value ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300' : 'border-white/10 bg-white/5 text-gray-300'}`}
                onClick={() => updateSettings({ channels: { ...settings.channels, [key]: !value } })}
              >
                <span className="capitalize">{key}</span>
                <span className="text-xs">{value ? 'ON' : 'OFF'}</span>
              </button>
            ))}
          </section>

          <section className="glass rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2"><Server className="w-4 h-4" /> Autopilot</h3>
            <button
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl border ${settings.autopilotEnabled ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300' : 'border-white/10 bg-white/5 text-gray-300'}`}
              onClick={() => updateSettings({ autopilotEnabled: !settings.autopilotEnabled })}
            >
              <span>Autopilot</span>
              <span className="text-xs">{settings.autopilotEnabled ? 'Active' : 'Paused'}</span>
            </button>
            <button className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-white text-black text-sm font-semibold">
              <Save className="w-4 h-4" /> Save configuration
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}
