import { 
  ShoppingCart, 
  User, 
  Search, 
  Heart, 
  Command,
  Zap,
  Camera,
  ArrowUpRight
} from 'lucide-react';
import { useShopStore } from '../store/shopStore';
import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeToggle } from './ThemeToggle';
import { CurrencySelector, useFormatPrice } from './CurrencySelector';
import { useTranslation } from '../hooks/useTranslation';

export function Navbar() {
  const { t } = useTranslation();
  const formatPrice = useFormatPrice();
  const {
    setCurrentView,
    setShopMode,
    cart,
    wishlist,
    searchQuery,
    setSearchQuery,
    toggleCart,
    setSelectedCategory,
    pushToast,
  } = useShopStore();

  const { products } = useShopStore();
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const wishlistCount = wishlist.length;

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    
    // 2026 Semantic "Intent" Matching
    const intentMatches = [
      { trigger: 'cheap', category: 'Price Optimization', msg: 'Filtering best value artifacts' },
      { trigger: 'best', category: 'Curated Excellence', msg: 'Showing highest AI-scored items' },
      { trigger: 'fast', category: 'Logistics Priority', msg: 'Showing immediate dispatch items' },
    ];

    const activeIntent = intentMatches.find(i => q.includes(i.trigger));
    if (activeIntent && searchQuery.length > 3) {
       // We could add logic here to filter store, but for UI we just show the badge
    }

    return products.filter(p => 
      p.name.toLowerCase().includes(q) || 
      p.category.toLowerCase().includes(q) ||
      p.tags.some(t => t.toLowerCase().includes(q))
    ).sort((a, b) => b.aiScore - a.aiScore).slice(0, 6);
  }, [searchQuery, products]);

  return (
    <div className="sticky top-0 z-[60] bg-surface border-b border-subtle h-20 sm:h-24 flex items-center">
      <div className="max-w-[1800px] mx-auto px-6 lg:px-12 w-full flex items-center justify-between gap-12">
        
        {/* Logo - Minimalist High-End */}
        <div 
          className="flex items-center gap-3 cursor-pointer shrink-0"
          onClick={() => {
            setCurrentView('shop');
            setSelectedCategory('All');
            setSearchQuery('');
            setShopMode('browse');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        >
          <div className="w-10 h-10 bg-black dark:bg-white flex items-center justify-center text-white dark:text-black">
            <Zap size={20} strokeWidth={1.5} />
          </div>
          <span className="text-xl font-black uppercase tracking-[0.2em] leading-none hidden sm:block">Nexus</span>
        </div>

        {/* Global Navigation - Minimalist Categories */}
        <div className="hidden lg:flex items-center gap-12 shrink-0">
          {['Technology', 'Wellness', 'Living', 'Essentials'].map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                setCurrentView('shop');
              }}
              className="text-[11px] font-black uppercase tracking-[0.25em] text-muted hover:text-foreground transition-colors"
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search - Refined Amazon Style but Ultra-Clean */}
        <div className="hidden md:flex flex-1 relative group max-w-md">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
            <Search size={14} className="text-muted group-focus-within:text-foreground transition-colors" />
          </div>
          <input 
            type="text"
            placeholder="Visual search or type '/'..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface-alt py-3 pl-12 pr-12 text-xs font-medium focus:outline-none border-b border-transparent focus:border-foreground transition-all"
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-3 text-muted">
            <button 
              onClick={() => pushToast({ type: 'info', message: 'AI-Cam active. Analyzing image...' })}
              className="hover:text-indigo-500 transition-colors relative"
              title="Search by image"
            >
              <Camera size={16} strokeWidth={1.5} />
              <span className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" />
            </button>
            <button 
              onClick={() => window.dispatchEvent(new CustomEvent('open-command-palette'))}
              className="hover:text-foreground"
            >
              <Command size={14} />
            </button>
          </div>

          {/* Instant Search Results Dropdown */}
          <AnimatePresence>
            {searchQuery.length > 1 && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute top-full left-0 right-0 mt-2 bg-surface border border-strong shadow-2xl z-[70] overflow-hidden bg-grain"
              >
                <div className="p-6 space-y-6">
                  {searchResults.length > 0 ? (
                    <>
                      <div className="flex items-center justify-between">
                         <p className="text-[9px] font-black uppercase tracking-[0.3em] text-muted">Intent Matches</p>
                         <span className="text-[8px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-600 px-2 py-0.5">AI Sorted</span>
                      </div>
                      <div className="space-y-3">
                        {searchResults.map(p => (
                          <div 
                            key={p.id}
                            onClick={() => {
                              const { setSelectedProduct, setCurrentView, setSearchQuery } = useShopStore.getState();
                              setSelectedProduct(p);
                              setCurrentView('product-detail');
                              setSearchQuery('');
                            }}
                            className="flex items-center gap-5 p-3 hover:bg-surface-alt cursor-pointer group transition-all border border-transparent hover:border-subtle"
                          >
                            <div className="w-12 h-12 bg-surface-alt overflow-hidden border border-subtle">
                              <img src={p.image} className="w-full h-full object-cover grayscale-[0.5] group-hover:grayscale-0 transition-all duration-700" alt="" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="text-xs font-black uppercase truncate leading-none">{p.name}</p>
                                {p.badge && <span className="text-[7px] font-black uppercase px-1 py-0.5 bg-black text-white dark:bg-white dark:text-black leading-none">{p.badge}</span>}
                              </div>
                              <p className="text-[10px] text-muted uppercase tracking-tighter mt-1">{formatPrice(p.price)} · {p.category}</p>
                            </div>
                            <ArrowUpRight size={14} className="text-muted group-hover:text-foreground group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
                          </div>
                        ))}
                      </div>
                      <button 
                        onClick={() => {
                          setCurrentView('shop');
                          setSearchQuery(searchQuery);
                        }}
                        className="w-full py-3 border-t border-subtle text-[9px] font-black uppercase tracking-[0.3em] text-muted hover:text-foreground transition-colors"
                      >
                         View All Results
                      </button>
                    </>
                  ) : (
                    <div className="text-center py-10 space-y-4">
                       <Search size={24} className="mx-auto text-muted opacity-20" />
                       <p className="text-xs font-black uppercase tracking-widest text-muted">No artifacts found for "{searchQuery}"</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Actions - Editorial Style Icons */}
        <div className="flex items-center gap-2 sm:gap-6 shrink-0">
          <div className="hidden sm:flex items-center gap-4 border-r border-subtle pr-6 mr-2">
            <CurrencySelector />
            <ThemeToggle />
          </div>

          <button 
            onClick={() => setCurrentView('account')}
            className="flex items-center gap-3 p-2 text-muted hover:text-foreground transition-all group relative"
            aria-label="Account"
          >
            <div className="flex flex-col items-end hidden sm:flex">
               {useShopStore.getState().userSession.loggedIn ? (
                 <div className="flex items-center gap-1.5">
                   <span className="text-[8px] font-black uppercase tracking-[0.2em] px-1.5 py-0.5 rounded-full bg-indigo-600 text-white leading-none">
                      {useShopStore.getState().userSession.profile?.loyaltyTier}
                   </span>
                   <span className="text-[10px] font-black text-foreground uppercase tracking-wider">
                      {useShopStore.getState().userSession.profile?.firstName}
                   </span>
                 </div>
               ) : (
                 <>
                   <span className="text-[9px] font-black uppercase tracking-widest leading-none mb-0.5 opacity-50">Guest</span>
                   <span className="text-[10px] font-bold text-foreground">Sign In</span>
                 </>
               )}
            </div>
            <div className="relative">
              <User size={20} strokeWidth={1.5} />
              {useShopStore.getState().userSession.loggedIn && (
                <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full border border-surface shadow-sm" />
              )}
            </div>
          </button>

          <button 
            onClick={() => setCurrentView('wishlist')}
            className="p-2 text-muted hover:text-foreground transition-colors relative"
            aria-label="Wishlist"
          >
            <Heart size={20} strokeWidth={1.5} />
            {wishlistCount > 0 && (
              <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-black dark:bg-white" />
            )}
          </button>

          <button 
            onClick={toggleCart}
            className="group flex items-center gap-4 bg-black dark:bg-white text-white dark:text-black py-3 px-6 hover:opacity-90 transition-all active:scale-95"
          >
            <ShoppingCart size={18} strokeWidth={2} />
            <span className="text-[11px] font-black uppercase tracking-widest hidden sm:block">{t('cart')} ({cartCount})</span>
            <span className="text-[11px] font-black sm:hidden">{cartCount}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
