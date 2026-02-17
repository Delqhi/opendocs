import { useEffect, useMemo, useState } from 'react';
import { Clock, Flame, ArrowRight } from 'lucide-react';
import { useShopStore } from '../store/shopStore';
import { useFormatPrice } from './CurrencySelector';
import { LazyImage } from './LazyImage';

interface FlashDealsBannerProps {
  onShopDeals: () => void;
}

const secondsUntilEndOfDayUTC = () => {
  const now = new Date();
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59));
  return Math.max(0, Math.floor((end.getTime() - now.getTime()) / 1000));
};

const fmt = (sec: number) => {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

export function FlashDealsBanner({ onShopDeals }: FlashDealsBannerProps) {
  const { products } = useShopStore();
  const formatPrice = useFormatPrice();
  const [seconds, setSeconds] = useState(secondsUntilEndOfDayUTC());

  useEffect(() => {
    const id = setInterval(() => setSeconds((v) => Math.max(0, v - 1)), 1000);
    return () => clearInterval(id);
  }, []);

  const deals = useMemo(() => {
    const scored = products
      .map((p) => ({
        p,
        discount: p.originalPrice > 0 ? Math.round((1 - p.price / p.originalPrice) * 100) : 0,
      }))
      .filter((x) => x.discount >= 35)
      .sort((a, b) => b.discount - a.discount)
      .slice(0, 3)
      .map((x) => x.p);

    return scored;
  }, [products]);

  if (deals.length === 0) return null;

  return (
    <div className="surface-elev border border-subtle rounded-3xl overflow-hidden">
      <div className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-2 pill">
              <Flame className="w-4 h-4 text-foreground" />
              Flash Deals
              <span className="pill pill-muted flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> {fmt(seconds)}
              </span>
            </div>
            <p className="mt-2 text-sm text-muted">
              Limited-time discounts on the fastest-moving products.
            </p>
          </div>

          <button
            onClick={onShopDeals}
            className="px-4 py-2 rounded-xl bg-foreground text-white text-xs font-semibold inline-flex items-center justify-center gap-2"
          >
            Shop deals <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2 sm:gap-3">
          {deals.map((p) => (
            <button
              key={p.id}
              onClick={onShopDeals}
              className="text-left rounded-2xl border border-subtle overflow-hidden hover:border-[var(--border-strong)] transition-colors"
            >
              <LazyImage src={p.image} alt={p.name} className="h-20 sm:h-24" />
              <div className="p-2.5">
                <p className="text-[11px] font-semibold text-foreground truncate">{p.name}</p>
                <p className="text-[10px] text-muted mt-0.5">
                  {formatPrice(p.price)}
                  <span className="ml-2 line-through opacity-70">{formatPrice(p.originalPrice)}</span>
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
