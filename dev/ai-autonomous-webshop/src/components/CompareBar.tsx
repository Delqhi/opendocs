import { ArrowRight, X } from 'lucide-react';
import { useShopStore } from '../store/shopStore';
import { LazyImage } from './LazyImage';

export function CompareBar() {
  const { compareList, products, toggleCompare, setShopMode, setCurrentView } = useShopStore();

  const items = compareList
    .map((id) => products.find((p) => p.id === id))
    .filter(Boolean);

  if (items.length === 0) return null;

  return (
    <div className="fixed left-1/2 -translate-x-1/2 bottom-20 sm:bottom-6 z-[65] w-[94%] max-w-3xl">
      <div className="surface-elev border border-subtle rounded-2xl p-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            {items.map((p) =>
              p ? (
                <div key={p.id} className="flex items-center gap-2 shrink-0 pr-2">
                  <div className="w-9 h-9 rounded-xl overflow-hidden border border-subtle">
                    <LazyImage src={p.image} alt={p.name} className="w-9 h-9" />
                  </div>
                  <button
                    onClick={() => toggleCompare(p.id)}
                    className="p-1 rounded-lg text-muted hover:text-foreground"
                    aria-label="Remove from compare"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : null
            )}
          </div>

          <button
            onClick={() => {
              setCurrentView('shop');
              setShopMode('compare');
            }}
            className="px-3 py-2 rounded-xl bg-foreground text-white text-xs font-semibold inline-flex items-center gap-2 shrink-0"
          >
            Compare ({items.length}) <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
