import { TrendingUp, DollarSign, Zap, Package, ArrowUpRight, ArrowDownRight, Brain, Globe, Truck, BarChart3, Users } from 'lucide-react';
import { useShopStore } from '../store/shopStore';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useMemo } from 'react';

const aiActions = [
  { time: '14:32', action: 'Optimized price for QuantumWatch Ultra', type: 'price' },
  { time: '14:15', action: 'Restock order: 150x NeuroLink Pro', type: 'stock' },
  { time: '13:58', action: 'Instagram Ad Campaign #Holiday2024 started', type: 'marketing' },
  { time: '13:41', action: 'Supplier switched for AeroCharge Pad → 12% cheaper', type: 'supplier' },
  { time: '13:22', action: 'Customer review analyzed → Description updated', type: 'review' },
  { time: '13:05', action: 'SEO Optimization for 8 product pages', type: 'seo' },
  { time: '12:48', action: 'Shipping route optimized → 1 day faster', type: 'shipping' },
  { time: '12:30', action: 'New trend identified: Smart Ring +240%', type: 'trend' },
];

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#3b82f6'];

export function Dashboard() {
  const { userOrders, aiAutoPilot, toggleAiAutoPilot, products } = useShopStore();

  // Calculate real-time stats from orders
  const { totalRevenue, totalOrders, revenueData, categoryData } = useMemo(() => {
    const revenue = userOrders.reduce((sum, o) => sum + o.total, 0);
    const count = userOrders.length;

    // Group orders by date (last 7 days logic simulated for demo orders if they have dates)
    // If we only have current orders, we might need to mock some history or just show what we have.
    // For this "sell ready" version, we'll try to bucket real orders by date.
    
    const last7DaysMap = new Map<string, { revenue: number; profit: number; orders: number }>();
    
    // Fill last 7 days with 0
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toLocaleDateString('en-US', { weekday: 'short' });
      last7DaysMap.set(key, { revenue: 0, profit: 0, orders: 0 });
    }

    userOrders.forEach(o => {
      const d = new Date(o.date);
      const key = d.toLocaleDateString('en-US', { weekday: 'short' });
      // If date is within range (or we just map to buckets for demo visuals if date is far off/invalid)
      // For demo purposes, we might want to distribute them if there are few.
      // But let's stick to real data.
      if (last7DaysMap.has(key)) {
        const prev = last7DaysMap.get(key)!;
        last7DaysMap.set(key, {
          revenue: prev.revenue + o.total,
          profit: prev.profit + (o.total * 0.4), // Est 40% margin
          orders: prev.orders + 1
        });
      }
    });

    const revData = Array.from(last7DaysMap.entries()).map(([name, val]) => ({ name, ...val }));

    // Category distribution based on products sold or inventory if no sales
    const catMap = new Map<string, number>();
    products.forEach(p => {
        catMap.set(p.category, (catMap.get(p.category) || 0) + 1);
    });
    
    const catData = Array.from(catMap.entries()).map(([name, value], i) => ({
      name, value, color: COLORS[i % COLORS.length]
    }));

    return { totalRevenue: revenue, totalOrders: count, revenueData: revData, categoryData: catData };
  }, [userOrders, products]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">KI-Dashboard</h2>
          <p className="text-sm text-gray-500 mt-1">Echtzeit-Übersicht aller autonomen Operationen</p>
        </div>
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all cursor-pointer ${
            aiAutoPilot 
              ? 'bg-accent-500/20 border-accent-500/30 text-accent-300' 
              : 'bg-white/5 border-white/10 text-gray-400'
          }`} onClick={toggleAiAutoPilot}>
            <Brain className="w-4 h-4" />
            <span className="text-sm font-medium">KI Autopilot</span>
            <div className={`w-10 h-5 rounded-full transition-all ${aiAutoPilot ? 'bg-accent-500' : 'bg-gray-600'} relative`}>
              <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${aiAutoPilot ? 'left-5' : 'left-0.5'}`} />
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard icon={<DollarSign className="w-5 h-5" />} label="Umsatz Portfolio" value={`€${totalRevenue.toLocaleString('de-DE')}`} change={12.5} color="primary" />
        <KPICard icon={<Package className="w-5 h-5" />} label="Auto-Fulfillment" value={`${totalOrders.toString()} active`} change={8.3} color="accent" />
        <KPICard icon={<Zap className="w-5 h-5" />} label="Rule Execution" value="1,248 ops" change={14.2} color="yellow" />
        <KPICard icon={<Globe className="w-5 h-5" />} label="Network Uptime" value="100%" change={0.01} color="green" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-semibold text-white">Umsatz & Gewinn</h3>
              <p className="text-xs text-gray-500 mt-1">Letzte 7 Tage – KI-optimiert</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-primary-500" />
                <span className="text-gray-400">Umsatz</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-accent-500" />
                <span className="text-gray-400">Gewinn</span>
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" stroke="#555" fontSize={12} />
              <YAxis stroke="#555" fontSize={12} tickFormatter={(v) => `€${v / 1000}k`} />
              <Tooltip 
                contentStyle={{ background: '#1a1a3e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                formatter={(value) => [`€${(value ?? 0).toLocaleString('de-DE')}`, '']}
              />
              <Area type="monotone" dataKey="revenue" stroke="#6366f1" fillOpacity={1} fill="url(#colorRevenue)" strokeWidth={2} />
              <Area type="monotone" dataKey="profit" stroke="#10b981" fillOpacity={1} fill="url(#colorProfit)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Category Distribution */}
        <div className="glass rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-white mb-2">Kategorie-Verteilung</h3>
          <p className="text-xs text-gray-500 mb-4">KI-optimierter Produktmix</p>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={categoryData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                {categoryData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#1a1a3e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', fontSize: '12px' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {categoryData.map(c => (
              <div key={c.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: c.color }} />
                  <span className="text-gray-400">{c.name}</span>
                </div>
                <span className="text-gray-300 font-medium">{c.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Activity Log */}
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary-400" />
              <h3 className="text-sm font-semibold text-white">KI-Aktivitätslog</h3>
            </div>
            <div className="flex items-center gap-1 px-2 py-1 bg-accent-500/20 rounded-full">
              <div className="w-1.5 h-1.5 bg-accent-400 rounded-full animate-pulse" />
              <span className="text-[10px] text-accent-300">Live</span>
            </div>
          </div>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {aiActions.map((action, i) => (
              <div key={i} className="flex items-start gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors">
                <span className="text-[10px] text-gray-600 mt-0.5 whitespace-nowrap">{action.time}</span>
                <div className="w-1.5 h-1.5 rounded-full bg-primary-400 mt-1.5 flex-shrink-0" />
                <p className="text-xs text-gray-300">{action.action}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Autonomous Systems Status */}
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-4 h-4 text-primary-400" />
            <h3 className="text-sm font-semibold text-white">Autonome Systeme</h3>
          </div>
          <div className="space-y-3">
            <SystemStatus icon={<Brain className="w-4 h-4" />} name="KI-Preisoptimierung" status="active" efficiency={97} />
            <SystemStatus icon={<Package className="w-4 h-4" />} name="Auto-Nachbestellung" status="active" efficiency={94} />
            <SystemStatus icon={<Globe className="w-4 h-4" />} name="Lieferanten-Management" status="active" efficiency={91} />
            <SystemStatus icon={<TrendingUp className="w-4 h-4" />} name="Trend-Erkennung" status="active" efficiency={89} />
            <SystemStatus icon={<Truck className="w-4 h-4" />} name="Versand-Optimierung" status="active" efficiency={96} />
            <SystemStatus icon={<Users className="w-4 h-4" />} name="Kundenservice-Bot" status="active" efficiency={93} />
          </div>
          <div className="mt-4 p-3 rounded-xl bg-accent-500/10 border border-accent-500/20">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-accent-400" />
              <span className="text-xs text-accent-300 font-medium">Alle {products.length} Systeme laufen autonom</span>
            </div>
            <p className="text-[10px] text-gray-500 mt-1">Letzte manuelle Intervention: Nie – 100% KI-gesteuert</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function KPICard({ icon, label, value, change, color }: { icon: React.ReactNode; label: string; value: string; change: number; color: string }) {
  const colors: Record<string, string> = {
    primary: 'from-primary-500/20 to-primary-500/5 border-primary-500/20 text-primary-400',
    accent: 'from-accent-500/20 to-accent-500/5 border-accent-500/20 text-accent-400',
    yellow: 'from-yellow-500/20 to-yellow-500/5 border-yellow-500/20 text-yellow-400',
    green: 'from-green-500/20 to-green-500/5 border-green-500/20 text-green-400',
  };

  return (
    <div className={`glass rounded-2xl p-5 bg-gradient-to-br ${colors[color]} border`}>
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2 rounded-xl bg-white/5`}>{icon}</div>
        <div className={`flex items-center gap-1 text-xs ${change > 0 ? 'text-accent-400' : 'text-red-400'}`}>
          {change > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {Math.abs(change)}%
        </div>
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-xs text-gray-500 mt-1">{label}</p>
    </div>
  );
}

function SystemStatus({ icon, name, status: _status, efficiency }: { icon: React.ReactNode; name: string; status: string; efficiency: number }) {
  return (
    <div className="flex items-center gap-3 p-2 rounded-xl bg-white/5">
      <div className="text-primary-400">{icon}</div>
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-gray-300">{name}</span>
          <span className="text-xs text-accent-400 font-medium">{efficiency}%</span>
        </div>
        <div className="h-1 bg-dark-600 rounded-full">
          <div className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full transition-all" style={{ width: `${efficiency}%` }} />
        </div>
      </div>
      <div className="w-2 h-2 bg-accent-400 rounded-full animate-pulse" />
    </div>
  );
}
