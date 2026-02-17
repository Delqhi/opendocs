import { type Product, useShopStore } from '../store/shopStore';
import { useState } from 'react';
import { useFormatPrice } from './CurrencySelector';
import { OptimizedImage } from './OptimizedImage';
import { Star, Heart, Check, ShoppingBag, AlertCircle, TrendingUp, Clock } from 'lucide-react';

export function ProductCard({ product, onSelect }: { product: Product; onSelect?: (product: Product) => void }) {
  const { addToCart, wishlist, toggleWishlist } = useShopStore();
  const formatPrice = useFormatPrice();
  const [added, setAdded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  const isWishlisted = wishlist.includes(product.id);
  const discount = Math.round((1 - product.price / product.originalPrice) * 100);
  const hasSecondaryImage = product.images && product.images.length > 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleSelect = () => {
    if (onSelect) {
      onSelect(product);
    }
  };

  return (
    <div
      onClick={handleSelect}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group cursor-pointer bg-transparent"
    >
      {/* Media Area - Absolute Studio Aspect Ratio */}
      <div className="relative aspect-[4/5] overflow-hidden bg-surface-alt mb-6 rounded-none">
        <div className="absolute inset-0 transition-opacity duration-1000">
           <OptimizedImage
            src={product.image}
            alt={product.name}
            className={`h-full w-full transition-opacity duration-1000 ${isHovered && hasSecondaryImage ? 'opacity-0' : 'opacity-100'}`}
            imgClassName={`transition-transform duration-[5s] ease-out ${isHovered ? 'scale-110' : 'scale-100'}`}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        </div>

        {hasSecondaryImage && (
          <div className={`absolute inset-0 transition-opacity duration-1000 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
            <OptimizedImage
              src={product.images![0]}
              alt={`${product.name} alternate view`}
              className="h-full w-full"
              imgClassName={`transition-transform duration-[5s] ease-out ${isHovered ? 'scale-100' : 'scale-110'}`}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          </div>
        )}

        {/* Studio Badges */}
        <div className="absolute top-0 left-0 z-10 flex flex-col">
          {discount > 0 && (
            <span className="px-3 py-1.5 bg-red-600 text-white text-[9px] font-black uppercase tracking-widest">
              -{discount}% OFF
            </span>
          )}
          {product.badge && (
            <span className="px-3 py-1.5 bg-white text-black text-[8px] font-black uppercase tracking-widest border-b border-black/5">
              {product.badge}
            </span>
          )}
        </div>

        {/* Minimal Wishlist */}
        <button 
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          className={`absolute top-4 right-4 z-10 p-2 transition-all ${
            isWishlisted ? 'text-red-600' : 'text-white/40 hover:text-white'
          }`}
        >
          <Heart size={18} strokeWidth={1} className={isWishlisted ? 'fill-current' : ''} />
        </button>

        {/* Quick Add Bottom Strip */}
        <div className={`absolute inset-x-0 bottom-0 transition-all duration-700 ${isHovered ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
           <button
            onClick={handleAddToCart}
            className={`w-full py-4 font-black uppercase tracking-[0.3em] text-[9px] flex items-center justify-center gap-3 transition-all ${
              added ? 'bg-emerald-600 text-white' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-2xl'
            }`}
          >
            {added ? <Check size={14} strokeWidth={3} /> : <ShoppingBag size={14} strokeWidth={2.5} />}
            {added ? 'Added' : 'Secure Artifact'}
          </button>
        </div>
      </div>

      {/* Studio Typography Content */}
      <div className="text-center px-4 space-y-2">
        <div className="flex flex-col items-center gap-1.5 mb-2">
          <div className="flex items-center justify-center gap-3 text-[8px] font-black uppercase tracking-widest">
            {product.stock > 50 ? (
              <span className="text-emerald-500 flex items-center gap-1"><Check size={8} strokeWidth={3} /> In Stock</span>
            ) : (
              <span className="text-red-600 flex items-center gap-1"><AlertCircle size={8} strokeWidth={3} /> {product.stock} Units Left</span>
            )}
            
            {product.sold > 1000 && (
              <span className="text-blue-500 flex items-center gap-1">
                <TrendingUp size={8} strokeWidth={3} /> 
                {Math.floor(product.sold / 240).toLocaleString()}+ sold today
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-1 text-[7px] font-black uppercase tracking-tighter text-muted opacity-60">
            <Clock size={8} strokeWidth={2} />
            <span>Est. Arrival: 4–6 Business Days</span>
          </div>
        </div>

        <h3 className="text-[11px] font-black text-foreground uppercase tracking-[0.2em] line-clamp-1">
          {product.name}
        </h3>
        
        <div className="flex items-center justify-center gap-4">
          <span className="text-xs font-black text-foreground">
            {formatPrice(product.price)}
          </span>
          {product.originalPrice > product.price && (
            <span className="text-[10px] text-red-600 font-bold">
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>

        <div className="mt-4 flex items-center justify-center gap-2">
           <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  size={8} 
                  strokeWidth={0}
                  className={i < Math.floor(product.rating) ? 'fill-black dark:fill-white' : 'fill-gray-200 dark:fill-zinc-800'} 
                />
              ))}
            </div>
            <div className="h-px w-4 bg-border mx-1" />
            <span className="text-[8px] font-black text-muted uppercase tracking-widest">{product.reviews.toLocaleString()} verified</span>
        </div>
      </div>
    </div>
  );
}
