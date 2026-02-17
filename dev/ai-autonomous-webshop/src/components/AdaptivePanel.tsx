import { useState, useEffect } from 'react';
import { Settings, Type, Eye, Trash2, Check, RefreshCw, X, Sliders, Languages } from 'lucide-react';
import { useShopStore } from '../store/shopStore';

export function AdaptivePanel({ onClose }: { onClose: () => void }) {
  const { 
    darkMode, 
    toggleDarkMode,
    pushToast,
    language,
    setLanguage
  } = useShopStore();

  const [fontScale, setFontScale] = useState(100);
  const [highContrast, setHighContrast] = useState(false);
  const [motionReduction, setMotionReduction] = useState(false);

  // Sync scale to root
  useEffect(() => {
    document.documentElement.style.fontSize = `${fontScale}%`;
  }, [fontScale]);

  // Sync contrast to root
  useEffect(() => {
    if (highContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
  }, [highContrast]);

  // Sync motion to root
  useEffect(() => {
    if (motionReduction) {
      document.documentElement.classList.add('reduce-motion');
    } else {
      document.documentElement.classList.remove('reduce-motion');
    }
  }, [motionReduction]);

  const reset = () => {
    setFontScale(100);
    setHighContrast(false);
    setMotionReduction(false);
    pushToast({ type: 'info', message: 'Accessibility reset to default' });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-end sm:p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div 
        className="relative w-full sm:w-80 h-full sm:h-auto surface border sm:rounded-2xl shadow-2xl animate-drop-in p-5"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-foreground" />
            <h2 className="text-sm font-bold text-foreground">Adaptive UX</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-muted transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Font Scale */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-foreground flex items-center gap-2">
                <Type className="w-4 h-4 text-muted" /> Text Size
              </span>
              <span className="text-[10px] font-mono text-muted">{fontScale}%</span>
            </div>
            <input 
              type="range" 
              min="80" 
              max="130" 
              step="5"
              value={fontScale}
              onChange={(e) => setFontScale(parseInt(e.target.value))}
              className="w-full h-1.5 bg-black/10 dark:bg-white/10 rounded-full appearance-none cursor-pointer accent-blue-500"
            />
            <div className="flex justify-between text-[9px] text-muted uppercase font-bold tracking-widest">
              <span>Small</span>
              <span>Normal</span>
              <span>Large</span>
            </div>
          </div>

          {/* High Contrast */}
          <div className="flex items-center justify-between p-3 rounded-xl border border-subtle surface-alt">
            <div className="flex items-center gap-3">
              <Eye className="w-4 h-4 text-muted" />
              <div>
                <p className="text-xs font-semibold text-foreground">High Contrast</p>
                <p className="text-[10px] text-muted">Enhanced readability</p>
              </div>
            </div>
            <button 
              onClick={() => setHighContrast(!highContrast)}
              className={`w-10 h-5 rounded-full transition-all relative ${highContrast ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-700'}`}
            >
              <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${highContrast ? 'left-5.5' : 'left-0.5'}`} />
            </button>
          </div>

          {/* Motion Reduction */}
          <div className="flex items-center justify-between p-3 rounded-xl border border-subtle surface-alt">
            <div className="flex items-center gap-3">
              <Trash2 className="w-4 h-4 text-muted" />
              <div>
                <p className="text-xs font-semibold text-foreground">Reduced Motion</p>
                <p className="text-[10px] text-muted">Stop animations</p>
              </div>
            </div>
            <button 
              onClick={() => setMotionReduction(!motionReduction)}
              className={`w-10 h-5 rounded-full transition-all relative ${motionReduction ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-700'}`}
            >
              <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${motionReduction ? 'left-5.5' : 'left-0.5'}`} />
            </button>
          </div>

          {/* Theme */}
          <div className="flex items-center justify-between p-3 rounded-xl border border-subtle surface-alt">
            <div className="flex items-center gap-3">
              <Settings className="w-4 h-4 text-muted" />
              <div>
                <p className="text-xs font-semibold text-foreground">Appearance</p>
                <p className="text-[10px] text-muted">{darkMode ? 'Dark' : 'Light'} Mode</p>
              </div>
            </div>
            <button 
              onClick={toggleDarkMode}
              className={`w-10 h-5 rounded-full transition-all relative ${darkMode ? 'bg-indigo-500' : 'bg-gray-300 dark:bg-gray-700'}`}
            >
              <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${darkMode ? 'left-5.5' : 'left-0.5'}`} />
            </button>
          </div>

          {/* Language */}
          <div className="space-y-3">
            <span className="text-xs font-semibold text-foreground flex items-center gap-2">
              <Languages className="w-4 h-4 text-muted" /> Language
            </span>
            <div className="grid grid-cols-5 gap-2">
              {[
                { code: 'en', label: 'EN' },
                { code: 'de', label: 'DE' },
                { code: 'es', label: 'ES' },
                { code: 'fr', label: 'FR' },
                { code: 'zh', label: 'ZH' }
              ].map(lang => (
                <button
                  key={lang.code}
                  onClick={() => setLanguage(lang.code as any)}
                  className={`py-2 rounded-lg text-[10px] font-black border transition-all ${
                    language === lang.code ? 'bg-indigo-600 text-white border-indigo-600' : 'border-subtle hover:border-foreground'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-subtle flex gap-2">
          <button 
            onClick={reset}
            className="flex-1 py-2.5 rounded-xl border border-subtle text-xs font-semibold text-muted hover:text-foreground inline-flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Reset
          </button>
          <button 
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-foreground text-white text-xs font-semibold inline-flex items-center justify-center gap-2"
          >
            <Check className="w-3.5 h-3.5" /> Apply
          </button>
        </div>
      </div>
    </div>
  );
}
