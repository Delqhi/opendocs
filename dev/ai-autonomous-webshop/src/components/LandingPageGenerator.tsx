import { useState } from 'react';
import { Layout, Palette, Type, MousePointer2, Smartphone, Monitor, Wand2, CheckCircle2, Eye, Code2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const LandingPageGenerator = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    { name: 'Copywriting', icon: Type, status: 'Completed', text: 'KI erstellt verkaufsstarke Headlines und Bulletpoints...' },
    { name: 'Design Assets', icon: Palette, status: 'In Progress', text: 'KI generiert hochauflösende Lifestyle-Bilder...' },
    { name: 'UX-Layout', icon: Layout, status: 'Pending', text: 'KI strukturiert die Sektionen basierend auf Heatmap-Daten...' },
    { name: 'A/B-Varianten', icon: Wand2, status: 'Pending', text: 'KI erstellt 3 Test-Varianten für Conversion-Optimierung...' }
  ];

  const startGeneration = () => {
    setIsGenerating(true);
    let step = 0;
    const interval = setInterval(() => {
      if (step < steps.length - 1) {
        step++;
        setActiveStep(step);
      } else {
        clearInterval(interval);
      }
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white">KI-Landingpage Builder</h2>
          <p className="text-gray-400">Autonome Erstellung von Hochkonvertierenden Sales-Pages</p>
        </div>
        <div className="flex gap-3">
          <div className="flex bg-slate-800 rounded-xl p-1 border border-slate-700">
            <button className="p-2 bg-slate-700 text-white rounded-lg"><Monitor className="w-4 h-4" /></button>
            <button className="p-2 text-gray-500 hover:text-white"><Smartphone className="w-4 h-4" /></button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6">
            <h3 className="font-semibold text-white mb-6">Generation Flow</h3>
            <div className="space-y-8 relative">
              <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-slate-800" />
              {steps.map((step, i) => (
                <div key={i} className="flex gap-4 relative">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 ${
                    i < activeStep ? 'bg-emerald-500 text-white' : 
                    i === activeStep && isGenerating ? 'bg-indigo-500 text-white animate-pulse' : 
                    'bg-slate-800 text-gray-500'
                  }`}>
                    <step.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className={`text-sm font-bold ${i === activeStep && isGenerating ? 'text-white' : 'text-gray-400'}`}>{step.name}</h4>
                    <p className="text-xs text-gray-500 mt-1">{step.text}</p>
                  </div>
                </div>
              ))}
            </div>
            <button 
              onClick={startGeneration}
              disabled={isGenerating}
              className={`w-full mt-8 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                isGenerating ? 'bg-slate-800 text-gray-500 cursor-not-allowed' : 'bg-indigo-500 hover:bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
              }`}
            >
              {isGenerating ? <><CheckCircle2 className="w-4 h-4" /> Generating...</> : <><Wand2 className="w-4 h-4" /> Neue Seite generieren</>}
            </button>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6">
            <h3 className="font-semibold text-white mb-4">Active Landingpages</h3>
            <div className="space-y-3">
              {[
                { name: 'NeuralLink V2 - Launch', conv: '8.4%', visitors: '12.4k' },
                { name: 'CyberWatch - Promo', conv: '5.2%', visitors: '8.1k' },
                { name: 'Quantum Pods - Sale', conv: '6.7%', visitors: '15.2k' }
              ].map((lp, i) => (
                <div key={i} className="p-3 bg-slate-800/40 rounded-2xl flex items-center justify-between border border-transparent hover:border-slate-700 transition-colors cursor-pointer group">
                  <div>
                    <div className="text-sm font-medium text-white group-hover:text-indigo-400 transition-colors">{lp.name}</div>
                    <div className="text-[10px] text-gray-500">{lp.visitors} Visitors</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-emerald-400">{lp.conv}</div>
                    <div className="text-[10px] text-gray-500">Conv. Rate</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-4 overflow-hidden relative">
            <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-4">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500/50" />
                <div className="w-3 h-3 rounded-full bg-amber-500/50" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/50" />
              </div>
              <div className="bg-slate-800 px-3 py-1 rounded text-[10px] text-gray-400 font-mono">
                https://nexus-ai.shop/p/neurallink-v2
              </div>
              <div className="flex gap-2">
                <button className="p-1.5 text-gray-400 hover:text-white transition-colors"><Eye className="w-4 h-4" /></button>
                <button className="p-1.5 text-gray-400 hover:text-white transition-colors"><Code2 className="w-4 h-4" /></button>
              </div>
            </div>

            <div className="aspect-[16/10] bg-slate-950 rounded-xl overflow-y-auto scrollbar-hide border border-slate-800/50 shadow-inner">
              <div className="p-8 space-y-12">
                {/* Simulated Generated Content */}
                <div className="text-center space-y-4">
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="inline-block px-3 py-1 bg-indigo-500/20 text-indigo-400 rounded-full text-xs font-bold tracking-widest uppercase">
                    Revolutionary Technology
                  </motion.div>
                  <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-4xl font-black text-white leading-tight">
                    Die Zukunft direkt <br /> in deinem Kopf.
                  </motion.h1>
                  <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="text-gray-400 max-w-md mx-auto">
                    Erlebe die nächste Stufe der menschlichen Evolution mit dem NeuralLink Gen 2. Nahtlos, intelligent, grenzenlos.
                  </motion.p>
                  <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }} className="flex justify-center gap-4 pt-4">
                    <button className="px-8 py-3 bg-white text-black font-bold rounded-full">Jetzt Vorbestellen</button>
                    <button className="px-8 py-3 bg-slate-800 text-white font-bold rounded-full border border-slate-700">Mehr erfahren</button>
                  </motion.div>
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }} className="bg-slate-900 border border-slate-800 p-6 rounded-3xl">
                    <div className="w-12 h-12 bg-indigo-500/20 rounded-2xl flex items-center justify-center mb-4">
                      <Zap className="w-6 h-6 text-indigo-400" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">Ultra-Fast Sync</h3>
                    <p className="text-sm text-gray-500">Latenzfreie Übertragung deiner Gedanken in digitale Befehle.</p>
                  </motion.div>
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }} className="bg-slate-900 border border-slate-800 p-6 rounded-3xl">
                    <div className="w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center mb-4">
                      <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">Safe & Bio-Inert</h3>
                    <p className="text-sm text-gray-500">Zertifizierte Materialien für lebenslangen Tragekomfort.</p>
                  </motion.div>
                </div>
              </div>

              {/* A/B Test Cursor Simulation */}
              <AnimatePresence>
                {!isGenerating && (
                  <motion.div 
                    initial={{ x: 300, y: 300 }}
                    animate={{ 
                      x: [300, 100, 400, 250],
                      y: [300, 150, 400, 200]
                    }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute pointer-events-none z-50"
                  >
                    <MousePointer2 className="w-6 h-6 text-indigo-500 drop-shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                    <div className="bg-indigo-500 text-white text-[10px] px-2 py-0.5 rounded ml-4 -mt-2 whitespace-nowrap font-bold shadow-lg">
                      AI User Simulation #812
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="mt-4 flex items-center justify-between text-[11px] text-gray-500 font-medium">
              <div className="flex gap-4">
                <span>Page Health: <span className="text-emerald-400">98%</span></span>
                <span>SEO Score: <span className="text-emerald-400">92/100</span></span>
                <span>Load Time: <span className="text-emerald-400">0.4s</span></span>
              </div>
              <div className="flex gap-2">
                <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> 14 Online</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Zap = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
);

export default LandingPageGenerator;
