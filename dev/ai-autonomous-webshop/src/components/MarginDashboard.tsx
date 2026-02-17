import { useState, useEffect, useMemo } from 'react';
import { 
  TrendingUp, TrendingDown, DollarSign, Zap, Brain, 
  ArrowRight, CheckCircle, Loader2, AlertCircle, ChevronRight 
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts';

interface MarginAnalysis {
  id: number;
  product_id: number;
  product_name: string;
  current_price: number;
  cost_price: number;
  current_margin: number;
  projected_margin: number;
  suggested_price: number;
  price_change: number;
  reason: string;
  confidence: number;
  trend_score: number;
  sales_velocity: number;
  stock_level: number;
  demand_level: string;
  analysis_source: string;
  is_applied: boolean;
}

interface MarginSummary {
  total_products: number;
  avg_current_margin: number;
  avg_projected_margin: number;
  total_revenue: number;
  projected_revenue: number;
  potential_gain: number;
  high_opportunity: number;
  medium_opportunity: number;
  low_opportunity: number;
}

interface ApplyResponse {
  success: boolean;
  product_id: number;
  old_price: number;
  new_price: number;
  margin_before: number;
  margin_after: number;
  message: string;
}

const COLORS = {
  high: '#10b981',
  medium: '#f59e0b',
  low: '#ef4444',
  primary: '#6366f1',
  accent: '#8b5cf6',
};

export function MarginDashboard() {
  const [analyses, setAnalyses] = useState<MarginAnalysis[]>([]);
  const [summary, setSummary] = useState<MarginSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState<number | null>(null);
  const [useOllama, setUseOllama] = useState(false);
  const [appliedIds, setAppliedIds] = useState<Set<number>>(new Set());
  const [error, setError] = useState<string | null>(null);

  const fetchAnalysis = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/v1/admin/margin?limit=20&ollama=${useOllama}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!res.ok) throw new Error('Failed to fetch margin analysis');
      const data = await res.json();
      setAnalyses(data.analyses || []);
      setSummary(data.summary);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalysis();
  }, [useOllama]);

  const applyPriceChange = async (analysisId: number) => {
    setApplying(analysisId);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/v1/admin/margin/apply', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ analysis_id: analysisId }),
      });
      const data: ApplyResponse = await res.json();
      if (data.success) {
        setAppliedIds(prev => new Set([...prev, analysisId]));
        await fetchAnalysis();
      }
    } catch (err) {
      console.error('Failed to apply price change:', err);
    } finally {
      setApplying(null);
    }
  };

  const chartData = useMemo(() => {
    return analyses.slice(0, 10).map(a => ({
      name: a.product_name.substring(0, 15) + (a.product_name.length > 15 ? '...' : ''),
      current: a.current_margin,
      projected: a.projected_margin,
      change: a.price_change,
    }));
  }, [analyses]);

  const opportunityData = useMemo(() => {
    if (!summary) return [];
    return [
      { name: 'High', value: summary.high_opportunity, color: COLORS.high },
      { name: 'Medium', value: summary.medium_opportunity, color: COLORS.medium },
      { name: 'Low', value: summary.low_opportunity, color: COLORS.low },
    ];
  }, [summary]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass rounded-2xl p-6">
        <div className="flex items-center gap-3 text-red-400">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Margin Optimization</h2>
          <p className="text-sm text-gray-500 mt-1">AI-driven price optimization dashboard</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setUseOllama(!useOllama)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${
              useOllama 
                ? 'bg-accent-500/20 border-accent-500/30 text-accent-300' 
                : 'bg-white/5 border-white/10 text-gray-400'
            }`}
          >
            <Brain className="w-4 h-4" />
            <span className="text-sm font-medium">{useOllama ? 'Ollama AI' : 'Heuristic'}</span>
          </button>
          <button
            onClick={fetchAnalysis}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-500/20 border border-primary-500/30 text-primary-300 hover:bg-primary-500/30 transition-all"
          >
            <Zap className="w-4 h-4" />
            <span className="text-sm font-medium">Refresh</span>
          </button>
        </div>
      </div>

      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard 
            icon={<DollarSign className="w-5 h-5" />}
            label="Avg Current Margin"
            value={`${summary.avg_current_margin.toFixed(1)}%`}
            subValue={null}
            color="primary"
          />
          <KPICard 
            icon={<TrendingUp className="w-5 h-5" />}
            label="Projected Margin"
            value={`${summary.avg_projected_margin.toFixed(1)}%`}
            subValue={`+${(summary.avg_projected_margin - summary.avg_current_margin).toFixed(1)}%`}
            color="accent"
          />
          <KPICard 
            icon={<DollarSign className="w-5 h-5" />}
            label="Potential Gain"
            value={`€${summary.potential_gain.toLocaleString('de-DE', { minimumFractionDigits: 2 })}`}
            subValue={null}
            color="green"
          />
          <KPICard 
            icon={<Zap className="w-5 h-5" />}
            label="High Opportunities"
            value={String(summary.high_opportunity)}
            subValue="products"
            color="yellow"
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-semibold text-white">Margin Comparison</h3>
              <p className="text-xs text-gray-500 mt-1">Current vs Projected by Product</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={true} vertical={false} />
              <XAxis type="number" stroke="#555" fontSize={12} tickFormatter={(v) => `${v}%`} />
              <YAxis type="category" dataKey="name" stroke="#555" fontSize={11} width={100} />
              <Tooltip 
                contentStyle={{ background: '#1a1a3e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                formatter={(value: number) => [`${value.toFixed(1)}%`, '']}
              />
              <Bar dataKey="current" fill="#6366f1" radius={[0, 4, 4, 0]} name="Current" />
              <Bar dataKey="projected" fill="#10b981" radius={[0, 4, 4, 0]} name="Projected" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="glass rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-white mb-2">Opportunity Distribution</h3>
          <p className="text-xs text-gray-500 mb-4">Price optimization potential</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={opportunityData}>
              <XAxis dataKey="name" stroke="#555" fontSize={12} />
              <YAxis stroke="#555" fontSize={12} />
              <Tooltip 
                contentStyle={{ background: '#1a1a3e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {opportunityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-4">
            {opportunityData.map(opp => (
              <div key={opp.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: opp.color }} />
                  <span className="text-gray-400">{opp.name} Priority</span>
                </div>
                <span className="text-gray-300 font-medium">{opp.value} products</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="glass rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-white mb-4">Price Optimization Suggestions</h3>
        <div className="space-y-3">
          {analyses.filter(a => !a.is_applied).slice(0, 8).map(analysis => (
            <div 
              key={analysis.id}
              className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-white truncate">{analysis.product_name}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                    analysis.demand_level === 'high' ? 'bg-green-500/20 text-green-400' :
                    analysis.demand_level === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {analysis.demand_level} demand
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1 line-clamp-1">{analysis.reason}</p>
                <div className="flex items-center gap-4 mt-2 text-xs">
                  <span className="text-gray-400">
                    Current: <span className="text-white font-medium">€{analysis.current_price.toFixed(2)}</span>
                  </span>
                  <ArrowRight className="w-3 h-3 text-gray-600" />
                  <span className="text-gray-400">
                    Suggested: <span className="text-accent-400 font-medium">€{analysis.suggested_price.toFixed(2)}</span>
                  </span>
                  <span className={`flex items-center gap-1 ${
                    analysis.price_change > 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {analysis.price_change > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {Math.abs(analysis.price_change).toFixed(1)}%
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3 ml-4">
                <div className="text-right">
                  <div className="text-xs text-gray-500">Confidence</div>
                  <div className="text-sm font-medium text-white">{(analysis.confidence * 100).toFixed(0)}%</div>
                </div>
                <button
                  onClick={() => applyPriceChange(analysis.id)}
                  disabled={applying === analysis.id}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent-500 hover:bg-accent-600 text-white text-sm font-medium transition-colors disabled:opacity-50"
                >
                  {applying === analysis.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : appliedIds.has(analysis.id) ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Applied
                    </>
                  ) : (
                    <>
                      Apply
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {analyses.filter(a => a.is_applied).length > 0 && (
        <div className="glass rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-400" />
            Applied Price Changes
          </h3>
          <div className="space-y-2">
            {analyses.filter(a => a.is_applied).slice(0, 5).map(analysis => (
              <div 
                key={analysis.id}
                className="flex items-center justify-between p-3 rounded-lg bg-green-500/5 border border-green-500/10"
              >
                <div>
                  <span className="text-sm text-white">{analysis.product_name}</span>
                  <div className="text-xs text-gray-500 mt-0.5">
                    €{analysis.current_price.toFixed(2)} → €{analysis.suggested_price.toFixed(2)} 
                    <span className="text-green-400 ml-2">+{analysis.price_change.toFixed(1)}%</span>
                  </div>
                </div>
                <CheckCircle className="w-4 h-4 text-green-400" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function KPICard({ 
  icon, 
  label, 
  value, 
  subValue, 
  color 
}: { 
  icon: React.ReactNode; 
  label: string; 
  value: string; 
  subValue: string | null;
  color: string; 
}) {
  const colors: Record<string, string> = {
    primary: 'from-primary-500/20 to-primary-500/5 border-primary-500/20 text-primary-400',
    accent: 'from-accent-500/20 to-accent-500/5 border-accent-500/20 text-accent-400',
    yellow: 'from-yellow-500/20 to-yellow-500/5 border-yellow-500/20 text-yellow-400',
    green: 'from-green-500/20 to-green-500/5 border-green-500/20 text-green-400',
  };

  return (
    <div className={`glass rounded-2xl p-5 bg-gradient-to-br ${colors[color]} border`}>
      <div className="flex items-center justify-between mb-3">
        <div className="p-2 rounded-xl bg-white/5">{icon}</div>
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      {subValue && <p className="text-xs text-accent-400 mt-1">{subValue}</p>}
      <p className="text-xs text-gray-500 mt-1">{label}</p>
    </div>
  );
}
