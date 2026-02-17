import { useShopStore, type AdminSupplier } from '../store/shopStore';
import { Zap, Globe, Download, Plus, Star, BarChart3, TrendingUp, ShieldCheck } from 'lucide-react';

const MOCK_SUPPLIERS: Omit<AdminSupplier, 'id'>[] = [
  {
    name: 'Shenzhen Prime Tech',
    type: 'dropship',
    region: 'Asia',
    status: 'active',
    rating: 4.9,
    catalogUrl: 'https://mock.catalog/shenzhen.json',
    catalogFormat: 'json',
    shippingTime: '5-8 days',
    priceIndex: 72,
  },
  {
    name: 'Global Fulfillment EU',
    type: 'warehouse',
    region: 'EU',
    status: 'active',
    rating: 4.7,
    catalogUrl: 'https://mock.catalog/eu-fulfillment.csv',
    catalogFormat: 'csv',
    shippingTime: '2-4 days',
    priceIndex: 98,
  }
];

const MOCK_TRENDS = [
  {
    name: 'Neural Sleep Mask',
    category: 'Wellness',
    demand: 98,
    margin: 62,
    source: 'TikTok Trends',
    price: 49.99,
    image: 'https://images.unsplash.com/photo-1511293532580-0196881944af?w=800&q=80'
  },
  {
    name: 'MagSafe Desktop Hub',
    category: 'Tech',
    demand: 94,
    margin: 65,
    source: 'Amazon Best Sellers',
    price: 79.99,
    image: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=800&q=80'
  }
];

export function AdminSupplierSuggestions() {
  const { addSupplier, addProduct, pushToast } = useShopStore();

  const handleAddSupplier = (sup: Omit<AdminSupplier, 'id'>) => {
    const id = `sup-ai-${Date.now()}`;
    addSupplier({
      ...sup,
      id,
    });
    pushToast({ type: 'success', message: `Added ${sup.name} to your suppliers` });
  };

  const handleLaunchProduct = (trend: typeof MOCK_TRENDS[0]) => {
    const id = `prod-ai-${Date.now()}`;
    addProduct({
      id,
      name: trend.name,
      description: `AI-sourced trend product from ${trend.source}. High demand score of ${trend.demand}.`,
      price: trend.price,
      originalPrice: trend.price * 1.5,
      category: trend.category,
      image: trend.image,
      rating: 0,
      reviews: 0,
      stock: 100,
      aiScore: 98,
      trending: true,
      tags: ['AI Sourced', trend.source],
      supplier: 'AI Scouted',
      margin: trend.margin,
      aiOptimized: true,
      demandScore: trend.demand,
      sold: 0,
      status: 'active',
      sourceType: 'dropship',
    });
    pushToast({ type: 'success', message: `Launched ${trend.name}!` });
  };

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <Zap className="w-7 h-7 text-primary-400" />
            KI-Supplier Suggestions
          </h2>
          <p className="text-sm text-gray-500 mt-1">AI-scouted partners and products with high conversion potential.</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 glass rounded-xl">
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          <span className="text-xs text-emerald-300">Trend scanning active</span>
        </div>
      </div>

      {/* Recommended Suppliers */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
          <Globe className="w-4 h-4" /> Top Scouted Suppliers
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {MOCK_SUPPLIERS.map((sup) => (
            <div key={sup.name} className="glass border border-white/5 rounded-2xl p-5 hover:border-primary-500/30 transition-all group">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-primary-500/10 flex items-center justify-center text-primary-400">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white">{sup.name}</h4>
                    <p className="text-xs text-gray-500">{sup.region} · {sup.type.toUpperCase()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-emerald-400">
                   <Star className="w-3.5 h-3.5 fill-current" />
                   <span className="text-sm font-bold">{sup.rating}</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-5">
                <div className="p-2 rounded-xl bg-white/5 text-center">
                  <p className="text-[10px] text-gray-500 uppercase font-bold tracking-tight">Price Index</p>
                  <p className="text-sm text-white font-mono">{sup.priceIndex}</p>
                </div>
                <div className="p-2 rounded-xl bg-white/5 text-center">
                  <p className="text-[10px] text-gray-500 uppercase font-bold tracking-tight">Reliability</p>
                  <p className="text-sm text-white font-mono">98%</p>
                </div>
                <div className="p-2 rounded-xl bg-white/5 text-center">
                   <p className="text-[10px] text-gray-500 uppercase font-bold tracking-tight">Shipping</p>
                   <p className="text-sm text-white font-mono">{sup.shippingTime}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <button 
                  onClick={() => handleAddSupplier(sup)}
                  className="flex-1 py-2.5 rounded-xl bg-white text-black text-xs font-bold hover:bg-gray-100 transition-all flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Add Partner
                </button>
                <button className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-gray-400 hover:text-white transition-all">
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Trending Opportunities */}
      <div className="space-y-4 pt-4">
         <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
           <BarChart3 className="w-4 h-4" /> Global Trend Opportunities
         </h3>
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {MOCK_TRENDS.map(trend => (
              <div key={trend.name} className="glass border border-white/5 rounded-2xl overflow-hidden flex flex-col sm:flex-row hover:border-accent-500/30 transition-all">
                 <div className="w-full sm:w-40 h-40 shrink-0">
                    <img src={trend.image} alt="" className="w-full h-full object-cover" />
                 </div>
                 <div className="p-5 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-2">
                       <div>
                          <h4 className="text-base font-bold text-white">{trend.name}</h4>
                          <span className="text-[10px] text-primary-400 font-bold uppercase tracking-widest">{trend.category}</span>
                       </div>
                       <div className="px-2 py-1 rounded bg-accent-500/20 text-accent-400 text-[10px] font-bold">
                          {trend.demand}% Demand
                       </div>
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-2 mb-4">Identifyed as high-velocity product on {trend.source}. Estimated profit margin: {trend.margin}%.</p>
                    <div className="mt-auto flex items-center justify-between gap-4">
                       <span className="text-lg font-bold text-white">${trend.price}</span>
                       <button 
                         onClick={() => handleLaunchProduct(trend)}
                         className="px-4 py-2 rounded-xl bg-accent-500 text-white text-xs font-bold hover:bg-accent-600 transition-all flex items-center gap-2"
                       >
                         <Zap className="w-4 h-4 fill-current" /> Auto-Launch
                       </button>
                    </div>
                 </div>
              </div>
            ))}
         </div>
      </div>
    </div>
  );
}
