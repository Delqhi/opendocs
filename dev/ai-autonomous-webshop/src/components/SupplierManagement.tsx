import { Globe, Star, Package, DollarSign, CheckCircle, Zap, RefreshCw, Brain, ArrowUpRight, Shield, Truck } from 'lucide-react';
import { useState } from 'react';

interface Supplier {
  id: string;
  name: string;
  country: string;
  flag: string;
  rating: number;
  products: number;
  deliveryTime: string;
  reliability: number;
  priceIndex: number;
  status: 'active' | 'pending' | 'paused';
  lastOrder: string;
  totalOrders: number;
  savings: number;
  aiScore: number;
}

const suppliers: Supplier[] = [
  { id: 'sup-1', name: 'TechDirect CN', country: 'China', flag: '🇨🇳', rating: 4.9, products: 234, deliveryTime: '5-7 Tage', reliability: 98.5, priceIndex: 72, status: 'active', lastOrder: 'vor 2h', totalOrders: 1847, savings: 24500, aiScore: 96 },
  { id: 'sup-2', name: 'SmartSource HK', country: 'Hong Kong', flag: '🇭🇰', rating: 4.8, products: 156, deliveryTime: '4-6 Tage', reliability: 97.2, priceIndex: 78, status: 'active', lastOrder: 'vor 5h', totalOrders: 1234, savings: 18200, aiScore: 93 },
  { id: 'sup-3', name: 'GlobalTech SZ', country: 'China', flag: '🇨🇳', rating: 4.7, products: 312, deliveryTime: '6-8 Tage', reliability: 95.8, priceIndex: 65, status: 'active', lastOrder: 'vor 1 Tag', totalOrders: 2156, savings: 31400, aiScore: 91 },
  { id: 'sup-4', name: 'NexGen Supply', country: 'Vietnam', flag: '🇻🇳', rating: 4.6, products: 89, deliveryTime: '7-10 Tage', reliability: 94.1, priceIndex: 58, status: 'active', lastOrder: 'vor 3 Tage', totalOrders: 567, savings: 8900, aiScore: 88 },
  { id: 'sup-5', name: 'AI Logistics', country: 'Südkorea', flag: '🇰🇷', rating: 4.9, products: 78, deliveryTime: '3-5 Tage', reliability: 99.1, priceIndex: 89, status: 'active', lastOrder: 'vor 6h', totalOrders: 892, savings: 12300, aiScore: 97 },
  { id: 'sup-6', name: 'EuroTech DE', country: 'Deutschland', flag: '🇩🇪', rating: 4.8, products: 45, deliveryTime: '1-2 Tage', reliability: 99.5, priceIndex: 112, status: 'pending', lastOrder: 'vor 1 Woche', totalOrders: 234, savings: 2100, aiScore: 85 },
];

const aiActions = [
  { time: '14:45', action: 'Automatische Nachbestellung bei TechDirect CN: 500x NeuroLink Pro', type: 'order' },
  { time: '14:32', action: 'Preisverhandlung mit GlobalTech SZ → 8% Rabatt gesichert', type: 'negotiation' },
  { time: '14:15', action: 'Qualitätsprüfung bestanden: Charge #NX-2847 von SmartSource HK', type: 'quality' },
  { time: '13:58', action: 'Neuer Backup-Lieferant identifiziert: TaiwanTech für Audio-Kategorie', type: 'discovery' },
  { time: '13:41', action: 'Lieferzeit-Optimierung: Route über Rotterdam → 1.5 Tage schneller', type: 'logistics' },
  { time: '13:22', action: 'Risikoanalyse: Chinesisches Neujahr → Bestand um 40% erhöht', type: 'risk' },
];

