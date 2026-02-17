import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { ProductGrid } from './features/catalog/components/ProductGrid';
import { SmartRecommendations } from './features/catalog/components/SmartRecommendations';
import { VirtualTryOn } from './features/catalog/components/VirtualTryOn';
import { SearchBar } from './features/catalog/components/SearchBar';
import { Button } from './components/ui/Button';
import { CartDrawer } from './features/cart/components/CartDrawer';
import { LoginForm } from './features/auth/components/LoginForm';
import { AdminDashboard } from './features/admin/components/AdminDashboard';
import { ShoppingCart, User, Shield, Languages } from 'lucide-react';
import { VoiceController } from './components/VoiceController';
import { NotificationToast } from './components/ui/NotificationToast';
import { InstallPrompt } from './components/InstallPrompt';
import { useWebSocket } from './lib/notifications/useWebSocket';
import { useTabRecovery } from './hooks/useTabRecovery';
import { 
  fadeIn, 
  fadeInUp, 
  staggerContainer, 
  staggerItem,
  pageTransition,
  springs,
  reducedMotionVariants
} from './lib/animations';
import { useAnimationConfig } from './lib/useAnimationConfig';

import { sessionService } from './features/cart/services/sessionService';
import { useCartStore } from './features/cart/hooks/useCart';

function App() {
  const { t, i18n } = useTranslation();
  useWebSocket();
  useTabRecovery({
    hiddenTitle: "Don't forget your cart! 🛒",
    originalTitle: "NEXUS AI Shop",
  });
  const { addItem } = useCartStore();
  const [view, setView] = useState<'shop' | 'admin' | 'login'>('shop');
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  const shouldReduceMotion = useReducedMotion();
  const { reducedMotion } = useAnimationConfig();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cartSession = params.get('cart_session');
    if (cartSession) {
      const sharedItems = sessionService.loadSharedCart(cartSession);
      if (sharedItems) {
        sharedItems.forEach((item: any) => addItem(item.id, item.q));
        alert('Shared cart items added!');
        window.history.replaceState({}, document.title, "/");
      }
    }
  }, [addItem]);

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'en' ? 'de' : 'en';
    i18n.changeLanguage(nextLang);
  };

  const getPageVariants = () => {
    if (shouldReduceMotion) {
      return reducedMotionVariants;
    }
    return pageTransition;
  };

  const getHeroVariants = () => {
    if (shouldReduceMotion) {
      return {
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
        exit: { opacity: 0 },
      };
    }
    return fadeInUp;
  };

  const heroTransition = shouldReduceMotion 
    ? { duration: 0.2 }
    : { delayChildren: 0.1, staggerChildren: 0.1 };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-blue-500/30">
      <InstallPrompt />
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-white/5 bg-black/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView('shop')}>
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold italic">N</div>
              <span className="text-xl font-bold tracking-tight">NEXUS<span className="text-blue-500">AI</span></span>
            </div>
            
            <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
              <button onClick={() => setView('shop')} className={`hover:text-white transition-colors ${view === 'shop' ? 'text-white' : ''}`}>{t('catalog')}</button>
              <a href="#" className="hover:text-white transition-colors">{t('trending')}</a>
              <a href="#" className="hover:text-white transition-colors">{t('ai_scout')}</a>
            </div>

            <div className="flex items-center gap-4">
              <button 
                onClick={toggleLanguage}
                className="p-2 text-gray-400 hover:text-white transition-colors flex items-center gap-1"
                title="Change Language"
              >
                <Languages size={18} />
                <span className="text-xs font-bold uppercase">{i18n.language}</span>
              </button>
              <button 
                onClick={() => setView('admin')}
                className="p-2 text-gray-400 hover:text-white transition-colors"
                title="Admin Dashboard"
              >
                <Shield size={20} />
              </button>
              <button 
                onClick={() => setIsCartOpen(true)}
                className="p-2 text-gray-400 hover:text-white transition-colors relative"
              >
                <ShoppingCart size={20} />
                <span className="absolute top-0 right-0 w-4 h-4 bg-blue-600 text-[10px] flex items-center justify-center rounded-full border border-black">3</span>
              </button>
              <Button variant="secondary" size="sm" onClick={() => setView('login')}>
                <User size={16} className="mr-2" />
                {t('login')}
              </Button>
              <VoiceController />
            </div>
          </div>
        </div>
      </nav>

      <AnimatePresence mode="wait">
        {view === 'shop' && (
          <motion.div
            key="shop"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={getPageVariants()}
            transition={springs.standard}
            layout
          >
            {/* Hero Section */}
            <header className="relative py-24 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-blue-600/10 to-transparent pointer-events-none" />
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                <motion.div 
                  className="text-center max-w-3xl mx-auto"
                  variants={getHeroVariants()}
                  transition={heroTransition}
                >
                  <motion.h1 
                    variants={shouldReduceMotion ? undefined : staggerItem}
                    className="text-5xl md:text-7xl font-extrabold tracking-tight"
                  >
                    {t('hero_title').split('Autonomous')[0]} <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500">Autonomous</span> {t('hero_title').split('Autonomous')[1]}
                  </motion.h1>
                  <motion.p 
                    variants={shouldReduceMotion ? undefined : staggerItem}
                    className="mt-6 text-xl text-gray-400 leading-relaxed"
                  >
                    {t('hero_subtitle')}
                  </motion.p>
                  
                  <motion.div 
                    variants={shouldReduceMotion ? undefined : staggerItem}
                    className="mt-12 flex justify-center"
                  >
                    <SearchBar />
                  </motion.div>

                  <motion.div 
                    variants={shouldReduceMotion ? undefined : staggerItem}
                    className="mt-10 flex flex-wrap justify-center gap-4"
                  >
                    <Button size="lg">{t('shop_collection')}</Button>
                    <Button variant="secondary" size="lg">{t('learn_more')}</Button>
                  </motion.div>
                </motion.div>
              </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <motion.div 
                className="flex items-center justify-between mb-12"
                variants={shouldReduceMotion ? undefined : staggerItem}
                layout
              >
                <h2 className="text-3xl font-bold">{t('featured_products')}</h2>
                <div className="flex gap-2">
                  <span className="px-3 py-1 bg-blue-600/20 text-blue-400 text-xs font-bold rounded-full border border-blue-600/30 uppercase tracking-wider">{t('ai_curated')}</span>
                </div>
              </motion.div>
              <ProductGrid />
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mt-12">
                <div className="lg:col-span-2">
                  <SmartRecommendations />
                </div>
                <div className="lg:col-span-1">
                  <VirtualTryOn />
                </div>
              </div>
            </main>
          </motion.div>
        )}

        {view === 'admin' && (
          <motion.div
            key="admin"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={getPageVariants()}
            transition={springs.standard}
            layout
          >
            <AdminDashboard />
          </motion.div>
        )}

        {view === 'login' && (
          <motion.div
            key="login"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={shouldReduceMotion ? reducedMotionVariants : {
              hidden: { opacity: 0, scale: 0.95 },
              visible: { opacity: 1, scale: 1 },
              exit: { opacity: 0, scale: 1.05 },
            }}
            transition={springs.modal}
            className="flex items-center justify-center min-h-[calc(100-64px)] py-24"
            layout
          >
            <LoginForm />
          </motion.div>
        )}
      </AnimatePresence>

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      <NotificationToast />

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-500 text-sm">
          <p>© 2026 NEXUS AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
