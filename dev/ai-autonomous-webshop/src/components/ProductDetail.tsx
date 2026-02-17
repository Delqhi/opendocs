import React, { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import {
  ArrowLeft,
  Star,
  Heart,
  ShoppingBag,
  Truck,
  RotateCcw,
  Check,
  Minus,
  Plus,
  ShieldCheck,
  CreditCard,
  Copy,
  Brain,
  ChevronRight,
  ChevronLeft,
  Smartphone,
  ZoomIn,
  X,
  Sparkles,
  Zap,
  BarChart3,
  Users,
  Award,
} from 'lucide-react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { type Product, useShopStore } from '../store/shopStore';
import { updateMetadata } from '../utils/seo';
import { useFormatPrice } from './CurrencySelector';
import { LazyImage } from './LazyImage';
import { OptimizedImage } from './OptimizedImage';

interface Props {
  product: Product;
  onBack: () => void;
  onSelectRelated?: (product: Product) => void;
}

export function ProductDetail({ product, onBack, onSelectRelated }: Props) {
  const { addToCart, products, addToRecentlyViewed, wishlist, toggleWishlist, pushToast } = useShopStore();
  const formatPrice = useFormatPrice();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [showMobileCart, setShowMobileCart] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'specs' | 'ai'>('overview');
  const [specExpanded, setSpecExpanded] = useState<string | null>(null);
  const [isAddPending, startAddTransition] = useTransition();
  const [optimisticAdded, setOptimisticAdded] = useOptimistic(false, (_current: boolean, next: boolean) => next);
  
  const imageRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  
  const isWishlisted = wishlist.includes(product.id);

  const mediaItems = useMemo(() => {
    const images = [product.image, ...(product.images ?? [])].filter(Boolean);
    const unique = Array.from(new Set(images));
    return unique.map(src => ({ type: 'image' as const, src }));
  }, [product.image, product.images]);

  const discount = Math.round((1 - product.price / product.originalPrice) * 100);
  const related = products.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4);

  // Dynamic specs based on product category
  const specs = useMemo(() => {
    const baseSpecs = [
      { category: 'Performance', items: [
        { label: 'Response Time', value: '< 50ms' },
        { label: 'Efficiency Rating', value: 'A+' },
        { label: 'Power Consumption', value: '12W Max' },
      ]},
      { category: 'Dimensions', items: [
        { label: 'Weight', value: '245g' },
        { label: 'Dimensions', value: '14.5 × 8.2 × 2.1 cm' },
      ]},
    ];
    
    if (product.category === 'Electronics') {
      baseSpecs.push(
        { category: 'Technical', items: [
          { label: 'Battery Life', value: '18 Hours' },
          { label: 'Connectivity', value: 'Bluetooth 5.3, WiFi 6E' },
          { label: 'Warranty', value: '2 Years' },
        ]}
      );
    }
    return baseSpecs;
  }, [product.category]);

  // AI Summary generation
  const aiSummary = useMemo(() => {
    return {
      headline: `Premium ${product.category} with Exceptional Value`,
      highlights: [
        `Top ${Math.floor(Math.random() * 20) + 80}% customer satisfaction in category`,
        `Verified authentic - ${product.reviews.toLocaleString()}+ verified reviews`,
        `AI-detected best-in-class price performance`,
      ],
      insights: `This ${product.name} combines cutting-edge features with reliable performance. Our neural analysis indicates strong demand velocity and excellent value retention.`,
    };
  }, [product.name, product.category, product.reviews]);

  useEffect(() => {
    addToRecentlyViewed(product.id);
    window.scrollTo(0, 0);
    updateMetadata({ 
      title: product.name, 
      description: product.description, 
      image: product.image 
    });
  }, [addToRecentlyViewed, product.id, product.name, product.description, product.image]);

  // Scroll listener for sticky cart bar
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const threshold = 400;
      setShowMobileCart(scrollY > threshold);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleAdd = () => {
    setOptimisticAdded(true);
    startAddTransition(async () => {
      for (let i = 0; i < qty; i++) addToCart(product);
    });
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      pushToast({ type: 'success', message: 'Link copied to clipboard' });
    } catch {
      pushToast({ type: 'error', message: 'Failed to copy link' });
    }
  };

  // Image zoom handler
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current) return;
    const rect = imageRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    mouseX.set(x);
    mouseY.set(y);
  }, [mouseX, mouseY]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Glassmorphic Navigation */}
      <motion.div 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/10"
      >
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-12">
          <div className="h-16 flex items-center justify-between">
            <button 
              onClick={onBack} 
              className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-all group"
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
              <span className="hidden sm:inline">Back</span>
            </button>
            
            {/* Fluid Typography Brand */}
            <h1 className="text-lg sm:text-xl font-bold tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              NEXUS
            </h1>
            
            <button 
              onClick={() => toggleWishlist(product.id)}
              className={`flex items-center gap-2 text-sm transition-all ${isWishlisted ? 'text-red-500' : 'text-gray-400 hover:text-white'}`}
            >
              <Heart size={18} className={isWishlisted ? 'fill-current' : ''} /> 
            </button>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="pt-16">
        <div className="lg:grid lg:grid-cols-2 min-h-[calc(100vh-4rem)]">
          
          {/* LEFT: Image Gallery with Glassmorphism */}
          <div className="relative bg-gradient-to-br from-gray-900 to-black lg:sticky lg:top-16 lg:h-[calc(100vh-4rem)] overflow-hidden">
            {/* Glass overlay effects */}
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/5 via-transparent to-purple-500/5 pointer-events-none" />
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
            
            {/* Main Image with Zoom */}
            <div 
              ref={imageRef}
              className="relative h-[50vh] sm:h-[60vh] lg:h-full cursor-zoom-in overflow-hidden"
              onMouseMove={handleMouseMove}
              onClick={() => setIsZoomed(true)}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeMediaIndex}
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  className="h-full w-full"
                >
                  <img 
                    src={mediaItems[activeMediaIndex].src} 
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </motion.div>
              </AnimatePresence>

              {/* Glass Badge */}
              <div className="absolute top-4 left-4 z-10">
                <div className="glass px-4 py-2 rounded-full">
                  <span className="text-xs font-semibold tracking-wide">#{product.id}</span>
                </div>
              </div>

              {/* Discount Badge */}
              {discount > 0 && (
                <div className="absolute top-4 right-4 z-10">
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="bg-red-500/90 backdrop-blur-md px-4 py-2 rounded-full shadow-lg"
                  >
                    <span className="text-sm font-bold">-{discount}%</span>
                  </motion.div>
                </div>
              )}

              {/* Zoom Hint */}
              <div className="absolute bottom-4 right-4 z-10 glass px-3 py-2 rounded-full flex items-center gap-2">
                <ZoomIn size={14} />
                <span className="text-xs">Click to zoom</span>
              </div>
            </div>

            {/* Thumbnail Strip - Glassmorphic */}
            <div className="absolute bottom-4 left-4 right-4 flex gap-2 overflow-x-auto pb-2">
              {mediaItems.map((m, i) => (
                <button 
                  key={i}
                  onClick={() => setActiveMediaIndex(i)}
                  className={`shrink-0 w-16 h-20 rounded-lg overflow-hidden transition-all duration-300 ${
                    i === activeMediaIndex 
                      ? 'ring-2 ring-white scale-105 shadow-lg shadow-white/20' 
                      : 'opacity-50 hover:opacity-80 hover:scale-102'
                  }`}
                >
                  <img src={m.src} className="w-full h-full object-cover" alt="" />
                </button>
              ))}
            </div>

            {/* Navigation Arrows */}
            {mediaItems.length > 1 && (
              <>
                <button 
                  onClick={() => setActiveMediaIndex(p => (p - 1 + mediaItems.length) % mediaItems.length)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 glass p-3 rounded-full hover:bg-white/20 transition-all"
                >
                  <ChevronLeft size={20} />
                </button>
                <button 
                  onClick={() => setActiveMediaIndex(p => (p + 1) % mediaItems.length)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 glass p-3 rounded-full hover:bg-white/20 transition-all"
                >
                  <ChevronRight size={20} />
                </button>
              </>
            )}
          </div>

          {/* RIGHT: Product Info with Glassmorphism */}
          <div className="relative bg-[#0a0a0a]">
            {/* Glass accent */}
            <div className="absolute inset-0 bg-gradient-to-bl from-white/5 via-transparent to-transparent pointer-events-none" />
            
            <div className="relative p-4 sm:p-6 lg:p-8 xl:p-12 space-y-6 sm:space-y-8">
              
              {/* Tab Navigation - Glassmorphic */}
              <div className="glass rounded-2xl p-1 flex overflow-x-auto">
                {(['overview', 'specs', 'ai'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      activeTab === tab 
                        ? 'bg-white/10 text-white shadow-lg' 
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {tab === 'overview' && 'Overview'}
                    {tab === 'specs' && 'Specifications'}
                    {tab === 'ai' && 'AI Analysis'}
                  </button>
                ))}
              </div>

              {/* Content Sections */}
              <AnimatePresence mode="wait">
                
                {/* OVERVIEW TAB */}
                {activeTab === 'overview' && (
                  <motion.div
                    key="overview"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-6"
                  >
                    {/* Category & Rating */}
                    <div className="flex flex-wrap items-center gap-3 text-sm">
                      <span className="text-blue-400 font-medium">{product.category}</span>
                      <span className="w-1 h-1 bg-gray-600 rounded-full" />
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={12} strokeWidth={0} className={i < Math.floor(product.rating) ? 'fill-yellow-400' : 'fill-gray-600'} />
                        ))}
                        <span className="ml-1 text-gray-400">{product.rating}</span>
                      </div>
                      <span className="text-gray-500">({product.reviews.toLocaleString()} reviews)</span>
                    </div>

                    {/* Title */}
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
                      {product.name}
                    </h2>

                    {/* Price */}
                    <div className="flex flex-wrap items-baseline gap-3">
                      <span className="text-3xl sm:text-4xl font-bold text-white">
                        {formatPrice(product.price)}
                      </span>
                      {discount > 0 && (
                        <>
                          <span className="text-lg text-gray-500 line-through">
                            {formatPrice(product.originalPrice)}
                          </span>
                          <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded-full text-sm font-medium">
                            Save {discount}%
                          </span>
                        </>
                      )}
                    </div>

                    {/* Description */}
                    <p className="text-gray-400 leading-relaxed">
                      {product.description}
                    </p>

                    {/* Quick Specs Pills */}
                    <div className="flex flex-wrap gap-2">
                      {specs.slice(0, 2).flatMap(s => s.items.slice(0, 2)).map((item, i) => (
                        <div key={i} className="glass px-3 py-2 rounded-full text-xs">
                          <span className="text-gray-500">{item.label}:</span>{' '}
                          <span className="text-white font-medium">{item.value}</span>
                        </div>
                      ))}
                    </div>

                    {/* AI Summary Card */}
                    <div className="glass rounded-2xl p-5 space-y-4 border border-blue-500/20">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-blue-500/20 rounded-lg">
                          <Sparkles size={16} className="text-blue-400" />
                        </div>
                        <span className="font-semibold">AI Summary</span>
                      </div>
                      <p className="text-sm text-gray-300 leading-relaxed">
                        {aiSummary.headline}
                      </p>
                      <ul className="space-y-2">
                        {aiSummary.highlights.map((h, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-gray-400">
                            <Check size={14} className="text-green-400 mt-0.5 shrink-0" />
                            {h}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
                )}

                {/* SPECS TAB */}
                {activeTab === 'specs' && (
                  <motion.div
                    key="specs"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-4"
                  >
                    {specs.map((specCategory, idx) => (
                      <div key={idx} className="glass rounded-2xl overflow-hidden">
                        <button
                          onClick={() => setSpecExpanded(specExpanded === specCategory.category ? null : specCategory.category)}
                          className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
                        >
                          <span className="font-semibold">{specCategory.category}</span>
                          <ChevronRight 
                            size={18} 
                            className={`transition-transform ${specExpanded === specCategory.category ? 'rotate-90' : ''}`}
                          />
                        </button>
                        <AnimatePresence>
                          {specExpanded === specCategory.category && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="p-4 pt-0 space-y-3">
                                {specCategory.items.map((item, i) => (
                                  <div key={i} className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
                                    <span className="text-gray-500 text-sm">{item.label}</span>
                                    <span className="text-white font-medium">{item.value}</span>
                                  </div>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                  </motion.div>
                )}

                {/* AI TAB */}
                {activeTab === 'ai' && (
                  <motion.div
                    key="ai"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-6"
                  >
                    {/* AI Score Card */}
                    <div className="glass rounded-2xl p-6 space-y-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl">
                            <Brain size={24} className="text-white" />
                          </div>
                          <div>
                            <h3 className="font-bold text-lg">AI Analysis</h3>
                            <p className="text-sm text-gray-400">Neural network evaluation</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                            {product.aiInsights?.fitScore ?? 94}%
                          </div>
                          <p className="text-xs text-gray-500">Match Score</p>
                        </div>
                      </div>

                      {/* AI Metrics */}
                      <div className="grid grid-cols-2 gap-4">
                        {[
                          { label: 'Value Integrity', value: product.aiInsights?.valueIntegrity ?? 88, icon: BarChart3 },
                          { label: 'Demand Velocity', value: product.aiInsights?.demandVelocity ?? 75, icon: Zap },
                          { label: 'User Satisfaction', value: 92, icon: Users },
                          { label: 'Price Fairness', value: 96, icon: Award },
                        ].map((metric, i) => (
                          <div key={i} className="glass rounded-xl p-4 space-y-2">
                            <div className="flex items-center justify-between">
                              <metric.icon size={16} className="text-blue-400" />
                              <span className="text-xs text-gray-500">{metric.label}</span>
                            </div>
                            <div className="text-2xl font-bold">{metric.value}%</div>
                            <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${metric.value}%` }}
                                transition={{ delay: 0.3 + i * 0.1, duration: 0.8 }}
                                className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                              />
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* AI Insight */}
                      <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                        <p className="text-sm text-gray-300 leading-relaxed">
                          <span className="text-blue-400 font-medium">Insight: </span>
                          {aiSummary.insights}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Add to Cart Section */}
              <div className="space-y-4 pt-4">
                {/* Quantity Selector */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center glass rounded-full">
                    <button 
                      onClick={() => setQty(Math.max(1, qty - 1))}
                      className="p-3 hover:bg-white/10 rounded-l-full transition-colors"
                    >
                      <Minus size={18} />
                    </button>
                    <span className="w-12 text-center font-semibold">{qty}</span>
                    <button 
                      onClick={() => setQty(qty + 1)}
                      className="p-3 hover:bg-white/10 rounded-r-full transition-colors"
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                  <span className="text-sm text-gray-500">In stock - Fast delivery</span>
                </div>

                {/* Main CTA Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAdd}
                  disabled={isAddPending}
                  className={`w-full py-4 sm:py-5 rounded-2xl font-bold text-lg transition-all shadow-xl ${
                    optimisticAdded 
                      ? 'bg-green-500 text-white' 
                      : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600'
                  }`}
                >
                  {optimisticAdded ? (
                    <span className="flex items-center justify-center gap-2">
                      <Check size={20} /> Added to Cart
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <ShoppingBag size={20} /> 
                      Add to Cart - {formatPrice(product.price * qty)}
                    </span>
                  )}
                </motion.button>

                {/* Secondary Actions */}
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={handleCopyLink}
                    className="glass py-3 rounded-xl text-sm font-medium hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
                  >
                    <Copy size={16} /> Share
                  </button>
                  <button className="glass py-3 rounded-xl text-sm font-medium hover:bg-white/10 transition-colors flex items-center justify-center gap-2">
                    <CreditCard size={16} /> Buy Now
                  </button>
                </div>
              </div>

              {/* Trust Badges - Glassmorphic */}
              <div className="glass rounded-2xl p-4 sm:p-6">
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { icon: <Truck size={20} />, title: 'Free Shipping', desc: '2-4 days' },
                    { icon: <RotateCcw size={20} />, title: '30-Day Returns', desc: 'No questions' },
                    { icon: <ShieldCheck size={20} />, title: '2-Year Warranty', desc: 'Full coverage' },
                  ].map((item, i) => (
                    <div key={i} className="text-center">
                      <div className="mx-auto mb-2 text-blue-400">{item.icon}</div>
                      <p className="text-sm font-semibold">{item.title}</p>
                      <p className="text-xs text-gray-500">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* AR View Button */}
              <button 
                onClick={() => pushToast({ type: 'info', message: 'AR View coming soon!' })}
                className="w-full glass py-4 rounded-2xl flex items-center justify-center gap-3 hover:bg-white/10 transition-colors"
              >
                <Smartphone size={20} className="text-purple-400" />
                <span className="font-medium">View in AR</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products Section */}
      {related.length > 0 && (
        <div className="p-4 sm:p-6 lg:p-12 border-t border-white/10">
          <h3 className="text-2xl font-bold mb-6">You may also like</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {related.map((p) => (
              <div 
                key={p.id}
                onClick={() => onSelectRelated?.(p)}
                className="group cursor-pointer"
              >
                <div className="aspect-square rounded-2xl overflow-hidden mb-3">
                  <img 
                    src={p.image} 
                    alt={p.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                  />
                </div>
                <p className="font-medium text-sm truncate">{p.name}</p>
                <p className="text-gray-400 text-sm">{formatPrice(p.price)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sticky Mobile Add to Cart Bar */}
      <AnimatePresence>
        {showMobileCart && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-white/10 p-4 safe-bottom lg:hidden"
          >
            <div className="flex items-center gap-4">
              <div className="shrink-0">
                <img src={product.image} alt={product.name} className="w-14 h-14 rounded-lg object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{product.name}</p>
                <p className="text-blue-400 font-bold">{formatPrice(product.price)}</p>
              </div>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleAdd}
                disabled={isAddPending}
                className={`px-6 py-3 rounded-xl font-bold transition-all ${
                  optimisticAdded ? 'bg-green-500' : 'bg-gradient-to-r from-blue-500 to-purple-500'
                }`}
              >
                {optimisticAdded ? <Check size={20} /> : 'Add'}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Zoom Modal */}
      <AnimatePresence>
        {isZoomed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4"
            onClick={() => setIsZoomed(false)}
          >
            <button 
              onClick={() => setIsZoomed(false)}
              className="absolute top-4 right-4 p-2 glass rounded-full hover:bg-white/20"
            >
              <X size={24} />
            </button>
            <img 
              src={mediaItems[activeMediaIndex].src} 
              alt={product.name}
              className="max-w-full max-h-full object-contain rounded-lg"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
      {/* Editorial Header Navigation */}
      <div className="sticky top-20 z-40 bg-surface/80 backdrop-blur-md border-b border-subtle h-14 flex items-center px-6 lg:px-12">
        <div className="max-w-[1800px] mx-auto w-full flex items-center justify-between">
          <button onClick={onBack} className="flex items-center gap-2 text-meta text-muted hover:text-foreground transition-colors group">
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> 
            Back to Archive
          </button>
          <div className="hidden sm:flex items-center gap-8 text-meta">
            <span className="text-foreground">Overview</span>
            <span className="text-muted cursor-pointer hover:text-foreground">Specifications</span>
            <span className="text-muted cursor-pointer hover:text-foreground">Process</span>
          </div>
          <button 
            onClick={() => toggleWishlist(product.id)}
            className={`flex items-center gap-2 text-meta transition-colors ${isWishlisted ? 'text-red-600' : 'text-muted hover:text-foreground'}`}
          >
            <Heart size={14} className={isWishlisted ? 'fill-current' : ''} /> 
            {isWishlisted ? 'Saved' : 'Save'}
          </button>
        </div>
      </div>

      <div className="editorial-grid max-w-[1920px] mx-auto">
        
        {/* LEFT: MAJESTIC STICKY MEDIA */}
        <div className="lg:h-[calc(100vh-8.5rem)] lg:sticky lg:top-[8.5rem] bg-surface-alt overflow-hidden border-r border-subtle">
           <div className="h-full relative group">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeMediaIndex}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8 }}
                  className="h-full w-full"
                >
                  <OptimizedImage 
                    src={mediaItems[activeMediaIndex].src} 
                    alt={product.name} 
                    className="h-full w-full" 
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 1200px"
                    aspectRatio="h-full w-full"
                  />
                </motion.div>
              </AnimatePresence>

              {/* Navigation Overlays */}
              <div className="absolute inset-y-0 left-0 w-24 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => setActiveMediaIndex(p => (p - 1 + mediaItems.length) % mediaItems.length)}
                  className="p-4 bg-black/10 backdrop-blur text-white hover:bg-black/20"
                >
                  <ChevronLeft size={24} />
                </button>
              </div>
              <div className="absolute inset-y-0 right-0 w-24 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => setActiveMediaIndex(p => (p + 1) % mediaItems.length)}
                  className="p-4 bg-black/10 backdrop-blur text-white hover:bg-black/20"
                >
                  <ChevronRight size={24} />
                </button>
              </div>

              {/* Status Tags */}
              <div className="absolute top-10 left-10 z-10 flex flex-col gap-3">
                 <div className="bg-black text-white px-4 py-1.5 text-meta">Artifact {product.id}</div>
                 {discount > 0 && <div className="bg-red-600 text-white px-4 py-1.5 text-meta italic">Special Price (-{discount}%)</div>}
              </div>
           </div>

           {/* Thumbnail Strip */}
           <div className="absolute bottom-10 left-10 flex gap-3">
              {mediaItems.map((m, i) => (
                <button 
                  key={i}
                  onClick={() => setActiveMediaIndex(i)}
                  className={`w-12 h-16 border transition-all duration-500 overflow-hidden ${i === activeMediaIndex ? 'border-foreground' : 'border-white/20 opacity-40 hover:opacity-100'}`}
                >
                  <img src={m.src} className="w-full h-full object-cover" alt="" />
                </button>
              ))}
           </div>
        </div>

        {/* RIGHT: EDITORIAL CONTENT SCROLL */}
        <div className="p-8 lg:p-20 lg:pt-32 space-y-20">
          
          {/* Section 1: Identity */}
          <section className="space-y-10">
            <div className="space-y-6">
              <div className="flex items-center gap-4 text-meta text-primary font-black">
                <span>{product.category}</span>
                <span className="w-8 h-px bg-primary" />
                <span className="flex items-center gap-1"><Check size={12} strokeWidth={3} /> Verified in Stock</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <h1 className="text-6xl sm:text-8xl text-editorial text-foreground">
                  {product.name}
                </h1>
                {/* 2026 AR Feature */}
                <button 
                  onClick={() => pushToast({ type: 'info', message: 'Initializing AR Hologram... Point camera at your space.' })}
                  className="shrink-0 flex flex-col items-center gap-2 group"
                >
                  <div className="w-16 h-16 rounded-full border border-subtle flex items-center justify-center group-hover:border-primary transition-colors">
                    <div className="w-12 h-12 rounded-full bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                       <Smartphone size={20} />
                    </div>
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-widest opacity-40 group-hover:opacity-100">Virtual View</span>
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-10">
              <div className="space-y-4">
                <p className="text-3xl font-black tracking-tighter text-foreground">
                  {formatPrice(product.price)}
                </p>
                {discount > 0 && (
                  <p className="text-sm text-muted line-through">
                    Retail {formatPrice(product.originalPrice)}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-3">
                 <div className="flex">
                   {[...Array(5)].map((_, i) => (
                     <Star key={i} size={14} strokeWidth={0} className={i < Math.floor(product.rating) ? 'fill-black dark:fill-white' : 'fill-gray-200 dark:fill-zinc-800'} />
                   ))}
                 </div>
                 <span className="text-meta text-muted">{product.reviews.toLocaleString()} global verified</span>
              </div>
            </div>

            <p className="text-lg leading-relaxed text-muted max-w-xl">
              {product.description}
            </p>

            {/* AI Performance Analysis Block */}
            <div className="p-8 border border-subtle bg-surface-alt rounded-none space-y-8">
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                     <Brain size={20} className="text-primary" />
                     <span className="text-meta font-black">Nexus AI Performance</span>
                  </div>
                  <div className="px-3 py-1 bg-primary text-white text-[10px] font-black uppercase tracking-widest">
                     Match Score: {product.aiInsights?.fitScore ?? 94}%
                  </div>
               </div>
               
               <div className="grid grid-cols-2 gap-10">
                  <div className="space-y-3">
                    <div className="flex justify-between text-meta opacity-50">Value Integrity</div>
                    <div className="h-0.5 w-full bg-border">
                       <motion.div initial={{ width: 0 }} animate={{ width: `${product.aiInsights?.valueIntegrity ?? 88}%` }} className="h-full bg-primary" transition={{ delay: 0.5, duration: 1.5 }} />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between text-meta opacity-50">Demand Velocity</div>
                    <div className="h-0.5 w-full bg-border">
                       <motion.div initial={{ width: 0 }} animate={{ width: `${product.aiInsights?.demandVelocity ?? 75}%` }} className="h-full bg-primary" transition={{ delay: 0.7, duration: 1.5 }} />
                    </div>
                  </div>
               </div>
               
               <p className="text-xs text-muted leading-relaxed italic border-l-2 border-primary pl-6">
                  "Observation: Our neural network identifies this object as a high-liquidity asset with rising demand in the {product.category} sector. Logistic path optimized for 4.2 day average arrival."
               </p>
            </div>
          </section>

          {/* Section 2: Configuration */}
          <section className="space-y-12">
            <div className="h-px w-full bg-subtle" />
            
            <div className="space-y-8">
               <div>
                  <h4 className="text-meta mb-6">Selection Control</h4>
                  <div className="flex flex-wrap gap-4">
                     {['Standard', 'Pro Edition', 'Studio Pack'].map(opt => (
                       <button key={opt} className={`px-8 py-3 border text-xs font-black uppercase tracking-widest transition-all ${opt === 'Standard' ? 'border-foreground bg-foreground text-white' : 'border-subtle text-muted hover:border-strong'}`}>
                          {opt}
                       </button>
                     ))}
                  </div>
               </div>

               <div className="flex flex-col sm:flex-row items-center gap-6">
                  <div className="flex items-center justify-between border border-subtle bg-surface-alt w-full sm:w-40 px-4 py-4">
                     <button onClick={() => setQty(Math.max(1, qty - 1))} className="text-muted hover:text-foreground active:scale-90 transition-transform"><Minus size={16} /></button>
                     <span className="font-black text-xs">{qty}</span>
                     <button onClick={() => setQty(qty + 1)} className="text-muted hover:text-foreground active:scale-90 transition-transform"><Plus size={16} /></button>
                  </div>
                  
                  <button 
                    onClick={handleAdd}
                    disabled={isAddPending}
                    className={`flex-1 w-full py-5 text-meta font-black transition-all ${optimisticAdded ? 'bg-emerald-600 text-white' : 'btn-brand'}`}
                  >
                    {optimisticAdded ? <><Check size={16} strokeWidth={3} /> Added to archive</> : <><ShoppingBag size={16} /> Secure Artifact — {formatPrice(product.price * qty)}</>}
                  </button>
               </div>

               <div className="grid grid-cols-2 gap-4">
                 <button className="py-4 border border-subtle bg-transparent text-meta text-muted hover:text-foreground hover:border-strong transition-all flex items-center justify-center gap-3">
                    <CreditCard size={14} /> Pay Later
                 </button>
                 <button onClick={handleCopyLink} className="py-4 border border-subtle bg-transparent text-meta text-muted hover:text-foreground hover:border-strong transition-all flex items-center justify-center gap-3">
                    <Copy size={14} /> Share Link
                 </button>
               </div>
            </div>
          </section>

          {/* Section 3: Trust Hierarchy */}
          <section className="grid grid-cols-1 sm:grid-cols-3 gap-10">
             {[
               { icon: <Truck size={20} strokeWidth={1} />, title: 'Global Logic', sub: 'Carbon-neutral tracked shipping' },
               { icon: <RotateCcw size={20} strokeWidth={1} />, title: '30-Day Void', sub: 'Seamless no-question returns' },
               { icon: <ShieldCheck size={20} strokeWidth={1} />, title: 'Buyer Shield', sub: '2-Year technical assurance' }
             ].map((t, i) => (
               <div key={i} className="space-y-4">
                  <div className="text-primary">{t.icon}</div>
                  <h5 className="text-meta">{t.title}</h5>
                  <p className="text-[11px] text-muted leading-relaxed uppercase tracking-tighter">{t.sub}</p>
               </div>
             ))}
          </section>

          {/* Section 4: Market Comparison & Dynamic Pricing */}
          <section className="space-y-10">
             <div className="flex items-center justify-between">
                <h3 className="text-3xl font-serif italic tracking-tighter">Market Reality</h3>
                <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-emerald-500">
                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                   Live Global Pulse
                </div>
             </div>
             
             <div className="space-y-4">
                {/* Visual price integrity chart */}
                <div className="border border-subtle p-6 bg-surface-alt rounded-none">
                   <div className="space-y-6">
                      {product.marketComparison?.map((comp, i) => (
                        <div key={i} className="space-y-2">
                           <div className="flex justify-between text-meta opacity-60">
                              <span>{comp.competitor}</span>
                              <span>{formatPrice(comp.price)}</span>
                           </div>
                           <div className="h-1 w-full bg-border relative">
                              <div className="absolute inset-y-0 left-0 bg-muted" style={{ width: '100%' }} />
                              <div className="absolute inset-y-0 left-0 bg-primary opacity-20" style={{ width: `${(product.price / comp.price) * 100}%` }} />
                           </div>
                        </div>
                      ))}
                      <div className="pt-4 flex items-center justify-between">
                         <span className="text-meta font-black">Nexus AI Verified</span>
                         <span className="text-xl font-black text-emerald-500">{formatPrice(product.price)}</span>
                      </div>
                   </div>
                </div>

                <div className="border border-subtle overflow-hidden">
                   {[
                     { label: 'Supplier Integrity', ours: '98%', market: '71%' },
                     { label: 'Lead Time', ours: '5-8 Days', market: '12-18 Days' },
                     { label: 'Sourcing Path', ours: 'Optimized', market: 'Legacy' }
                   ].map((row, i) => (
                     <div key={i} className="grid grid-cols-3 p-4 border-b border-subtle last:border-0 text-meta">
                        <span className="text-muted">{row.label}</span>
                        <span className="text-primary font-black text-center">{row.ours}</span>
                        <span className="text-muted text-right opacity-40">{row.market}</span>
                     </div>
                   ))}
                </div>
             </div>
          </section>

          {/* Section 5: Dynamic AI Bundle */}
          {useShopStore.getState().bundleDeals.find(b => b.products.includes(product.id)) && (
            <section className="space-y-10 p-8 border border-primary bg-primary/5 rounded-none">
              <div className="space-y-2">
                <p className="text-meta text-primary">AI Recommendation</p>
                <h3 className="text-3xl font-serif italic tracking-tighter">Frequently Bought Together</h3>
              </div>
              
              <div className="flex items-center gap-6 overflow-x-auto pb-4 no-scrollbar">
                {useShopStore.getState().bundleDeals.find(b => b.products.includes(product.id))?.products.map((pid, idx) => {
                  const p = products.find(x => x.id === pid);
                  if (!p) return null;
                  return (
                    <React.Fragment key={p.id}>
                      <div className="w-24 shrink-0 space-y-3">
                        <div className="aspect-square bg-surface-alt overflow-hidden border border-subtle">
                          <img src={p.image} className="w-full h-full object-cover grayscale-[0.4]" alt="" />
                        </div>
                        <p className="text-[9px] font-black uppercase truncate leading-none">{p.name}</p>
                      </div>
                      {idx < useShopStore.getState().bundleDeals.find(b => b.products.includes(product.id))!.products.length - 1 && (
                        <Plus size={16} className="text-muted shrink-0" />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>

              <div className="pt-6 border-t border-primary/20 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase text-muted tracking-widest">Bundle Savings</p>
                  <p className="text-2xl font-black text-emerald-500">Save {useShopStore.getState().bundleDeals.find(b => b.products.includes(product.id))?.discountPercent}%</p>
                </div>
                <button 
                  onClick={() => {
                    const bundle = useShopStore.getState().bundleDeals.find(b => b.products.includes(product.id));
                    if (bundle) useShopStore.getState().addBundleToCart(bundle.id);
                  }}
                  className="px-8 py-4 bg-primary text-white text-meta font-black hover:opacity-90 active:scale-95 transition-all shadow-xl"
                >
                  Add Bundle to Bag
                </button>
              </div>
            </section>
          )}

          {/* Section 6: Verified User Content (UGC) */}
          <section className="space-y-10">
             <div className="flex items-end justify-between">
                <h3 className="text-4xl font-serif italic tracking-tighter">Verified Studio Logs.</h3>
                <span className="text-meta text-muted">2.4k Photos uploaded</span>
             </div>

             <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {(product.ugcPhotos ?? [
                  'https://images.unsplash.com/photo-1593344484962-796055d4a3a4?w=400&q=80',
                  'https://images.unsplash.com/photo-1526170315870-efcd0ce74482?w=400&q=80',
                  'https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?w=400&q=80',
                  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80'
                ]).map((src, i) => (
                  <div key={i} className="aspect-square bg-surface-alt overflow-hidden border border-subtle group cursor-zoom-in relative">
                     <img src={src} className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-700 group-hover:scale-110" alt="" />
                     <div className="absolute bottom-2 left-2 bg-black/40 backdrop-blur-md px-2 py-1 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-[8px] font-black text-white uppercase tracking-widest">Verified Log</span>
                     </div>
                  </div>
                ))}
             </div>

             <div className="pt-10 border-t border-subtle">
                <div className="space-y-12">
                   {[
                     { user: 'Klaus M.', rating: 5, text: 'The fidelity of this artifact is unmatched. AI delivery optimization was precise. Arrived in 3 days.', date: 'FEB 04, 2026' },
                     { user: 'Sonia R.', rating: 4, text: 'Essential part of my workspace now. Minimal noise, maximum aesthetic output.', date: 'JAN 28, 2026' }
                   ].map((rev, i) => (
                     <div key={i} className="space-y-4">
                        <div className="flex items-center justify-between">
                           <span className="text-meta font-black">{rev.user}</span>
                           <span className="text-[10px] text-muted tracking-widest">{rev.date}</span>
                        </div>
                        <div className="flex gap-1">
                           {[...Array(rev.rating)].map((_, j) => <Star key={j} size={10} className="fill-foreground" />)}
                        </div>
                        <p className="text-sm leading-relaxed text-muted font-medium italic">"{rev.text}"</p>
                     </div>
                   ))}
                </div>
             </div>
          </section>

          {/* Section 7: Adjacent Artifacts. */}
          <section className="space-y-10 pt-20 border-t border-subtle">
             <h3 className="text-4xl font-serif italic tracking-tighter">Adjacent Artifacts.</h3>
             <div className="grid grid-cols-2 gap-6">
                {related.map(p => (
                  <div 
                    key={p.id}
                    onClick={() => onSelectRelated?.(p)}
                    className="group cursor-pointer space-y-4"
                  >
                     <div className="aspect-[4/5] bg-surface-alt overflow-hidden border border-subtle">
                        <img src={p.image} className="w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-105" alt="" />
                     </div>
                     <div className="text-center">
                        <p className="text-meta font-black truncate leading-none uppercase">{p.name}</p>
                        <p className="text-[11px] text-muted mt-2 tracking-widest font-black uppercase">{formatPrice(p.price)}</p>
                     </div>
                  </div>
                ))}
             </div>
          </section>

          {/* Sticky Quick-Add for Mobile/Small Screens */}
          <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-surface border-t border-subtle p-4 safe-bottom">
             <button onClick={handleAdd} disabled={isAddPending} className="w-full btn-brand py-4 text-meta font-black">
                {optimisticAdded ? 'Added' : `Add Artifact — ${formatPrice(product.price)}`}
             </button>
          </div>

        </div>
      </div>
    </div>
  );
}
