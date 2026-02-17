import { useMemo, useState } from 'react';
import { Plus, Link2, Trash2, PencilLine, CheckCircle, PauseCircle, PlayCircle } from 'lucide-react';
import { useShopStore, type AffiliateNetwork } from '../store/shopStore';

const empty: Omit<AffiliateNetwork, 'id'> = {
  name: '',
  status: 'active',
  trackingUrl: '',
  commissionRate: 10,
  cookieDays: 30,
};

export function AdminAffiliates() {
  const { affiliateNetworks, addAffiliateNetwork, updateAffiliateNetwork, deleteAffiliateNetwork } = useShopStore();
  const [draft, setDraft] = useState(empty);

  const sorted = useMemo(() => {
    return [...affiliateNetworks].sort((a, b) => a.name.localeCompare(b.name));
  }, [affiliateNetworks]);

  const createNetwork = () => {
    if (!draft.name.trim()) return;
    addAffiliateNetwork({
      ...draft,
      id: `aff-${Date.now()}`,
      name: draft.name.trim(),
      trackingUrl: draft.trackingUrl.trim(),
    });
    setDraft(empty);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Affiliate Networks</h2>
        <p className="text-sm text-gray-500">Manage partner networks and tracking settings.</p>
      </div>

      <div className="glass rounded-2xl p-5 space-y-4">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2"><Plus className="w-4 h-4" /> Add network</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <input
            className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white"
            placeholder="Network name (e.g., Impact)"
            value={draft.name}
            onChange={(e) => setDraft((p) => ({ ...p, name: e.target.value }))}
          />
          <input
            className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white md:col-span-2"
            placeholder="Tracking base URL"
            value={draft.trackingUrl}
            onChange={(e) => setDraft((p) => ({ ...p, trackingUrl: e.target.value }))}
          />
          <input
            type="number"
            className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white"
            placeholder="Commission %"
            value={draft.commissionRate}
            onChange={(e) => setDraft((p) => ({ ...p, commissionRate: Number(e.target.value) }))}
          />
          <input
            type="number"
            className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white"
            placeholder="Cookie days"
            value={draft.cookieDays}
            onChange={(e) => setDraft((p) => ({ ...p, cookieDays: Number(e.target.value) }))}
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setDraft((p) => ({ ...p, status: p.status === 'active' ? 'paused' : 'active' }))}
            className={`px-3 py-2 rounded-xl text-xs border transition-colors ${
              draft.status === 'active'
                ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                : 'bg-amber-500/10 text-amber-300 border-amber-500/20'
            }`}
          >
            {draft.status === 'active' ? (
              <span className="inline-flex items-center gap-2"><PlayCircle className="w-4 h-4" /> Active</span>
            ) : (
              <span className="inline-flex items-center gap-2"><PauseCircle className="w-4 h-4" /> Paused</span>
            )}
          </button>
          <button
            onClick={createNetwork}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-black text-sm font-semibold"
          >
            <CheckCircle className="w-4 h-4" /> Save
          </button>
        </div>
      </div>

      <div className="glass rounded-2xl overflow-hidden">
        <div className="grid grid-cols-12 gap-3 px-4 py-3 border-b border-white/5 text-[10px] uppercase tracking-wider text-gray-500">
          <div className="col-span-4">Network</div>
          <div className="col-span-4">Tracking URL</div>
          <div className="col-span-2">Commission</div>
          <div className="col-span-1">Cookie</div>
          <div className="col-span-1 text-right">Actions</div>
        </div>
        <div className="divide-y divide-white/5">
          {sorted.map((n) => (
            <div key={n.id} className="grid grid-cols-12 gap-3 px-4 py-4 text-sm">
              <div className="col-span-4 flex items-center gap-2">
                <Link2 className="w-4 h-4 text-gray-500" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-semibold">{n.name}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border ${n.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-gray-500/10 text-gray-400 border-gray-500/20'}`}>
                      {n.status === 'active' ? 'ACTIVE' : 'PAUSED'}
                    </span>
                  </div>
                  <div className="text-[11px] text-gray-500">{n.cookieDays} day cookie</div>
                </div>
              </div>
              <div className="col-span-4 text-xs text-gray-400 truncate" title={n.trackingUrl}>{n.trackingUrl || '—'}</div>
              <div className="col-span-2 text-white">{n.commissionRate}%</div>
              <div className="col-span-1 text-gray-400 text-xs">{n.cookieDays}d</div>
              <div className="col-span-1 flex items-center justify-end gap-2">
                <button
                  onClick={() => updateAffiliateNetwork(n.id, { status: n.status === 'active' ? 'paused' : 'active' })}
                  className="px-2.5 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-gray-300 hover:text-white inline-flex items-center gap-2"
                  aria-label="Toggle"
                >
                  <PencilLine className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => deleteAffiliateNetwork(n.id)}
                  className="px-2.5 py-2 rounded-xl bg-red-500/10 text-red-400 text-xs"
                  aria-label="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
          {sorted.length === 0 && (
            <div className="p-6 text-sm text-gray-400">No networks yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}