export function SupplierManagement() {
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(suppliers[0]);
  const [isNegotiating, setIsNegotiating] = useState(false);
  const [negotiationResult, setNegotiationResult] = useState<string | null>(null);

  const handleAutoNegotiate = () => {
    setIsNegotiating(true);
    setNegotiationResult(null);
    setTimeout(() => {
      const discount = Math.floor(Math.random() * 8) + 3;
      setNegotiationResult(`KI hat ${discount}% Rabatt ausgehandelt!`);
      setIsNegotiating(false);
    }, 3000);
  };

  const totalSavings = suppliers.reduce((sum, s) => sum + s.savings, 0);
  const avgReliability = suppliers.reduce((sum, s) => sum + s.reliability, 0) / suppliers.length;
  const totalProducts = suppliers.reduce((sum, s) => sum + s.products, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <Globe className="w-7 h-7 text-primary-400" />
            Lieferanten-Management
          </h2>
          <p className="text-sm text-gray-500 mt-1">KI-gesteuerte Beschaffung & Qualitätskontrolle</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleAutoNegotiate}
            disabled={isNegotiating}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-primary-500 to-accent-500 text-white text-sm font-medium hover:shadow-lg hover:shadow-primary-500/25 transition-all disabled:opacity-50"
          >
            {isNegotiating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                KI verhandelt...
              </>
            ) : (
              <>
                <Brain className="w-4 h-4" />
                Auto-Verhandlung starten
              </>
            )}
          </button>
        </div>
      </div>

      {negotiationResult && (
        <div className="p-4 rounded-xl bg-accent-500/20 border border-accent-500/30 animate-slide-up">
          <div className="flex items-center gap-2 text-accent-300">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">{negotiationResult}</span>
          </div>
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-xl bg-accent-500/20">
              <DollarSign className="w-5 h-5 text-accent-400" />
            </div>
            <div className="flex items-center gap-1 text-xs text-accent-400">
              <ArrowUpRight className="w-3 h-3" />
              +12%
            </div>
          </div>
          <p className="text-2xl font-bold text-white">€{(totalSavings / 1000).toFixed(1)}k</p>
          <p className="text-xs text-gray-500 mt-1">Gesamtersparnis</p>
        </div>
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-xl bg-primary-500/20">
              <Package className="w-5 h-5 text-primary-400" />
            </div>
            <span className="text-xs text-primary-400">{suppliers.length} aktiv</span>
          </div>
          <p className="text-2xl font-bold text-white">{totalProducts}</p>
          <p className="text-xs text-gray-500 mt-1">Produkte verfügbar</p>
        </div>
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-xl bg-yellow-500/20">
              <Shield className="w-5 h-5 text-yellow-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white">{avgReliability.toFixed(1)}%</p>
          <p className="text-xs text-gray-500 mt-1">Ø Zuverlässigkeit</p>
        </div>
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-xl bg-blue-500/20">
              <Truck className="w-5 h-5 text-blue-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white">4.7 Tage</p>
          <p className="text-xs text-gray-500 mt-1">Ø Lieferzeit</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Suppliers List */}
        <div className="lg:col-span-2">
          <div className="glass rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-white/5">
              <h3 className="text-sm font-semibold text-white">Aktive Lieferanten</h3>
            </div>
            <div className="divide-y divide-white/5">
              {suppliers.map(supplier => (
                <div
                  key={supplier.id}
                  onClick={() => setSelectedSupplier(supplier)}
                  className={`p-4 cursor-pointer transition-all hover:bg-white/5 ${
                    selectedSupplier?.id === supplier.id ? 'bg-primary-500/10' : ''
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="text-3xl">{supplier.flag}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-white">{supplier.name}</p>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                          supplier.status === 'active' ? 'bg-accent-500/20 text-accent-400' :
                          supplier.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {supplier.status === 'active' ? 'Aktiv' : supplier.status === 'pending' ? 'Ausstehend' : 'Pausiert'}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                        <span>{supplier.products} Produkte</span>
                        <span>•</span>
                        <span>{supplier.deliveryTime}</span>
                        <span>•</span>
                        <span className="flex items-center gap-0.5">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          {supplier.rating}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1">
                        <Zap className="w-3 h-3 text-primary-400" />
                        <span className="text-sm font-bold text-primary-400">{supplier.aiScore}</span>
                      </div>
                      <p className="text-[10px] text-gray-500">AI-Score</p>
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    <div className="p-2 rounded-lg bg-white/5 text-center">
                      <p className="text-xs text-gray-400">Zuverlässigkeit</p>
                      <p className="text-sm text-white font-medium">{supplier.reliability}%</p>
                    </div>
                    <div className="p-2 rounded-lg bg-white/5 text-center">
                      <p className="text-xs text-gray-400">Preis-Index</p>
                      <p className="text-sm text-white font-medium">{supplier.priceIndex}</p>
                    </div>
                    <div className="p-2 rounded-lg bg-white/5 text-center">
                      <p className="text-xs text-gray-400">Ersparnis</p>
                      <p className="text-sm text-accent-400 font-medium">€{(supplier.savings / 1000).toFixed(1)}k</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* AI Actions & Selected Supplier */}
        <div className="space-y-6">
          {/* AI Actions Log */}
          <div className="glass rounded-2xl p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-primary-400" />
                <h3 className="text-sm font-semibold text-white">KI-Aktivitäten</h3>
              </div>
              <div className="flex items-center gap-1 px-2 py-0.5 bg-accent-500/20 rounded-full">
                <div className="w-1.5 h-1.5 bg-accent-400 rounded-full animate-pulse" />
                <span className="text-[10px] text-accent-300">Live</span>
              </div>
            </div>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {aiActions.map((action, i) => (
                <div key={i} className="flex items-start gap-2 text-xs">
                  <span className="text-gray-600 whitespace-nowrap">{action.time}</span>
                  <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${
                    action.type === 'order' ? 'bg-primary-400' :
                    action.type === 'negotiation' ? 'bg-accent-400' :
                    action.type === 'quality' ? 'bg-green-400' :
                    action.type === 'discovery' ? 'bg-yellow-400' :
                    action.type === 'logistics' ? 'bg-blue-400' :
                    'bg-orange-400'
                  }`} />
                  <span className="text-gray-400">{action.action}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Selected Supplier Details */}
          {selectedSupplier && (
            <div className="glass rounded-2xl p-4">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-4xl">{selectedSupplier.flag}</span>
                <div>
                  <h4 className="text-sm font-semibold text-white">{selectedSupplier.name}</h4>
                  <p className="text-xs text-gray-500">{selectedSupplier.country}</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Letzte Bestellung</span>
                  <span className="text-white">{selectedSupplier.lastOrder}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Gesamt-Bestellungen</span>
                  <span className="text-white">{selectedSupplier.totalOrders}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">AI-Score</span>
                  <span className="text-primary-400 font-bold">{selectedSupplier.aiScore}/100</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-white/5">
                <button className="w-full py-2 rounded-xl bg-primary-500/20 text-primary-300 text-sm font-medium hover:bg-primary-500/30 transition-colors">
                  Bestellung aufgeben
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
