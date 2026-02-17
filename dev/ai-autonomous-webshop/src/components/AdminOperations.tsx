import { useState, useEffect } from 'react';
import { useShopStore } from '../store/shopStore';
import { Package, Mail, CreditCard, Link2, ShoppingBag } from 'lucide-react';

interface FulfillmentItem {
  id: string;
  orderId: string;
  orderNumber: string;
  supplier: string;
  items: Array<{ name: string; qty: number }>;
  status: 'queued' | 'processing' | 'ordered' | 'shipped' | 'delivered' | 'failed' | 'retry' | 'cancelled';
  attempts: number;
  lastError: string;
  createdAt: string;
  nextRetry: string;
}

interface EmailLogItem {
  id: string;
  to: string;
  template: string;
  subject: string;
  status: 'queued' | 'sent' | 'failed' | 'bounced';
  createdAt: string;
  error?: string;
}

export default function AdminOperations() {
  const { userOrders, suppliers } = useShopStore();
  const [tab, setTab] = useState<'fulfillment' | 'emails' | 'payments' | 'webhooks'>('fulfillment');
  const [fulfillmentQueue, setFulfillmentQueue] = useState<FulfillmentItem[]>([]);
  const [emailLog, setEmailLog] = useState<EmailLogItem[]>([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const queue: FulfillmentItem[] = userOrders.map((o, i) => ({
      id: `ful-${i}`,
      orderId: o.id,
      orderNumber: `NX-${1000 + i}`,
      supplier: suppliers[i % suppliers.length]?.name || 'Unknown',
      items: o.items.map(it => ({ name: it.name, qty: it.qty })),
      status: (['queued', 'processing', 'ordered', 'shipped', 'delivered'] as const)[Math.min(i, 4)],
      attempts: i > 3 ? 2 : 1,
      lastError: i === 3 ? 'Supplier API timeout after 30s' : '',
      createdAt: o.date,
      nextRetry: i === 3 ? new Date(Date.now() + 1800000).toISOString() : ''
    }));
    setFulfillmentQueue(queue);

    const emails: EmailLogItem[] = userOrders.flatMap((o, i) => [
      { id: `em-${i}-1`, to: o.email || 'customer@example.com', template: 'order_confirmation', subject: `Order Confirmed – #NX-${1000+i}`, status: 'sent' as const, createdAt: o.date },
      ...(i < 3 ? [{ id: `em-${i}-2`, to: o.email || 'customer@example.com', template: 'shipping_update', subject: `Shipped – #NX-${1000+i}`, status: 'sent' as const, createdAt: o.date }] : [])
    ]);
    setEmailLog(emails);
  }, [userOrders, suppliers]);

  const statusColor = (s: string) => {
    const m: Record<string, string> = {
      queued: 'bg-gray-100 text-gray-700', processing: 'bg-blue-100 text-blue-700',
      ordered: 'bg-indigo-100 text-indigo-700', shipped: 'bg-amber-100 text-amber-700',
      delivered: 'bg-green-100 text-green-700', failed: 'bg-red-100 text-red-700',
      retry: 'bg-orange-100 text-orange-700', cancelled: 'bg-gray-200 text-gray-500',
      sent: 'bg-green-100 text-green-700', bounced: 'bg-red-100 text-red-700'
    };
    return m[s] || 'bg-gray-100 text-gray-600';
  };

  const filteredQueue = filter === 'all' ? fulfillmentQueue : fulfillmentQueue.filter(f => f.status === filter);

  const retryFulfillment = (id: string) => {
    setFulfillmentQueue(q => q.map(f => f.id === id ? { ...f, status: 'processing' as const, attempts: f.attempts + 1, lastError: '' } : f));
  };

  const cancelFulfillment = (id: string) => {
    setFulfillmentQueue(q => q.map(f => f.id === id ? { ...f, status: 'cancelled' as const } : f));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Operations Center</h1>
        <p className="text-sm text-[var(--muted)] mt-1">Fulfillment queue, email log, payment processing & webhooks</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Queued', value: fulfillmentQueue.filter(f => f.status === 'queued').length, color: 'text-gray-600' },
          { label: 'Processing', value: fulfillmentQueue.filter(f => ['processing', 'ordered'].includes(f.status)).length, color: 'text-blue-600' },
          { label: 'Shipped', value: fulfillmentQueue.filter(f => f.status === 'shipped').length, color: 'text-amber-600' },
          { label: 'Failed/Retry', value: fulfillmentQueue.filter(f => ['failed', 'retry'].includes(f.status)).length, color: 'text-red-600' }
        ].map(s => (
          <div key={s.label} className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
            <p className="text-sm text-[var(--muted)]">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-[var(--surface)] border border-[var(--border)] rounded-xl p-1">
        {(['fulfillment', 'emails', 'payments', 'webhooks'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all inline-flex items-center justify-center gap-2 ${tab === t ? 'bg-[var(--primary)] text-white' : 'text-[var(--muted)] hover:text-[var(--foreground)]'}`}>
            {t === 'fulfillment' ? <><Package className="w-4 h-4" /> Fulfillment</> : t === 'emails' ? <><Mail className="w-4 h-4" /> Emails</> : t === 'payments' ? <><CreditCard className="w-4 h-4" /> Payments</> : <><Link2 className="w-4 h-4" /> Webhooks</>}
          </button>
        ))}
      </div>

      {/* Fulfillment Tab */}
      {tab === 'fulfillment' && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {['all', 'queued', 'processing', 'ordered', 'shipped', 'failed', 'retry'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${filter === f ? 'bg-[var(--primary)] text-white' : 'bg-[var(--surface)] border border-[var(--border)] text-[var(--muted)]'}`}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th className="text-left p-3 text-[var(--muted)] font-medium">Order</th>
                  <th className="text-left p-3 text-[var(--muted)] font-medium hidden md:table-cell">Supplier</th>
                  <th className="text-left p-3 text-[var(--muted)] font-medium">Items</th>
                  <th className="text-left p-3 text-[var(--muted)] font-medium">Status</th>
                  <th className="text-left p-3 text-[var(--muted)] font-medium hidden md:table-cell">Attempts</th>
                  <th className="text-right p-3 text-[var(--muted)] font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredQueue.map(f => (
                  <tr key={f.id} className="border-b border-[var(--border)] last:border-0 hover:bg-black/[0.02]">
                    <td className="p-3 font-mono text-xs text-[var(--foreground)]">{f.orderNumber}</td>
                    <td className="p-3 text-[var(--foreground)] hidden md:table-cell">{f.supplier}</td>
                    <td className="p-3 text-[var(--muted)]">{f.items.map(i => `${i.name} ×${i.qty}`).join(', ')}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor(f.status)}`}>{f.status}</span>
                      {f.lastError && <p className="text-xs text-red-500 mt-1 max-w-48 truncate" title={f.lastError}>{f.lastError}</p>}
                    </td>
                    <td className="p-3 text-[var(--muted)] hidden md:table-cell">{f.attempts}/3</td>
                    <td className="p-3 text-right">
                      <div className="flex gap-1 justify-end">
                        {['failed', 'retry'].includes(f.status) && (
                          <button onClick={() => retryFulfillment(f.id)}
                            className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium hover:bg-blue-200">
                            Retry
                          </button>
                        )}
                        {!['delivered', 'cancelled'].includes(f.status) && (
                          <button onClick={() => cancelFulfillment(f.id)}
                            className="px-2 py-1 bg-red-50 text-red-600 rounded text-xs font-medium hover:bg-red-100">
                            Cancel
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredQueue.length === 0 && (
                  <tr><td colSpan={6} className="p-8 text-center text-[var(--muted)]">No items in queue</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Emails Tab */}
      {tab === 'emails' && (
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="text-left p-3 text-[var(--muted)] font-medium">Recipient</th>
                <th className="text-left p-3 text-[var(--muted)] font-medium">Template</th>
                <th className="text-left p-3 text-[var(--muted)] font-medium hidden md:table-cell">Subject</th>
                <th className="text-left p-3 text-[var(--muted)] font-medium">Status</th>
                <th className="text-left p-3 text-[var(--muted)] font-medium hidden md:table-cell">Date</th>
              </tr>
            </thead>
            <tbody>
              {emailLog.map(e => (
                <tr key={e.id} className="border-b border-[var(--border)] last:border-0">
                  <td className="p-3 text-[var(--foreground)]">{e.to}</td>
                  <td className="p-3"><span className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded text-xs">{e.template}</span></td>
                  <td className="p-3 text-[var(--muted)] hidden md:table-cell max-w-48 truncate">{e.subject}</td>
                  <td className="p-3"><span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor(e.status)}`}>{e.status}</span></td>
                  <td className="p-3 text-[var(--muted)] text-xs hidden md:table-cell">{new Date(e.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
              {emailLog.length === 0 && (
                <tr><td colSpan={5} className="p-8 text-center text-[var(--muted)]">No emails sent yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Payments Tab */}
      {tab === 'payments' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Stripe */}
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <CreditCard className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-[var(--foreground)]">Stripe</h3>
                  <p className="text-xs text-[var(--muted)]">Cards, Apple Pay, Google Pay</p>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-[var(--muted)] block mb-1">Secret Key</label>
                  <input type="password" placeholder="sk_live_..." className="w-full px-3 py-2 border border-[var(--border)] rounded-lg text-sm bg-[var(--surface)] text-[var(--foreground)]" />
                </div>
                <div>
                  <label className="text-xs text-[var(--muted)] block mb-1">Webhook Secret</label>
                  <input type="password" placeholder="whsec_..." className="w-full px-3 py-2 border border-[var(--border)] rounded-lg text-sm bg-[var(--surface)] text-[var(--foreground)]" />
                </div>
                <div>
                  <label className="text-xs text-[var(--muted)] block mb-1">Webhook URL</label>
                  <div className="flex gap-2">
                    <input readOnly value="https://[your-project].supabase.co/functions/v1/payment-webhook?provider=stripe"
                      className="flex-1 px-3 py-2 border border-[var(--border)] rounded-lg text-xs bg-gray-50 text-[var(--muted)] font-mono" />
                    <button className="px-3 py-2 bg-[var(--primary)] text-white rounded-lg text-xs" onClick={() => navigator.clipboard.writeText('https://[your-project].supabase.co/functions/v1/payment-webhook?provider=stripe')}>Copy</button>
                  </div>
                </div>
                <button className="w-full py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">Connect Stripe</button>
              </div>
            </div>

            {/* PayPal */}
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold">
                  P
                </div>
                <div>
                  <h3 className="font-semibold text-[var(--foreground)]">PayPal</h3>
                  <p className="text-xs text-[var(--muted)]">PayPal, Venmo, Pay Later</p>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-[var(--muted)] block mb-1">Client ID</label>
                  <input type="password" placeholder="AX..." className="w-full px-3 py-2 border border-[var(--border)] rounded-lg text-sm bg-[var(--surface)] text-[var(--foreground)]" />
                </div>
                <div>
                  <label className="text-xs text-[var(--muted)] block mb-1">Secret</label>
                  <input type="password" placeholder="EL..." className="w-full px-3 py-2 border border-[var(--border)] rounded-lg text-sm bg-[var(--surface)] text-[var(--foreground)]" />
                </div>
                <div>
                  <label className="text-xs text-[var(--muted)] block mb-1">Mode</label>
                  <select className="w-full px-3 py-2 border border-[var(--border)] rounded-lg text-sm bg-[var(--surface)] text-[var(--foreground)]">
                    <option value="sandbox">Sandbox (Testing)</option>
                    <option value="live">Live (Production)</option>
                  </select>
                </div>
                <button className="w-full py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">Connect PayPal</button>
              </div>
            </div>
          </div>

          {/* Klarna */}
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-pink-100 dark:bg-pink-900/30 rounded-lg flex items-center justify-center text-pink-600 dark:text-pink-400">
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-[var(--foreground)]">Klarna</h3>
                  <p className="text-xs text-[var(--muted)]">Buy Now, Pay Later – 4 installments</p>
                </div>
              </div>
              <span className="px-3 py-1 bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 rounded-full text-xs">Coming Soon</span>
            </div>
          </div>
        </div>
      )}

      {/* Webhooks Tab */}
      {tab === 'webhooks' && (
        <div className="space-y-4">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6">
            <h3 className="font-semibold text-[var(--foreground)] mb-4">Webhook Endpoints</h3>
            <div className="space-y-3">
              {[
                { name: 'Payment Webhook (Stripe)', url: '/functions/v1/payment-webhook?provider=stripe', method: 'POST' },
                { name: 'Payment Webhook (PayPal)', url: '/functions/v1/payment-webhook?provider=paypal', method: 'POST' },
                { name: 'Fulfill Order', url: '/functions/v1/fulfill-order', method: 'POST' },
                { name: 'Send Email', url: '/functions/v1/send-email', method: 'POST' },
                { name: 'Tracking Update', url: '/functions/v1/tracking-update', method: 'POST' },
                { name: 'Affiliate Convert', url: '/functions/v1/affiliate-convert', method: 'POST' },
                { name: 'Affiliate Approve (Cron)', url: '/functions/v1/affiliate-approve-cron', method: 'POST' }
              ].map(w => (
                <div key={w.name} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-mono">{w.method}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--foreground)]">{w.name}</p>
                    <p className="text-xs text-[var(--muted)] font-mono truncate">https://[project].supabase.co{w.url}</p>
                  </div>
                  <button onClick={() => navigator.clipboard.writeText(`https://[project].supabase.co${w.url}`)}
                    className="px-2 py-1 bg-[var(--surface)] border border-[var(--border)] rounded text-xs text-[var(--muted)] hover:text-[var(--foreground)]">
                    Copy
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6">
            <h3 className="font-semibold text-[var(--foreground)] mb-4">Environment Variables (Supabase Secrets)</h3>
            <div className="space-y-2 font-mono text-xs">
              {['STRIPE_SECRET_KEY', 'STRIPE_WEBHOOK_SECRET', 'PAYPAL_CLIENT_ID', 'PAYPAL_SECRET', 'PAYPAL_MODE',
                'RESEND_API_KEY', 'FROM_EMAIL', 'SHOP_NAME', 'SHOP_URL'].map(v => (
                <div key={v} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800/50 rounded">
                  <span className="text-[var(--foreground)]">{v}</span>
                  <span className="text-[var(--muted)]">=</span>
                  <span className="text-red-500">••••••••</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-[var(--muted)] mt-3">Set these via: <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">supabase secrets set KEY=value</code></p>
          </div>
        </div>
      )}
    </div>
  );
}
