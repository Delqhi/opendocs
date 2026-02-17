import { Brain, TrendingUp, DollarSign, Package, Megaphone, Lightbulb, Zap, CheckCircle, ArrowRight, Cpu, Database, Wifi, Shield, Globe, Bot, RefreshCw } from 'lucide-react';
import { useShopStore } from '../store/shopStore';
import { useState, useEffect } from 'react';

export function AICenter() {
  const { aiInsights, aiAutoPilot, toggleAiAutoPilot, products } = useShopStore();
  const [activeTab, setActiveTab] = useState<'insights' | 'automation' | 'strategy'>('insights');
  const [processingTasks, setProcessingTasks] = useState<number>(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProcessingTasks(prev => (prev + 1) % 100);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const insightIcons: Record<string, React.ReactNode> = {
    trend: <TrendingUp className="w-4 h-4" />,
    price: <DollarSign className="w-4 h-4" />,
    stock: <Package className="w-4 h-4" />,
    marketing: <Megaphone className="w-4 h-4" />,
    profit: <Lightbulb className="w-4 h-4" />,
  };

  const impactColors: Record<string, string> = {
    high: 'bg-red-500/20 text-red-400 border-red-500/30',
    medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    low: 'bg-green-500/20 text-green-400 border-green-500/30',
  };

  const automationModules = [
    { name: 'Produkt-Sourcing Engine', desc: 'Findet automatisch die besten Produkte von globalen Lieferanten', status: 'active', tasks: 2847, icon: <Globe className="w-5 h-5" /> },
    { name: 'Dynamische Preisgestaltung', desc: 'Passt Preise in Echtzeit an Nachfrage & Wettbewerb an', status: 'active', tasks: 15234, icon: <DollarSign className="w-5 h-5" /> },
    { name: 'Bestandsmanagement KI', desc: 'Prognostiziert Nachfrage und bestellt automatisch nach', status: 'active', tasks: 892, icon: <Package className="w-5 h-5" /> },
    { name: 'Marketing Autopilot', desc: 'Erstellt und schaltet Ads auf Social Media automatisch', status: 'active', tasks: 4521, icon: <Megaphone className="w-5 h-5" /> },
    { name: 'Kundenservice Bot', desc: 'Beantwortet 97% aller Anfragen automatisch', status: 'active', tasks: 8734, icon: <Bot className="w-5 h-5" /> },
    { name: 'Versand-Optimierung', desc: 'Wählt günstigste & schnellste Versandrouten', status: 'active', tasks: 3156, icon: <Shield className="w-5 h-5" /> },
    { name: 'Review-Analyse Engine', desc: 'Analysiert Kundenfeedback und optimiert Produkte', status: 'active', tasks: 1243, icon: <Brain className="w-5 h-5" /> },
    { name: 'Trend-Prediction AI', desc: 'Sagt kommende Trends 6-12 Wochen vorher', status: 'active', tasks: 567, icon: <TrendingUp className="w-5 h-5" /> },
  ];

  const strategies = [
    { name: 'Gewinnmaximierung', desc: 'KI optimiert alle Prozesse auf maximale Marge', progress: 87, kpi: '+34% Marge vs. letzter Monat' },
    { name: 'Marktexpansion', desc: 'Automatische Expansion in neue Produktkategorien', progress: 62, kpi: '3 neue Kategorien identifiziert' },
    { name: 'Kundenbindung', desc: 'Personalisierte Angebote & Retention-Kampagnen', progress: 91, kpi: '96.3% Kundenzufriedenheit' },
    { name: 'Lieferketten-Resilienz', desc: 'Multi-Supplier Strategie für Ausfallsicherheit', progress: 78, kpi: '5 Backup-Lieferanten pro Produkt' },
    { name: 'Wettbewerbsanalyse', desc: 'Echtzeit-Monitoring von 47 Wettbewerbern', progress: 95, kpi: 'Preise 12% unter Marktdurchschnitt' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <Brain className="w-7 h-7 text-primary-400" />
            KI-Kommandozentrale
          </h2>
          <p className="text-sm text-gray-500 mt-1">Volle Kontrolle über alle autonomen Systeme</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 glass rounded-xl">
            <Cpu className="w-4 h-4 text-primary-400" />
            <span className="text-xs text-gray-300">{products.length} Produkte aktiv</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 glass rounded-xl">
            <Database className="w-4 h-4 text-accent-400" />
            <span className="text-xs text-gray-300">37.2k Datenpunkte/h</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 glass rounded-xl">
            <Wifi className="w-4 h-4 text-green-400 animate-pulse" />
            <span className="text-xs text-gray-300">Live</span>
          </div>
        </div>
      </div>

      {/* AI Neural Network Visualization */}
      <div className="glass rounded-2xl p-6 bg-gradient-to-r from-primary-900/30 to-accent-600/10 border border-primary-500/20">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-5 h-5 text-primary-400" />
              <h3 className="text-lg font-bold text-white">NexusAI Neural Engine</h3>
            </div>
            <p className="text-sm text-gray-400 mb-4">Vollständig autonomes E-Commerce-System mit selbstlernender KI</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <MiniStat label="Entscheidungen/Tag" value="12,847" />
              <MiniStat label="Genauigkeit" value="98.7%" />
              <MiniStat label="Reaktionszeit" value="0.3ms" />
              <MiniStat label="Optimierungen" value="1,234" />
            </div>
          </div>
          <div className="relative w-48 h-48 flex-shrink-0">
            <div className="absolute inset-0 rounded-full border-2 border-primary-500/20 animate-pulse" />
            <div className="absolute inset-4 rounded-full border-2 border-accent-500/20 animate-pulse" style={{ animationDelay: '0.5s' }} />
            <div className="absolute inset-8 rounded-full border-2 border-primary-500/30 animate-pulse" style={{ animationDelay: '1s' }} />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <Brain className="w-10 h-10 text-primary-400 mx-auto animate-pulse" />
                <p className="text-lg font-bold text-white mt-1">{processingTasks}%</p>
                <p className="text-[10px] text-gray-500">Processing</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <TabButton active={activeTab === 'insights'} onClick={() => setActiveTab('insights')} label="KI-Insights" count={aiInsights.length} />
        <TabButton active={activeTab === 'automation'} onClick={() => setActiveTab('automation')} label="Automatisierung" count={automationModules.length} />
        <TabButton active={activeTab === 'strategy'} onClick={() => setActiveTab('strategy')} label="Strategie" count={strategies.length} />
      </div>

      {/* Tab Content */}
      {activeTab === 'insights' && (
        <div className="space-y-4">
          {aiInsights.map((insight, i) => (
            <div key={insight.id} className="glass rounded-2xl p-5 hover:border-primary-500/20 transition-all animate-slide-up" style={{ animationDelay: `${i * 80}ms` }}>
              <div className="flex items-start gap-4">
                <div className={`p-2.5 rounded-xl ${
                  insight.type === 'trend' ? 'bg-blue-500/20 text-blue-400' :
                  insight.type === 'price' ? 'bg-green-500/20 text-green-400' :
                  insight.type === 'stock' ? 'bg-orange-500/20 text-orange-400' :
                  insight.type === 'marketing' ? 'bg-purple-500/20 text-purple-400' :
                  'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {insightIcons[insight.type]}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="text-sm font-semibold text-white">{insight.title}</h4>
                      <p className="text-xs text-gray-400 mt-1">{insight.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${impactColors[insight.impact]}`}>
                        {insight.impact === 'high' ? 'Hoch' : insight.impact === 'medium' ? 'Mittel' : 'Niedrig'}
                      </span>
                      {insight.automated && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-accent-500/20 text-accent-400 border border-accent-500/30">
                          Auto
                        </span>
                      )}
                    </div>
                  </div>
                  {insight.action && (
                    <div className="flex items-center gap-2 mt-3 p-2 rounded-lg bg-accent-500/10 border border-accent-500/20">
                      <CheckCircle className="w-3.5 h-3.5 text-accent-400 flex-shrink-0" />
                      <span className="text-xs text-accent-300">{insight.action}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'automation' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {automationModules.map((mod, i) => (
            <div key={mod.name} className="glass rounded-2xl p-5 hover:border-primary-500/20 transition-all animate-slide-up" style={{ animationDelay: `${i * 60}ms` }}>
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-primary-500/20 text-primary-400">
                  {mod.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-white">{mod.name}</h4>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-accent-400 rounded-full animate-pulse" />
                      <span className="text-[10px] text-accent-400">Aktiv</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{mod.desc}</p>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xs text-gray-400">{mod.tasks.toLocaleString()} Tasks ausgeführt</span>
                    <RefreshCw className="w-3 h-3 text-gray-600 animate-spin" style={{ animationDuration: '3s' }} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'strategy' && (
        <div className="space-y-4">
          {strategies.map((strat, i) => (
            <div key={strat.name} className="glass rounded-2xl p-5 animate-slide-up" style={{ animationDelay: `${i * 80}ms` }}>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold text-white">{strat.name}</h4>
                <span className="text-sm font-bold text-primary-400">{strat.progress}%</span>
              </div>
              <p className="text-xs text-gray-500 mb-3">{strat.desc}</p>
              <div className="h-2 bg-dark-600 rounded-full mb-3">
                <div className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full transition-all" style={{ width: `${strat.progress}%` }} />
              </div>
              <div className="flex items-center gap-2 text-xs text-accent-400">
                <ArrowRight className="w-3 h-3" />
                <span>{strat.kpi}</span>
              </div>
            </div>
          ))}

          {/* Autopilot Control */}
          <div className={`glass rounded-2xl p-6 border-2 transition-all ${aiAutoPilot ? 'border-accent-500/30 bg-accent-500/5' : 'border-gray-700'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-xl ${aiAutoPilot ? 'bg-accent-500/20 text-accent-400' : 'bg-gray-700 text-gray-400'}`}>
                  <Brain className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white">Vollautonomer Modus</h4>
                  <p className="text-xs text-gray-400 mt-0.5">KI trifft alle Entscheidungen ohne menschliche Intervention</p>
                </div>
              </div>
              <button
                onClick={toggleAiAutoPilot}
                className={`px-6 py-3 rounded-xl font-semibold text-sm transition-all ${
                  aiAutoPilot
                    ? 'bg-accent-500 text-white hover:bg-accent-600'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {aiAutoPilot ? 'Aktiv ✓' : 'Aktivieren'}
              </button>
            </div>
            {aiAutoPilot && (
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                <MiniStat label="Automatisiert" value="100%" />
                <MiniStat label="Kosten gespart" value="€8,420" />
                <MiniStat label="Zeitersparnis" value="142h/Mo" />
                <MiniStat label="Fehlerrate" value="0.02%" />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-3 rounded-xl bg-white/5">
      <p className="text-lg font-bold text-white">{value}</p>
      <p className="text-[10px] text-gray-500">{label}</p>
    </div>
  );
}

function TabButton({ active, onClick, label, count }: { active: boolean; onClick: () => void; label: string; count: number }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
        active
          ? 'bg-primary-500/20 text-primary-300 border border-primary-500/30'
          : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
      }`}
    >
      {label}
      <span className={`px-1.5 py-0.5 rounded-md text-[10px] ${active ? 'bg-primary-500/30 text-primary-300' : 'bg-white/10 text-gray-500'}`}>{count}</span>
    </button>
  );
}
