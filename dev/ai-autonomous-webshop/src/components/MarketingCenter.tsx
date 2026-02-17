import { useState } from 'react';
import { useShopStore, type Campaign } from '../store/shopStore';
import { Users, Share2, TrendingUp, Sparkles, Play, Plus, Pause, Mail, Trash2 } from 'lucide-react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const performanceData = [
  { name: 'Mo', reach: 4000, conv: 240 },
  { name: 'Di', reach: 3000, conv: 198 },
  { name: 'Mi', reach: 2000, conv: 150 },
  { name: 'Do', reach: 2780, conv: 210 },
  { name: 'Fr', reach: 1890, conv: 180 },
  { name: 'Sa', reach: 2390, conv: 250 },
  { name: 'So', reach: 3490, conv: 310 },
];

export default function MarketingCenter() {
  const { campaigns, addCampaign, deleteCampaign, updateCampaign, influencers } = useShopStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'campaigns' | 'influencers'>('overview');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCampaign, setNewCampaign] = useState<Partial<Campaign>>({
    name: '', platform: 'instagram', budget: 1000, status: 'active', aiOptimized: true
  });

  const handleAddCampaign = () => {
    if (!newCampaign.name) return;
    addCampaign({
      id: `camp-${Date.now()}`,
      name: newCampaign.name,
      platform: newCampaign.platform as any || 'instagram',
      status: newCampaign.status as any || 'active',
      budget: Number(newCampaign.budget),
      spent: 0,
      impressions: 0,
      clicks: 0,
      conversions: 0,
      roas: 0,
      aiOptimized: !!newCampaign.aiOptimized,
      startDate: new Date().toLocaleDateString(),
    });
    setShowAddModal(false);
    setNewCampaign({ name: '', platform: 'instagram', budget: 1000, status: 'active', aiOptimized: true });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white">Marketing Center</h2>
          <p className="text-gray-400">AI-driven campaigns & influencer management</p>
        </div>
        <div className="flex gap-2">
          {['overview', 'campaigns', 'influencers'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                activeTab === tab ? 'bg-indigo-500 text-white' : 'bg-white/5 text-gray-400 hover:text-white'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-slate-900/50 border border-slate-800 rounded-3xl p-6">
            <h3 className="font-semibold text-white mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-400" /> Performance Overview
            </h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={performanceData}>
                  <defs>
                    <linearGradient id="colorReach" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="name" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b' }} />
                  <Area type="monotone" dataKey="reach" stroke="#6366f1" fillOpacity={1} fill="url(#colorReach)" />
                  <Area type="monotone" dataKey="conv" stroke="#10b981" fillOpacity={1} fill="#10b981" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="space-y-4">
            <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6">
              <h3 className="text-sm font-medium text-gray-400">Total Spend</h3>
              <p className="text-2xl font-bold text-white mt-1">€12,450</p>
              <div className="mt-4 flex items-center gap-2 text-xs text-emerald-400">
                <TrendingUp className="w-3 h-3" /> +12% vs last month
              </div>
            </div>
            <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6">
              <h3 className="text-sm font-medium text-gray-400">Avg. ROAS</h3>
              <p className="text-2xl font-bold text-white mt-1">4.8x</p>
              <div className="mt-4 flex items-center gap-2 text-xs text-emerald-400">
                <Sparkles className="w-3 h-3" /> AI Optimized
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'campaigns' && (
        <div className="space-y-6">
          <div className="flex justify-end">
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-medium"
            >
              <Plus className="w-4 h-4" /> New Campaign
            </button>
          </div>

          {showAddModal && (
            <div className="glass p-6 rounded-2xl border border-white/10 animate-fade-in">
              <h3 className="text-lg font-bold text-white mb-4">Create Campaign</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <input
                  className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white"
                  placeholder="Campaign Name"
                  value={newCampaign.name}
                  onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
                />
                <select
                  className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white"
                  value={newCampaign.platform}
                  onChange={(e) => setNewCampaign({ ...newCampaign, platform: e.target.value as any })}
                >
                  <option value="instagram">Instagram</option>
                  <option value="facebook">Facebook</option>
                  <option value="tiktok">TikTok</option>
                  <option value="email">Email</option>
                </select>
                <input
                  type="number"
                  className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white"
                  placeholder="Budget"
                  value={newCampaign.budget}
                  onChange={(e) => setNewCampaign({ ...newCampaign, budget: Number(e.target.value) })}
                />
                <button onClick={handleAddCampaign} className="bg-white text-black font-bold rounded-xl">Launch</button>
              </div>
            </div>
          )}

          <div className="grid gap-4">
            {campaigns.map((camp) => (
              <div key={camp.id} className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${camp.platform === 'instagram' ? 'bg-pink-500/20 text-pink-400' : camp.platform === 'facebook' ? 'bg-blue-500/20 text-blue-400' : 'bg-white/10 text-white'}`}>
                    {camp.platform === 'instagram' ? <Users className="w-5 h-5" /> : camp.platform === 'email' ? <Mail className="w-5 h-5" /> : <Share2 className="w-5 h-5" />}
                  </div>
                  <div>
                    <h4 className="font-bold text-white">{camp.name}</h4>
                    <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                      <span>{camp.status.toUpperCase()}</span>
                      <span>•</span>
                      <span>Budget: €{camp.budget}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-8 text-center">
                  <div>
                    <div className="text-xs text-gray-500">Spent</div>
                    <div className="text-sm font-bold text-white">€{camp.spent}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">ROAS</div>
                    <div className="text-sm font-bold text-emerald-400">{camp.roas}x</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Conv.</div>
                    <div className="text-sm font-bold text-white">{camp.conversions}</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => updateCampaign(camp.id, { status: camp.status === 'active' ? 'paused' : 'active' })} className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white">
                    {camp.status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </button>
                  <button onClick={() => deleteCampaign(camp.id)} className="p-2 hover:bg-red-500/20 rounded-lg text-gray-400 hover:text-red-400">
                    <Trash2 className="w-4 h-4" /> 
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'influencers' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {influencers.map((inf) => (
            <div key={inf.id} className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <img src={inf.avatar} alt="" className="w-12 h-12 rounded-full border-2 border-indigo-500/50" />
                <div>
                  <h4 className="font-bold text-white">{inf.name}</h4>
                  <p className="text-xs text-gray-400">{inf.platform} • {inf.followers.toLocaleString()} Followers</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-emerald-400">ROI: {inf.roi}%</div>
                <div className="text-xs text-gray-500">{inf.status}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
