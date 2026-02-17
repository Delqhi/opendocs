import { Sparkles, Target } from 'lucide-react';
import { useShopStore } from '../store/shopStore';

export function PersonalizationBanner() {
  const { userSession, wishlist, recentlyViewed } = useShopStore();
  const name = userSession.profile?.firstName ?? 'Shopper';

  return (
    <div className="surface border border-subtle rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
      <div>
        <p className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          Personalized for {name}
        </p>
        <p className="text-xs text-muted mt-1">
          Based on {wishlist.length} wishlist items and {recentlyViewed.length} recently viewed products.
        </p>
      </div>
      <div className="flex items-center gap-2 text-xs text-muted">
        <Target className="w-4 h-4" />
        Conversion-optimized sorting enabled
      </div>
    </div>
  );
}
