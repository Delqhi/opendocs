import { DollarSign, ArrowUpRight, ArrowDownRight, Wallet, Receipt, PieChart, Landmark, TrendingUp, AlertTriangle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useShopStore } from '../store/shopStore';
import { useMemo } from 'react';

const FinanceCenter = () => {
  const { userOrders, financeSnapshots } = useShopStore();

  const financialData = useMemo(() => {
    // Combine static history (financeSnapshots) with real-time calculation for current month?
    // For simplicity, let's assume financeSnapshots are historical and we append current month if not present.
    // Or just recalculate entirely if we had enough order history.
    // Since this is "sell ready", let's prioritize real orders for the "Current" month stats.
    
    const now = new Date();
    const currentMonthLabel = now.toLocaleString('en-US', { month: 'short' });
    
    const currentRevenue = userOrders.reduce((sum, o) => {
        // Filter for current month orders ideally, but for demo we take all userOrders as "current" activity?
        // Let's filter by month string matching for realism.
        const d = new Date(o.date);
        if (d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()) {
            return sum + o.total;
        }
        return sum;
    }, 0);

    const currentProfit = currentRevenue * 0.45; // Approx 45% margin
    const currentExpenses = currentRevenue * 0.30; // Approx 30% overhead

    // Clone snapshots and update/append current month
    const data = [...financeSnapshots];
    const existingIdx = data.findIndex(d => d.month === currentMonthLabel);
    
    if (existingIdx >= 0) {
        // Replace/Merge with real data if we want to show live updates
        // For now, let's just assume the last snapshot IS the current month or we append.
        // Actually, let's just use the calculated values for the "KPI Cards" and use the chart for trends.
        // We'll update the chart data to include current month if it's new.
        if (data[existingIdx].revenue < currentRevenue) {
             data[existingIdx] = { ...data[existingIdx], revenue: currentRevenue, profit: currentProfit, expenses: currentExpenses };
        }
    } else {
        data.push({ month: currentMonthLabel, revenue: currentRevenue, profit: currentProfit, expenses: currentExpenses });
    }
    
    return data;
  }, [userOrders, financeSnapshots]);

  const currentMonth = financialData[financialData.length - 1] || { revenue: 0, profit: 0 };
  const prevMonth = financialData[financialData.length - 2] || { revenue: 0, profit: 0 };

  const revenueGrowth = prevMonth.revenue ? ((currentMonth.revenue - prevMonth.revenue) / prevMonth.revenue) * 100 : 0;
  const profitGrowth = prevMonth.profit ? ((currentMonth.profit - prevMonth.profit) / prevMonth.profit) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white">KI-Finanz-Suite</h2>
          <p className="text-gray-400">Echtzeit P&L, Steuern & Cashflow-Optimierung</p>
        </div>
        <div className="flex gap-4">
          <button className="px-4 py-2 bg-slate-800 text-white rounded-xl border border-slate-700 hover:bg-slate-700 transition-colors flex items-center gap-2">
            <Receipt className="w-4 h-4" />
            Export DATEV/Tax
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Bruttoumsatz', val: `€${currentMonth.revenue.toLocaleString('de-DE')}`, trend: `${revenueGrowth > 0 ? '+' : ''}${revenueGrowth.toFixed(1)}%`, up: revenueGrowth >= 0, icon: DollarSign, color: 'text-blue-400' },
          { label: 'Nettogewinn', val: `€${currentMonth.profit.toLocaleString('de-DE')}`, trend: `${profitGrowth > 0 ? '+' : ''}${profitGrowth.toFixed(1)}%`, up: profitGrowth >= 0, icon: Wallet, color: 'text-emerald-400' },
          { label: 'Ø Warenkorb', val: '€142,50', trend: '-2.1%', up: false, icon: PieChart, color: 'text-purple-400' },
          { label: 'Steuerrücklage', val: '€18.420', trend: 'Est. VAT/CIT', up: true, icon: Landmark, color: 'text-amber-400' }
        ].map((stat, i) => (
          <div key={i} className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2 rounded-xl bg-slate-800 ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div className={`flex items-center gap-1 text-xs font-bold ${stat.up ? 'text-emerald-400' : 'text-rose-400'}`}>
                {stat.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {stat.trend}
              </div>
            </div>
            <div className="text-gray-400 text-sm mb-1">{stat.label}</div>
            <div className="text-2xl font-bold text-white">{stat.val}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-900/50 border border-slate-800 rounded-3xl p-6">
          <h3 className="font-semibold text-white mb-8 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-400" />
            Umsatz vs. Gewinn (6 Monate)
          </h3>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={financialData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorProf" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="month" stroke="#64748b" axisLine={false} tickLine={false} />
                <YAxis stroke="#64748b" axisLine={false} tickLine={false} tickFormatter={(val) => `€${val/1000}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                  itemStyle={{ fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#6366f1" fillOpacity={1} fill="url(#colorRev)" strokeWidth={3} />
                <Area type="monotone" dataKey="profit" stroke="#10b981" fillOpacity={1} fill="url(#colorProf)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6">
            <h3 className="font-semibold text-white mb-6">Kostenstellen-Verteilung</h3>
            <div className="space-y-4">
              {[
                { label: 'Wareneinkauf (COGS)', val: 42, color: 'bg-blue-500' },
                { label: 'Marketing/Ads', val: 28, color: 'bg-indigo-500' },
                { label: 'Logistik/Storage', val: 12, color: 'bg-purple-500' },
                { label: 'KI-Infrastructure', val: 5, color: 'bg-emerald-500' },
                { label: 'Other', val: 13, color: 'bg-slate-700' }
              ].map(item => (
                <div key={item.label}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-gray-400">{item.label}</span>
                    <span className="text-white font-medium">{item.val}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${item.color}`} style={{ width: `${item.val}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-amber-500/10 border border-amber-500/20 rounded-3xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-amber-500/20 rounded-xl text-amber-400">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-white">Finanzielle Alerts</h3>
            </div>
            <div className="space-y-3">
              <p className="text-xs text-amber-200/70 leading-relaxed italic">
                "Der Cash-Burn für TikTok Ads ist um 14% gestiegen, während der ROAS leicht gesunken ist. Die KI empfiehlt eine Budget-Korrektur bis morgen 08:00 Uhr."
              </p>
              <button className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold rounded-xl transition-colors text-sm">
                Budget automatisch anpassen
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinanceCenter;
