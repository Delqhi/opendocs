import React, { useState, useEffect, useMemo } from 'react';
import { 
  ArrowRight,
  ShieldCheck,
  ShoppingCart,
  ArrowUpRight,
  Zap,
  Flame
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useShopStore } from '../store/shopStore';
import { ProductCard } from './ProductCard';
import { RecentlyViewed } from './RecentlyViewed';
import { useFormatPrice } from './CurrencySelector';
import { useTranslation } from '../hooks/useTranslation';

// --- SIDEBAR MINI CART ---
const SidebarCart = () => {
  const { cart, toggleCart } = useShopStore();
  const formatPrice = useFormatPrice();
  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  return (
    <div className="surface border-b border-subtle lg:border lg:rounded-none p-6 bg-white dark:bg-black">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <ShoppingCart size={18} />
          <h3 className="text-xs font-black uppercase tracking-[0.2em]">Your Bag</h3>
        </div>
        <span className="text-[10px] font-black border border-black dark:border-white px-2 py-0.5">
          {cart.length}
        </span>
      </div>

      {cart.length === 0 ? (
        <p className="text-[10px] text-muted py-8 text-center uppercase tracking-widest">Bag is empty</p>
      ) : (
        <div className="space-y-5 mb-6 max-h-[220px] overflow-y-auto no-scrollbar">
          {cart.slice(0, 3).map((item) => (
            <div key={item.product.id} className="flex gap-4 items-center">
              <div className="w-12 h-15 bg-surface-alt flex-shrink-0">
                <img src={item.product.image} className="w-full h-full object-cover" alt="" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-black uppercase tracking-wider truncate">{item.product.name}</p>
                <p className="text-[10px] text-muted mt-1">{item.quantity} × {formatPrice(item.product.price)}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="pt-5 border-t border-subtle">
        <div className="flex justify-between mb-6">
          <span className="text-[10px] font-black uppercase tracking-widest text-muted">Subtotal</span>
          <span className="text-xs font-black">{formatPrice(subtotal)}</span>
        </div>
        <button 
          onClick={toggleCart}
          className="w-full py-4 bg-black dark:bg-white text-white dark:text-black text-[10px] font-black uppercase tracking-[0.3em] hover:bg-blue-600 dark:hover:bg-blue-600 transition-colors"
        >
          Checkout
        </button>
      </div>
    </div>
  );
};

// --- SIDEBAR FLASH DEALS ---
const SidebarDeals = () => {
  const { products, addToCart } = useShopStore();
  const formatPrice = useFormatPrice();
  const [seconds, setSeconds] = useState(34522);

  useEffect(() => {
    const id = setInterval(() => setSeconds(v => Math.max(0, v - 1)), 1000);
    return () => clearInterval(id);
  }, []);

  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${h}:${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const deal = useMemo(() => products.find(p => p.id === 'p1') || products[0], [products]);

  return (
    <div className="surface border lg:border-t-0 p-6 bg-white dark:bg-black border-red-600/20">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2 text-red-600">
          <Zap size={14} fill="currentColor" />
          <h3 className="text-[9px] font-black uppercase tracking-[0.3em]">Flash Sale Active</h3>
        </div>
        <div className="bg-red-600 text-white px-2 py-0.5 rounded text-[10px] font-mono font-bold">{formatTime(seconds)}</div>
      </div>

      <div className="relative aspect-[4/5] bg-surface-alt mb-4 group cursor-pointer overflow-hidden" onClick={() => addToCart(deal)}>
        <img src={deal.image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 grayscale-[0.3] group-hover:grayscale-0" alt="" />
        <div className="absolute top-0 right-0 bg-red-600 text-white px-3 py-1.5 text-[10px] font-black uppercase tracking-widest">
           Save 42%
        </div>
        <div className="absolute inset-x-0 bottom-0 p-4 bg-black/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
           <p className="text-[10px] text-white font-black uppercase text-center tracking-[0.2em]">Secure Artifact</p>
        </div>
      </div>

      <div className="mb-6">
        <h4 className="text-[10px] font-black uppercase tracking-wider line-clamp-1">{deal.name}</h4>
        <div className="flex items-center gap-4 mt-2">
          <span className="text-sm font-black text-red-600">{formatPrice(deal.price)}</span>
          <span className="text-[10px] text-muted line-through opacity-40">{formatPrice(deal.originalPrice)}</span>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-red-600">
          <span>Urgent: Low Stock</span>
          <span>Only 12 Left</span>
        </div>
        <div className="h-1 w-full bg-red-600/10 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: '15%' }}
            className="h-full bg-red-600" 
          />
        </div>
      </div>
    </div>
  );
};

export const ShopView: React.FC = () => {
  const { t } = useTranslation();
  const { products, searchQuery, selectedCategory, setSelectedCategory, setSelectedProduct, setCurrentView, darkMode } = useShopStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 600);
    return () => { clearTimeout(timer); };
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesCategory = selectedCategory.toLowerCase() === 'all' || p.category.toLowerCase().includes(selectedCategory.toLowerCase());
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [products, searchQuery, selectedCategory]);

  const categories = [
    { name: 'Technology', image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600&q=80', count: 124 },
    { name: 'Wellness', image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&q=80', count: 85 },
    { name: 'Living', image: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=600&q=80', count: 210 },
    { name: 'Essentials', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80', count: 342 }
  ];

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-white dark:bg-black">
         <div className="w-8 h-8 border border-black/10 dark:border-white/10 border-t-black dark:border-t-white animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-app min-h-screen">
      
      {/* AI PRICE INTEGRITY WIDGET */}
      <div className={`border-b ${darkMode ? 'bg-black border-white/5' : 'bg-white border-black/5'} py-2.5 overflow-hidden`}>
        <div className="max-w-[1920px] mx-auto px-6 lg:px-12 flex items-center justify-between">
           <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                 <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-50">AI Integrity Node 08</span>
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest hidden sm:block">
                 Today's AI Negotiated Savings: <span className="text-emerald-500">$12,842.50</span>
              </p>
           </div>
           <div className="flex items-center gap-6 text-[9px] font-black uppercase tracking-widest">
              <span className="text-muted">Network Load: 12%</span>
              <span className="text-muted hidden md:block">Orders/hr: 142</span>
           </div>
        </div>
      </div>

      {/* --- ROW 1: TRENDING NOW (75%) | SIDEBAR (25%) --- */}
      <div className="max-w-[1920px] mx-auto">
        <div className="flex flex-col lg:flex-row">
          
          {/* Trending Highlights Area */}
          <div className="lg:w-[75%] p-4 lg:p-8 border-r border-subtle bg-white dark:bg-black">
             <div className="flex items-end justify-between mb-8">
                <div className="flex items-center gap-4">
                   <div className="w-8 h-8 rounded-full bg-blue-600/10 flex items-center justify-center text-blue-600">
                      <Flame size={16} fill="currentColor" />
                   </div>
                   <div>
                      <p className="text-[9px] font-black uppercase tracking-[0.4em] text-blue-600 leading-none mb-1">Live Momentum</p>
                      <h2 className="text-3xl sm:text-4xl font-serif tracking-tighter italic leading-none">{t('trending')}</h2>
                   </div>
                </div>
                <button className="hidden sm:flex items-center gap-3 text-[9px] font-black uppercase tracking-[0.2em] text-muted hover:text-black dark:hover:text-white transition-colors">
                   See Velocity <ArrowRight size={12} />
                </button>
             </div>

             <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-8">
                {products.filter(p => p.trending).slice(0, 6).map((product) => (
                   <ProductCard key={product.id} product={product} />
                ))}
             </div>
          </div>

          {/* Professional Sidebar Area */}
          <div className="lg:w-[25%] flex flex-col">
             <div className="sticky top-[4.5rem] h-full flex flex-col">
                <SidebarCart />
                <SidebarDeals />
                
                {/* Visual Trust Snippet */}
                <div className="flex-1 flex flex-col justify-center items-center p-10 bg-surface-alt dark:bg-zinc-950 border-l border-subtle">
                   <div className="w-12 h-12 rounded-full bg-emerald-500/5 flex items-center justify-center text-emerald-600 mb-6">
                      <ShieldCheck size={24} strokeWidth={1} />
                   </div>
                   <h5 className="text-[11px] font-black uppercase tracking-[0.3em] mb-3">Authentic Gear</h5>
                   <p className="text-[10px] text-muted text-center max-w-[180px] leading-relaxed uppercase tracking-tighter">
                      Global Bestsellers. Verified Suppliers. 30-Day Pure Returns.
                   </p>
                </div>
             </div>
          </div>

        </div>

        {/* --- SECTION 2: THE ART OF ESSENTIAL LIVING (EDITORIAL) --- */}
        <section className="relative h-[85vh] overflow-hidden bg-black flex items-center px-6 lg:px-12 border-y border-subtle">
           <img 
             src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=2400" 
             className="absolute inset-0 w-full h-full object-cover opacity-60 grayscale-[0.3]" 
             alt="" 
           />
           <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent" />
           
           <div className="relative z-10 max-w-3xl">
              <p className="text-[10px] font-black uppercase tracking-[0.5em] text-white/50 mb-8">Curated Essentials</p>
              <h2 className="text-6xl sm:text-8xl lg:text-[9rem] font-serif text-white mb-12 leading-[0.8] tracking-tighter">
                 {t('essentials')}
              </h2>
              <p className="text-lg text-white/60 max-w-xl mb-12 uppercase tracking-[0.2em] font-medium leading-relaxed">
                 High-performance objects designed to elevate your daily ritual. Curated for the modern minimalist.
              </p>
              <button 
                onClick={() => setSelectedCategory('Essentials')}
                className="px-12 py-5 bg-white text-black font-black uppercase tracking-[0.3em] text-[10px] hover:bg-blue-600 hover:text-white transition-all transform hover:scale-105"
              >
                 {t('explore')}
              </button>
           </div>
        </section>

        {/* --- SECTION 3: VISUAL CATEGORIES --- */}
        <section className="bg-surface-alt dark:bg-zinc-950 py-32 px-6 lg:px-12">
           <div className="flex flex-col items-center text-center mb-20">
              <h2 className="text-4xl sm:text-5xl font-serif italic tracking-tighter mb-4">Curated Verticals</h2>
              <div className="h-0.5 w-12 bg-black dark:bg-white" />
           </div>
           
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-subtle border border-subtle">
              {categories.map(cat => (
                <div 
                  key={cat.name}
                  onClick={() => setSelectedCategory(cat.name)}
                  className="group relative h-[500px] overflow-hidden cursor-pointer bg-white dark:bg-black"
                >
                   <img src={cat.image} className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110 group-hover:rotate-1" alt="" />
                   <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-700" />
                   
                   <div className="absolute inset-0 p-10 flex flex-col justify-end text-white">
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-3 opacity-60">{cat.count} Artifacts</p>
                      <h3 className="font-serif italic text-4xl mb-6">{cat.name}</h3>
                      <div className="flex items-center gap-3 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                         <span className="text-[10px] font-black uppercase tracking-[0.2em]">Enter Space</span>
                         <ArrowUpRight size={14} />
                      </div>
                   </div>
                </div>
              ))}
           </div>
        </section>

        {/* --- SECTION 4: COMPLETE CATALOG --- */}
        <section className="px-6 lg:px-12 py-32">
           <div className="flex flex-col md:flex-row items-end justify-between gap-10 mb-20">
              <div>
                 <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted mb-4">Complete Inventory</p>
                 <h2 className="text-5xl lg:text-7xl font-serif tracking-tighter italic">All Objects.</h2>
              </div>
              
              <div className="flex border border-subtle">
                 {['All', 'Drops', 'Featured'].map(f => (
                   <button 
                     key={f} 
                     className={`px-10 py-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all ${
                       f === 'All' ? 'bg-black dark:bg-white text-white dark:text-black' : 'hover:bg-surface-alt'
                     }`}
                   >
                      {f}
                   </button>
                 ))}
              </div>
           </div>

           <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-20">
              {filteredProducts.map((product) => (
                 <ProductCard key={product.id} product={product} />
              ))}
           </div>
        </section>

        {/* --- SECTION 5: EDITORIAL STORY 1 --- */}
        <section className="bg-black text-white py-40 px-6 lg:px-12 relative overflow-hidden">
           <div className="absolute inset-0 opacity-40">
              <img src="https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=2400" className="w-full h-full object-cover" alt="" />
           </div>
           <div className="relative z-10 max-w-4xl">
              <p className="text-meta text-blue-500 mb-10">Editorial / 01</p>
              <h2 className="text-6xl sm:text-8xl lg:text-[10rem] text-editorial leading-[0.8] mb-12 tracking-tighter">
                 The Digital <br /> Sanctuary.
              </h2>
              <p className="text-xl text-white/70 max-w-xl mb-12 leading-relaxed font-light">
                 Our 2026 collection focuses on the intersection of biological comfort and high-fidelity output. Objects designed not just to be used, but to be felt.
              </p>
              <button 
                onClick={() => setSelectedCategory('Technology')}
                className="group flex items-center gap-6 text-meta hover:text-blue-500 transition-colors"
              >
                 Explore the Vision <ArrowUpRight size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </button>
           </div>
        </section>

        {/* --- SECTION 6: BEST SELLERS GRID --- */}
        <div className="px-6 lg:px-12 py-32">
           <div className="flex items-end justify-between mb-20 border-b border-subtle pb-10">
              <div className="space-y-4">
                 <p className="text-meta text-red-600">Performance Leaders</p>
                 <h2 className="text-5xl lg:text-7xl font-serif tracking-tighter italic">Global Icons.</h2>
              </div>
           </div>

           <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-20">
              {products.filter(p => p.sold > 40000).slice(0, 4).map((product) => (
                 <ProductCard key={product.id} product={product} />
              ))}
           </div>
        </div>

        {/* --- SECTION 7: EDITORIAL STORY 2 (SPLIT) --- */}
        <section className="editorial-grid bg-surface-alt dark:bg-zinc-950 border-y border-subtle">
           <div className="p-12 lg:p-24 flex flex-col justify-center space-y-12">
              <p className="text-meta text-emerald-500 font-black">Sustainability Report</p>
              <h3 className="text-5xl lg:text-7xl text-editorial text-foreground">Carbon <br /> Neutral <br /> Logistics.</h3>
              <p className="text-lg text-muted leading-relaxed max-w-md italic">
                 "By Feb 2026, 92% of our delivery routes are powered by the autonomous Nexus Hub network, reducing last-mile emissions by 40%."
              </p>
              <div className="pt-6">
                 <button onClick={() => setCurrentView('legal-privacy')} className="btn-brand-outline text-meta">Read Commitments</button>
              </div>
           </div>
           <div className="h-[600px] lg:h-auto overflow-hidden">
              <img src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=2400" className="w-full h-full object-cover grayscale-[0.5] hover:grayscale-0 transition-all duration-[3s]" alt="" />
           </div>
        </section>

        {/* --- SECTION 8: RECENTLY VIEWED --- */}
        <div className="px-6 lg:px-12 pb-40">
           <div className="border-t border-subtle pt-32">
              <RecentlyViewed 
                onProductClick={(id) => {
                  const p = products.find(x => x.id === id);
                  if (p) {
                    setSelectedProduct(p);
                    setCurrentView('product-detail');
                  }
                }} 
              />
           </div>
        </div>

      </div>
    </div>
  );
};
