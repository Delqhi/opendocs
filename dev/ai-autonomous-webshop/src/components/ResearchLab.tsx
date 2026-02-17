import { useState, useEffect } from 'react';
import { Search, Zap, Target, Globe, ArrowRight, BarChart3, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useShopStore } from '../store/shopStore';

const ResearchLab = () => {
  const { addProduct } = useShopStore();
  const [scanProgress, setScanProgress] = useState(0);
  const [currentSource, setCurrentSource] = useState('TikTok Trends');
  const [launching, setLaunching] = useState(false);

  const sources = ['TikTok Trends', 'Instagram Reels', 'Amazon Best Sellers', 'Google Search Trends', 'Reddit Discussions', 'Competitor Stores'];

  useEffect(() => {
    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          setCurrentSource(sources[Math.floor(Math.random() * sources.length)]);
          return 0;
        }
        return prev + 5;
      });
    }, 200);
    return () => clearInterval(interval);
  }, []);

  const handleAutoLaunch = () => {
    setLaunching(true);
    setTimeout(() => {
      addProduct({
        id: `trend-${Date.now()}`,
        name: 'Neural Interface V3 (AI Sourced)',
        price: 299.99,
        originalPrice: 499.99,
        category: 'Wearables',
        image: 'https://images.unsplash.com/photo-1599643478518-17488fbbcd75?w=800&q=80',
        description: 'Automatically sourced based on rising trend signals. High margin potential.',
        rating: 0,
        reviews: 0,
        stock: 50,
        aiScore: 98,
        trending: true,
        tags: ['AI Sourced', 'High Margin'],
        supplier: 'TechDirect CN',
        margin: 65,
        aiOptimized: true,
        demandScore: 99,
        sold: 0,
        status: 'active',
        sourceType: 'dropship',
        supplierId: 'sup-01'
      });
      setLaunching(false);
      alert('Product "Neural Interface V3" added to catalog!');
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white">KI-Research Lab</h2>
          <p className="text-gray-400">Autonome Trend-Analyse & Produkt-Sourcing</p>
        </div>
        <div className="flex items-center gap-3 bg-blue-500/10 border border-blue-500/30 px-4 py-2 rounded-full">
          <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
          <span className="text-sm font-medium text-blue-400">Echtzeit-Scanning Aktiv</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-6">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-indigo-500/20 rounded-2xl">
                  <Search className="w-6 h-6 text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Live-Datenquelle</h3>
                  <p className="text-sm text-gray-400">{currentSource}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-white">{scanProgress}%</span>
                <div className="w-32 h-1.5 bg-slate-800 rounded-full mt-2 overflow-hidden">
                  <motion.div 
                    className="h-full bg-indigo-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${scanProgress}%` }}
                    transition={{ ease: "linear" }}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {[
                { name: 'Self-Cleaning Water Bottle', confidence: 94, volume: 'High', source: 'TikTok' },
                { name: 'Magnetic Wireless Powerbank', confidence: 88, volume: 'Medium', source: 'Instagram' },
                { name: 'Sleep Tracking Smart Mask', confidence: 91, volume: 'Emerging', source: 'Reddit' }
              ].map((item, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="group flex items-center justify-between p-4 bg-slate-800/40 rounded-2xl hover:bg-slate-800/60 transition-colors border border-transparent hover:border-slate-700"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-700 rounded-xl flex items-center justify-center text-white font-bold">
                      #{i + 1}
                    </div>
                    <div>
                      <h4 className="font-medium text-white">{item.name}</h4>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-indigo-400 font-medium px-2 py-0.5 bg-indigo-500/10 rounded-full">{item.source}</span>
                        <span className="text-xs text-gray-400">Volume: {item.volume}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="text-sm font-semibold text-emerald-400">{item.confidence}% Match</div>
                      <div className="text-[10px] text-gray-500 uppercase tracking-wider">AI Profit Confidence</div>
                    </div>
                    <button className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
                      <ArrowRight className="w-5 h-5 text-gray-400" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Globe className="w-5 h-5 text-purple-400" />
                <h4 className="font-semibold text-white">Globale Sättigung</h4>
              </div>
              <div className="flex items-end gap-2 mb-2">
                <span className="text-3xl font-bold text-white">24%</span>
                <span className="text-emerald-400 text-sm mb-1">Low Saturation</span>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">
                Der Markt für Bio-Hacking Wearables ist aktuell in der Early-Adopter Phase. Hohes Potential für SEO-Dominanz.
              </p>
            </div>
            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Target className="w-5 h-5 text-rose-400" />
                <h4 className="font-semibold text-white">Zielgruppen-Fokus</h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {['Gen Z', 'Tech-Enthusiasts', 'Eco-Conscious'].map(tag => (
                  <span key={tag} className="text-[10px] px-2 py-1 bg-slate-800 rounded-lg text-gray-300 border border-slate-700">
                    {tag}
                  </span>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-3 leading-relaxed">
                KI optimiert Ad-Creatives für diese Segmente. CPC Erwartung: 0.45€.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-6 shadow-xl shadow-indigo-500/20">
            <h3 className="text-xl font-bold text-white mb-2">KI Sourcing Action</h3>
            <p className="text-indigo-100 text-sm mb-6">
              Die KI hat ein neues Potential-Produkt identifiziert und verhandelt bereits mit Lieferanten.
            </p>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 mb-6">
              <div className="flex justify-between text-xs text-white/80 mb-1">
                <span>Supplier Negotiation</span>
                <span>82%</span>
              </div>
              <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
                <div className="w-[82%] h-full bg-white rounded-full" />
              </div>
            </div>
            <button 
              onClick={handleAutoLaunch}
              disabled={launching}
              className="w-full py-3 bg-white text-indigo-600 font-bold rounded-xl hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {launching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
              {launching ? 'Sourcing...' : 'Auto-Launch bestätigen'}
            </button>
          </div>

          <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-6">
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-400" />
              Trend-Heatmap
            </h3>
            <div className="space-y-3">
              {[
                { label: 'Smart Home', val: 78 },
                { label: 'Sustainable Tech', val: 65 },
                { label: 'AI Gadgets', val: 92 },
                { label: 'Minimalist Audio', val: 44 }
              ].map(stat => (
                <div key={stat.label}>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-gray-400">{stat.label}</span>
                    <span className="text-white font-medium">{stat.val}%</span>
                  </div>
                  <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-slate-600 rounded-full" style={{ width: `${stat.val}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResearchLab;
