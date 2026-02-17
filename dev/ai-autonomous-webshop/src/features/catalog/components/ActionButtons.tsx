import { useState, useTransition, useOptimistic } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Check, Loader2, Minus, Plus } from 'lucide-react';
import { useCartStore } from '../../cart/hooks/useCart';

interface ActionButtonsProps {
  productId: number;
  productName: string;
  price: number;
  formatPrice: (price: number) => string;
  onBuyNow?: () => void;
}

type CartState = 'idle' | 'adding' | 'added' | 'error';

export function ActionButtons({ productId, productName, price, formatPrice, onBuyNow }: ActionButtonsProps) {
  const { addItem } = useCartStore();
  const [isPending, startTransition] = useTransition();
  const [quantity, setQuantity] = useState(1);
  const [optimisticState, setOptimisticState] = useOptimistic<CartState, CartState>(
    'idle',
    (_current, next) => next,
  );

  const handleAddToCart = () => {
    setOptimisticState('adding');
    startTransition(async () => {
      try {
        await addItem(productId, quantity);
        setOptimisticState('added');
      } catch {
        setOptimisticState('error');
      }
    });
  };

  const handleBuyNow = () => {
    handleAddToCart();
    onBuyNow?.();
  };

  const buttonContent = () => {
    switch (optimisticState) {
      case 'adding':
        return <><Loader2 size={20} className="animate-spin" /> Adding...</>;
      case 'added':
        return <><Check size={20} /> Added to Cart</>;
      case 'error':
        return 'Failed - Try Again';
      default:
        return <><ShoppingBag size={20} /> Add to Cart - {formatPrice(price * quantity)}</>;
    }
  };

  const buttonColor = () => {
    switch (optimisticState) {
      case 'added':
        return 'bg-emerald-600 hover:bg-emerald-500';
      case 'error':
        return 'bg-red-600 hover:bg-red-500';
      default:
        return 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="flex items-center glass rounded-full">
          <button
            type="button"
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="p-3 hover:bg-white/10 rounded-l-full transition-colors"
            aria-label="Decrease quantity"
          >
            <Minus size={18} />
          </button>
          <span className="w-12 text-center font-semibold">{quantity}</span>
          <button
            type="button"
            onClick={() => setQuantity(quantity + 1)}
            className="p-3 hover:bg-white/10 rounded-r-full transition-colors"
            aria-label="Increase quantity"
          >
            <Plus size={18} />
          </button>
        </div>
        <span className="text-sm text-gray-500">In stock - Fast delivery</span>
      </div>

      <motion.button
        type="button"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleAddToCart}
        disabled={isPending || optimisticState === 'adding'}
        className={`w-full py-4 sm:py-5 rounded-2xl font-bold text-lg transition-all shadow-xl ${buttonColor()}`}
      >
        {buttonContent()}
      </motion.button>

      <motion.button
        type="button"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleBuyNow}
        className="w-full py-4 sm:py-5 rounded-2xl font-bold text-lg transition-all shadow-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
      >
        Buy Now - Instant Checkout
      </motion.button>
    </div>
  );
}
