import { Bot, Sparkles, ArrowRight, BadgeCheck } from 'lucide-react';
import { useShopStore } from '../store/shopStore';
import { useMemo } from 'react';

export function SmartAssistantPanel() {
  const { products, wishlist, recentlyViewed } = useShopStore();

  const picks = useMemo(() => {
    const ids = new Set([...wishlist, ...recentlyViewed]);
    const fromHistory = products.filter((p) => ids.has(p.id));
    const categories = new Map<string, number>();
    fromHistory.forEach((p) => categories.set(p.category, (categories.get(p.category) || 0) + 1));
    return [...products]
      .filter((p) => !ids.has(p.id))
      .sort((a, b) => (categories.get(b.category) || 0) - (categories.get(a.category) || 0))
      .slice(0, 4);
  }, [products, wishlist, recentlyViewed]);

  return (
    <div className="surface border border-subtle rounded-2xl p-4 sm:p-5">
      <div className="flex items-center gap-2 text-foreground mb-3">
        <Bot className="w-4 h-4" />
        <p className="text-sm font-semibold">AI Personal Shopper</p>
        <span className="pill pill-muted">personalized</span>
      </div>
      <p className="text-xs text-muted">Based on your activity, these are likely to convert best for you.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
        {picks.map((product) => (
          <div key={product.id} className="flex items-center gap-3 p-3 rounded-xl border border-subtle">
            <img src={product.image} alt={product.name} className="w-12 h-12 rounded-lg object-cover" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-foreground truncate">{product.name}</p>
              <p className="text-[10px] text-muted">{product.category}</p>
            </div>
            <div className="text-[10px] text-emerald-500 flex items-center gap-1">
              <BadgeCheck className="w-3 h-3" /> Verified
            </div>
          </div>
        ))}
      </div>
      <button className="mt-3 text-xs text-foreground inline-flex items-center gap-1">
        See more picks <ArrowRight className="w-3 h-3" />
      </button>
      <div className="mt-3 flex items-center gap-2 text-[10px] text-muted">
        <Sparkles className="w-3 h-3" /> Recommendations update in real time
      </div>
    </div>
  );
}
