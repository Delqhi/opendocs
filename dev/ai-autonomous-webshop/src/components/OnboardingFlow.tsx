import { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, X, Target, Smartphone, Heart, ShoppingBag, LayoutGrid, Clock, Check, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useShopStore } from '../store/shopStore';

export function OnboardingFlow() {
  const { darkMode, pushToast } = useShopStore();
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(false);
  const [selectedCats, setSelectedCats] = useState<string[]>([]);
  const [countdown, setCountdown] = useState(10799); // 02:59:59 in seconds

  useEffect(() => {
    const completed = localStorage.getItem('nexus_onboarding_done');
    if (!completed) {
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  // Countdown timer for scarcity
  useEffect(() => {
    if (!visible) return;
    const id = setInterval(() => setCountdown(v => Math.max(0, v - 1)), 1000);
    return () => clearInterval(id);
  }, [visible]);

  const formatTime = (sec: number) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const categories = [
    { name: 'Technology', icon: <Smartphone className="w-6 h-6" /> },
    { name: 'Wellness', icon: <Heart className="w-6 h-6" /> },
    { name: 'Living', icon: <LayoutGrid className="w-6 h-6" /> },
    { name: 'Essentials', icon: <ShoppingBag className="w-6 h-6" /> }
  ];

  const quickWins = [
    { title: 'Market Analysis', status: '85% Optimized', progress: 85 },
    { title: 'Fulfillment Bot', status: 'Active', progress: 100 },
    { title: 'Dynamic Pricing', status: 'Syncing...', progress: 65 }
  ];

  const toggleCat = (name: string) => {
    setSelectedCats(prev => prev.includes(name) ? prev.filter(c => c !== name) : [...prev, name]);
  };

  const finish = () => {
    localStorage.setItem('nexus_onboarding_done', 'true');
    setVisible(false);
    pushToast({ type: 'success', message: 'Welcome to NEXUS! 10% Discount applied.' });
  };

  const next = () => {
    if (step < 3) setStep(step + 1);
    else finish();
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className={`relative w-full max-w-lg rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] border p-8 sm:p-10 ${
          darkMode ? 'bg-gray-950 border-gray-800 text-white' : 'bg-white border-gray-100 text-gray-900'
        }`}
      >
        {/* Progress Bar Top */}
        <div className="absolute top-0 left-0 right-0 h-1.5 flex gap-1 px-10 pt-8">
           {[0, 1, 2, 3].map(i => (
             <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-500 ${i <= step ? 'bg-indigo-500' : 'bg-gray-800/20'}`} />
           ))}
        </div>

        <button 
          onClick={finish}
          className="absolute top-8 right-8 p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-muted transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center text-center mt-4">
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div 
                key="step0"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="w-full"
              >
                <div className="bg-gray-50 dark:bg-white/5 rounded-2xl p-4 mb-6 text-left border border-subtle">
                  <div className="flex items-center gap-3 mb-2">
                    <img src="https://i.pravatar.cc/100?u=sarah" className="w-10 h-10 rounded-full border border-white shadow-sm" />
                    <div>
                      <p className="text-sm font-bold">Sarah M. from New York</p>
                      <p className="text-[10px] text-muted">Just made first sale in 4 minutes! 🎉</p>
                    </div>
                  </div>
                  <div className="flex text-yellow-400 text-sm">
                    <Star className="w-3 h-3 fill-current" />
                    <Star className="w-3 h-3 fill-current" />
                    <Star className="w-3 h-3 fill-current" />
                    <Star className="w-3 h-3 fill-current" />
                    <Star className="w-3 h-3 fill-current" />
                    <span className="ml-1 text-[10px] text-muted italic">"Setup was incredibly fast!"</span>
                  </div>
                </div>

                <h2 className="text-2xl sm:text-3xl font-black tracking-tight mb-4">NEXUS 2026</h2>
                <p className="text-sm sm:text-base text-muted leading-relaxed mb-6">
                  Where AI curates <span className="text-indigo-500 font-bold">Top-Sellers with 3x higher conversion</span>. 
                  Get started and save over <span className="font-bold">2 hours of setup time</span>.
                </p>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className="flex -space-x-2">
                    {[1,2,3].map(i => <div key={i} className="w-6 h-6 rounded-full border-2 border-gray-900 bg-gray-700" />)}
                  </div>
                  <span className="text-xs font-bold text-muted uppercase tracking-widest">Joined by 12,400+ Sellers</span>
                </div>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="w-full"
              >
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-6 mx-auto">
                  <Target className="w-8 h-8 text-emerald-500" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Target Categories</h2>
                <p className="text-sm text-muted mb-8">We'll tailor the AI scouting to your preferred niche.</p>
                
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {categories.map(cat => (
                    <button
                      key={cat.name}
                      onClick={() => toggleCat(cat.name)}
                      className={`flex flex-col items-center gap-4 p-6 rounded-[2rem] border transition-all ${
                        selectedCats.includes(cat.name) 
                          ? 'border-indigo-600 bg-indigo-500/5 text-indigo-600' 
                          : 'border-subtle bg-surface-alt hover:border-strong text-gray-600'
                      }`}
                    >
                      <div className={`p-4 rounded-2xl ${selectedCats.includes(cat.name) ? 'bg-indigo-500 text-white' : 'bg-black/5 dark:bg-white/5 shadow-inner'}`}>
                         {cat.icon}
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest leading-none">{cat.name}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="w-full"
              >
                <div className="w-16 h-16 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-6 mx-auto">
                  <Sparkles className="w-8 h-8 text-purple-500" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Personalized Quick-Wins</h2>
                <p className="text-sm text-muted mb-8">AI is already optimizing your store for {selectedCats.join(' & ') || 'success'}.</p>
                
                <div className="space-y-4 mb-8 text-left">
                  {quickWins.map((win, i) => (
                    <div key={win.title} className="animate-slide-up" style={{ animationDelay: `${i * 150}ms` }}>
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.2em] mb-2">
                        <span className="text-muted">{win.title}</span>
                        <span className="text-emerald-500 flex items-center gap-1">
                           <Check className="w-3 h-3" /> {win.status}
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${win.progress}%` }}
                          className="h-full bg-gradient-to-r from-indigo-600 to-indigo-400 rounded-full"
                          transition={{ duration: 1.5, ease: "easeOut" }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div 
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="w-full"
              >
                <div className="relative aspect-video rounded-3xl bg-slate-900 border border-white/5 overflow-hidden mb-8 group">
                  <img 
                    src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800" 
                    className="w-full h-full object-cover opacity-40"
                    alt="Store Preview"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-indigo-500 text-white text-[10px] font-black px-4 py-2 rounded-full shadow-2xl animate-bounce">
                      STORE READY
                    </div>
                  </div>
                </div>
                
                <h2 className="text-2xl font-bold mb-2">Ready to Launch?</h2>
                <p className="text-sm text-muted mb-8 italic">"NEXUS changed my life. First sale in 4 hours." — Mike D.</p>
                
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-2xl p-4 mb-6 flex items-center justify-center gap-3">
                  <Clock className="w-5 h-5 text-yellow-700 dark:text-yellow-500" />
                  <div className="text-left">
                    <p className="text-[10px] font-black uppercase text-yellow-700 dark:text-yellow-500 tracking-widest">🎁 Limited 10% Discount expires in</p>
                    <p className="text-xl font-mono font-bold text-yellow-700 dark:text-yellow-500">{formatTime(countdown)}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="w-full flex items-center justify-between gap-4 mt-4">
            <button 
              onClick={finish}
              className="text-xs font-bold text-muted hover:text-foreground uppercase tracking-widest px-4 py-2"
            >
              Skip
            </button>

            <button 
              onClick={next}
              className="flex-1 py-4 rounded-2xl bg-indigo-600 text-white font-black uppercase tracking-[0.15em] text-xs inline-flex items-center justify-center gap-2 hover:bg-indigo-500 active:scale-95 shadow-xl shadow-indigo-500/20 transition-all"
            >
              {step === 3 ? (
                <>Start Now 🚀</>
              ) : (
                <>Continue <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </div>
          
          <p className="text-[10px] text-muted mt-6 uppercase tracking-widest font-medium opacity-50">
            SECURE • ENCRYPTED • AI CERTIFIED
          </p>
        </div>
      </motion.div>
    </div>
  );
}
