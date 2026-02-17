import { X, ArrowRight, CreditCard, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useShopStore } from '../store/shopStore';
import { useFormatPrice } from './CurrencySelector';

export function InstantPurchaseModal() {
  const { purchaseModal, setPurchaseModal, products, addToCart, toggleCart } = useShopStore();
  const formatPrice = useFormatPrice();

  if (!purchaseModal.open || !purchaseModal.product) return null;

  const product = purchaseModal.product;
  const related = products.filter(p => p.category === product.category && p.id !== product.id).slice(0, 2);

  const handleCheckout = () => {
    setPurchaseModal(false, null);
    toggleCart();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setPurchaseModal(false, null)}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl bg-white dark:bg-[#09090b] border border-strong shadow-2xl overflow-hidden"
        >
          <div className="absolute top-6 right-6 z-10">
            <button 
              onClick={() => setPurchaseModal(false, null)}
              className="p-2 text-muted hover:text-foreground transition-colors"
            >
              <X size={24} strokeWidth={1} />
            </button>
          </div>

          <div className="flex flex-col md:flex-row h-full">
            <div className="w-full md:w-1/2 aspect-square bg-surface-alt">
              <img src={product.image} className="w-full h-full object-cover grayscale-[0.2]" alt="" />
            </div>

            <div className="flex-1 p-8 md:p-10 flex flex-col justify-center space-y-10">
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-meta text-emerald-500 font-black">
                   <ShieldCheck size={16} strokeWidth={3} /> Added to Bag
                </div>
                <h2 className="text-3xl font-serif italic tracking-tighter leading-none">{product.name}</h2>
                <p className="text-xl font-black">{formatPrice(product.price)}</p>
              </div>

              <div className="space-y-4">
                <button 
                  onClick={handleCheckout}
                  className="w-full btn-brand py-5 flex items-center justify-center gap-4 group shadow-xl"
                >
                  <CreditCard size={18} /> Express Checkout <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </button>
                <button 
                  onClick={() => setPurchaseModal(false, null)}
                  className="w-full border border-subtle py-4 text-meta font-black hover:bg-surface-alt transition-colors"
                >
                  Continue Browsing
                </button>
              </div>

              {related.length > 0 && (
                <div className="pt-10 border-t border-subtle">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted mb-6">Complete the Studio</p>
                  <div className="grid grid-cols-2 gap-4">
                    {related.map(p => (
                      <div key={p.id} className="flex items-center gap-3 group cursor-pointer" onClick={() => addToCart(p)}>
                         <div className="w-10 h-10 bg-surface-alt overflow-hidden border border-subtle">
                           <img src={p.image} className="w-full h-full object-cover" alt="" />
                         </div>
                         <div className="min-w-0">
                           <p className="text-[9px] font-black uppercase truncate">{p.name}</p>
                           <p className="text-[9px] text-muted">+ Add</p>
                         </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
