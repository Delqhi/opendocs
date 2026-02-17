import { useOptimistic, useTransition } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Leaf, ShoppingBag, Check, Loader2 } from 'lucide-react';
import { springs, reducedMotionVariants } from '../../../lib/animations';
import { type CatalogProduct } from '../services/catalogService';
import { useCartStore } from '../../cart/hooks/useCart';

interface ProductCardProps {
  product: CatalogProduct;
}

type CartUIState = 'idle' | 'adding' | 'added' | 'error';

export const ProductCard = ({ product }: ProductCardProps) => {
  const shouldReduceMotion = useReducedMotion();
  const { addItem } = useCartStore();
  const [isPending, startTransition] = useTransition();
  const [optimisticState, setOptimisticState] = useOptimistic<CartUIState, CartUIState>(
    'idle',
    (_current, next) => next,
  );

  const handleAddToCart = () => {
    setOptimisticState('adding');
    startTransition(async () => {
      try {
        await addItem(product.id, 1);
        setOptimisticState('added');
      } catch {
        setOptimisticState('error');
      }
    });
  };

  const buttonContent = () => {
    switch (optimisticState) {
      case 'adding':
        return <><Loader2 size={14} className="animate-spin" /> Adding...</>;
      case 'added':
        return <><Check size={14} /> Added</>;
      case 'error':
        return 'Failed';
      default:
        return <><ShoppingBag size={14} /> Add to Cart</>;
    }
  };

  const buttonColor = () => {
    switch (optimisticState) {
      case 'added':
        return 'bg-emerald-600 hover:bg-emerald-500';
      case 'error':
        return 'bg-red-600 hover:bg-red-500';
      default:
        return 'bg-blue-600 hover:bg-blue-500';
    }
  };

  const sustainabilityVariants = shouldReduceMotion
    ? { width: `${product.sustainability_score}%` }
    : {
        initial: { width: 0 },
        animate: { width: `${product.sustainability_score}%` },
        transition: springs.layout,
      };

  return (
    <motion.div
      layout
      variants={shouldReduceMotion ? reducedMotionVariants : undefined}
      initial={shouldReduceMotion ? 'hidden' : undefined}
      animate={shouldReduceMotion ? 'visible' : 'visible'}
      exit={shouldReduceMotion ? 'exit' : undefined}
      whileHover={shouldReduceMotion ? undefined : { y: -5 }}
      custom={product.id}
      className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl overflow-hidden shadow-xl relative"
      style={{
        transformOrigin: 'center center',
        willChange: 'transform, opacity',
      }}
      transition={springs.layout}
    >
      {product.sustainability_score > 80 && (
        <motion.div
          layout="position"
          className="absolute top-3 left-3 z-10 px-2 py-1 bg-green-500/20 text-green-400 text-[10px] font-bold rounded-lg border border-green-500/30 flex items-center gap-1 backdrop-blur-md"
        >
          <Leaf size={10} /> ECO FRIENDLY
        </motion.div>
      )}
      <motion.div layout className="aspect-square bg-gray-200 relative overflow-hidden">
        <motion.img
          layout
          src={product.image_url || 'https://via.placeholder.com/400'}
          alt={product.name}
          className="w-full h-full object-cover"
          whileHover={shouldReduceMotion ? undefined : { scale: 1.1 }}
          transition={springs.gentle}
        />
      </motion.div>
      <motion.div layout className="p-4">
        <motion.h3 layout="position" className="text-lg font-semibold text-white">
          {product.name}
        </motion.h3>
        <motion.p layout="position" className="text-gray-400 text-sm mt-1 line-clamp-2">
          {product.description}
        </motion.p>

        {product.sustainability_score > 0 && (
          <motion.div layout="position" className="mt-3 flex items-center gap-2">
            <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
              <motion.div {...sustainabilityVariants} className="h-full bg-green-500" />
            </div>
            <span className="text-[10px] text-gray-500 font-mono">{product.sustainability_score}% SUSTAINABLE</span>
          </motion.div>
        )}

        <motion.div layout="position" className="mt-4 flex items-center justify-between">
          <span className="text-xl font-bold text-blue-400">${product.price}</span>
          <motion.button
            onClick={handleAddToCart}
            disabled={isPending || optimisticState === 'adding'}
            whileHover={shouldReduceMotion ? undefined : { scale: 1.02 }}
            whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
            className={`${buttonColor()} text-white px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 text-sm font-medium disabled:opacity-70`}
          >
            {buttonContent()}
          </motion.button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};
