import React from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useCartStore } from '../hooks/useCart';
import { Button } from '../../../components/ui/Button';
import { X, ShoppingBag, Trash2, Share2 } from 'lucide-react';
import { sessionService } from '../services/sessionService';
import { springs, overlayVariants, cartItemVariants, reducedMotionVariants } from '../../../lib/animations';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose }) => {
  const { items, removeItem } = useCartStore();
  const shouldReduceMotion = useReducedMotion();

  const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const handleShare = () => {
    const link = sessionService.generateShareLink(items);
    navigator.clipboard.writeText(link);
    alert('Collaborative Cart link copied to clipboard!');
  };

  const getDrawerTransition = () => {
    if (shouldReduceMotion) {
      return { duration: 0.15 };
    }
    return springs.drawer;
  };

  const getOverlayVariants = () => {
    if (shouldReduceMotion) {
      return reducedMotionVariants;
    }
    return overlayVariants;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            variants={getOverlayVariants()}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            style={{ willChange: 'opacity' }}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={getDrawerTransition()}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-[#0a0a0a] border-l border-white/10 z-[101] shadow-2xl flex flex-col"
            style={{ 
              willChange: 'transform',
              backfaceVisibility: 'hidden',
            }}
            layout
          >
            <motion.div 
              layout
              className="p-6 border-b border-white/5 flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <ShoppingBag className="text-blue-500" />
                <h2 className="text-xl font-bold">Your Cart</h2>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                <X size={20} />
              </button>
            </motion.div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {items.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-12 text-gray-500"
                >
                  <ShoppingBag size={48} className="mx-auto mb-4 opacity-20" />
                  <p>Your cart is empty</p>
                </motion.div>
              ) : (
                <AnimatePresence mode="popLayout">
                  {items.map((item, index) => (
                    <motion.div
                      key={item.id}
                      variants={shouldReduceMotion ? reducedMotionVariants : cartItemVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      custom={index}
                      layout
                      className="flex gap-4 group"
                      style={{ 
                        willChange: 'transform, opacity, height',
                      }}
                      transition={springs.layout}
                    >
                      <div className="w-20 h-20 bg-white/5 rounded-xl overflow-hidden">
                        <img src={item.product.image_url} alt={item.product.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{item.product.name}</h4>
                        <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-blue-400 font-bold">${item.product.price}</span>
                          <button 
                            onClick={() => removeItem(item.product_id)}
                            className="text-gray-600 hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>

            <motion.div 
              layout
              className="p-6 border-t border-white/5 bg-white/5 backdrop-blur-xl"
            >
              <motion.div 
                layout
                className="flex items-center justify-between mb-6"
              >
                <span className="text-gray-400">Subtotal</span>
                <span className="text-2xl font-bold">${total.toFixed(2)}</span>
              </motion.div>
              <div className="flex gap-2 mb-4">
                <Button 
                  variant="secondary" 
                  className="flex-1" 
                  onClick={handleShare}
                  disabled={items.length === 0}
                >
                  <Share2 size={18} className="mr-2" /> Share
                </Button>
              </div>
              <Button className="w-full" size="lg" disabled={items.length === 0}>
                Checkout Now
              </Button>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
