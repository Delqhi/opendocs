import { Heart } from 'lucide-react';
import { useShopStore } from '../store/shopStore';

interface WishlistButtonProps {
  productId: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function WishlistButton({ productId, size = 'md', className = '' }: WishlistButtonProps) {
  const { wishlist, toggleWishlist } = useShopStore();
  const isWishlisted = wishlist.includes(productId);

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const buttonSizeClasses = {
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-2.5',
  };

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        toggleWishlist(productId);
      }}
      className={`${buttonSizeClasses[size]} rounded-full transition-all ${
        isWishlisted
          ? 'bg-red-500 text-white'
          : 'bg-white/90 dark:bg-black/50 text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-black/70 hover:text-red-500'
      } ${className}`}
      aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
    >
      <Heart className={`${sizeClasses[size]} ${isWishlisted ? 'fill-current' : ''}`} />
    </button>
  );
}
