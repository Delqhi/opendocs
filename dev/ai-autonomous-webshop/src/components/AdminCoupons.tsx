import { useMemo, useState } from 'react';
import { Plus, Tag, Trash2, PencilLine, CheckCircle } from 'lucide-react';
import { useShopStore, type Coupon } from '../store/shopStore';

const emptyCoupon: Omit<Coupon, 'id' | 'usedCount'> = {
  code: '',
  type: 'percentage',
  value: 10,
  minOrder: 25,
  maxUses: 1000,
  expiresAt: null,
  active: true,
};

export function AdminCoupons() {
  const { coupons, addCoupon, updateCoupon, deleteCoupon } = useShopStore();
  const [draft, setDraft] = useState(emptyCoupon);

  const sorted = useMemo(() => {
    return [...coupons].sort((a, b) => a.code.localeCompare(b.code));
  }, [coupons]);

  const createCoupon = () => {
    if (!draft.code.trim()) return;
    addCoupon({
      ...draft,
      id: `coup-${Date.now()}`,
      code: draft.code.trim().toUpperCase(),
      usedCount: 0,
    });
    setDraft(emptyCoupon);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Coupons</h2>
        <p className="text-sm text-gray-500">Create discount codes for cart & checkout.</p>
      </div>

      <div className="glass rounded-2xl p-5 space-y-4">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2"><Plus className="w-4 h-4" /> New coupon</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <input
            className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white"
            placeholder="CODE"
            value={draft.code}
            onChange={(e) => setDraft((p) => ({ ...p, code: e.target.value }))}
          />
          <select
            className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white"
            value={draft.type}
            onChange={(e) => setDraft((p) => ({ ...p, type: e.target.value as Coupon['type'] }))}
          >
            <option value="percentage">Percentage</option>
            <option value="fixed">Fixed</option>
          </select>
          <input
            type="number"
            className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white"
            placeholder="Value"
            value={draft.value}
            onChange={(e) => setDraft((p) => ({ ...p, value: Number(e.target.value) }))}
          />
          <input
            type="number"
            className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white"
            placeholder="Min order"
            value={draft.minOrder}
            onChange={(e) => setDraft((p) => ({ ...p, minOrder: Number(e.target.value) }))}
          />
          <input
            type="number"
            className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white"
            placeholder="Max uses"
            value={draft.maxUses}
            onChange={(e) => setDraft((p) => ({ ...p, maxUses: Number(e.target.value) }))}
          />
        </div>
        <button onClick={createCoupon} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-black text-sm font-semibold">
          <CheckCircle className="w-4 h-4" /> Create coupon
        </button>
      </div>

      <div className="glass rounded-2xl overflow-hidden">
        <div className="grid grid-cols-12 gap-3 px-4 py-3 border-b border-white/5 text-[10px] uppercase tracking-wider text-gray-500">
          <div className="col-span-3">Code</div>
          <div className="col-span-2">Type</div>
          <div className="col-span-2">Value</div>
          <div className="col-span-2">Min</div>
          <div className="col-span-1">Used</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>
        <div className="divide-y divide-white/5">
          {sorted.map((c) => (
            <div key={c.id} className="grid grid-cols-12 gap-3 px-4 py-4 text-sm">
              <div className="col-span-3 flex items-center gap-2">
                <Tag className="w-4 h-4 text-gray-500" />
                <span className="text-white font-semibold">{c.code}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full border ${c.active ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-gray-500/10 text-gray-400 border-gray-500/20'}`}>
                  {c.active ? 'ACTIVE' : 'PAUSED'}
                </span>
              </div>
              <div className="col-span-2 text-gray-400 text-xs">{c.type}</div>
              <div className="col-span-2 text-white">
                {c.type === 'percentage' ? `${c.value}%` : `$${c.value}`}
              </div>
              <div className="col-span-2 text-gray-400 text-xs">${c.minOrder}</div>
              <div className="col-span-1 text-gray-400 text-xs">{c.usedCount}/{c.maxUses}</div>
              <div className="col-span-2 flex items-center justify-end gap-2">
                <button
                  onClick={() => updateCoupon(c.id, { active: !c.active })}
                  className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-gray-300 hover:text-white inline-flex items-center gap-2"
                >
                  <PencilLine className="w-3.5 h-3.5" /> Toggle
                </button>
                <button
                  onClick={() => deleteCoupon(c.id)}
                  className="px-3 py-2 rounded-xl bg-red-500/10 text-red-400 text-xs"
                  aria-label="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
          {sorted.length === 0 && (
            <div className="p-6 text-sm text-gray-400">No coupons yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}
