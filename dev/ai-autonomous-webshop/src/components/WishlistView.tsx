import { Heart, ArrowLeft, ShoppingBag } from 'lucide-react';
import { useShopStore } from '../store/shopStore';
import { ProductCard } from './ProductCard';
import { useMemo } from 'react';

interface WishlistViewProps {
  onSelect: (productId: string) => void;
  onBack: () => void;
}

export function WishlistView({ onSelect, onBack }: WishlistViewProps) {
  const { wishlist, products, toggleWishlist } = useShopStore();

  const wishlistProducts = useMemo(
    () => wishlist.map((id) => products.find((p) => p.id === id)).filter(Boolean),
    [wishlist, products]
  );

  if (wishlistProducts.length === 0) {
    return (
      <div className="surface border border-subtle rounded-3xl p-8 text-center">
        <div className="w-14 h-14 rounded-2xl surface border border-subtle flex items-center justify-center mx-auto mb-4">
          <Heart className="w-6 h-6 text-muted" />
        </div>
        <h2 className="text-lg font-semibold text-foreground">Your wishlist is empty</h2>
        <p className="text-sm text-muted mt-1">Save products to compare later or purchase quickly.</p>
        <button
          onClick={onBack}
          className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-foreground text-white text-sm font-semibold"
        >
          <ArrowLeft className="w-4 h-4" /> Continue shopping
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">Your Wishlist</h2>
          <p className="text-xs text-muted">{wishlistProducts.length} saved items</p>
        </div>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs text-muted hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" /> Back to shop
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
        {wishlistProducts.map((product) =>
          product ? (
            <div key={product.id} className="relative">
              <ProductCard
                product={product}
                onSelect={() => onSelect(product.id)}
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleWishlist(product.id);
                }}
                className="absolute bottom-3 left-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] bg-black/70 text-white"
              >
                <ShoppingBag className="w-3 h-3" /> Remove
              </button>
            </div>
          ) : null
        )}
      </div>
    </div>
  );
}
