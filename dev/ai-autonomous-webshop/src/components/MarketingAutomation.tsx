import { Mail, Instagram, Facebook, TrendingUp, DollarSign, Users, Eye, Zap, Brain, Play, Pause, Target, Sparkles, Bell, Send } from 'lucide-react';
import { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface Campaign {
  id: string;
  name: string;
  platform: 'instagram' | 'facebook' | 'email' | 'tiktok';
  status: 'active' | 'paused' | 'scheduled';
  budget: number;
  spent: number;
  impressions: number;
  clicks: number;
  conversions: number;
  roas: number;
  aiOptimized: boolean;
  startDate: string;
}

const campaigns: Campaign[] = [
  { id: 'camp-1', name: 'Holiday Sale 2024', platform: 'instagram', status: 'active', budget: 5000, spent: 3247, impressions: 284500, clicks: 8432, conversions: 342, roas: 4.2, aiOptimized: true, startDate: '10.01.2024' },
  { id: 'camp-2', name: 'New Year Promo', platform: 'facebook', status: 'active', budget: 3000, spent: 1856, impressions: 156000, clicks: 4521, conversions: 189, roas: 3.8, aiOptimized: true, startDate: '01.01.2024' },
  { id: 'camp-3', name: 'Wearables Launch', platform: 'tiktok', status: 'active', budget: 4000, spent: 2134, impressions: 892000, clicks: 12845, conversions: 278, roas: 5.1, aiOptimized: true, startDate: '05.01.2024' },
  { id: 'camp-4', name: 'Newsletter Woche 3', platform: 'email', status: 'active', budget: 500, spent: 234, impressions: 45000, clicks: 3421, conversions: 156, roas: 8.2, aiOptimized: true, startDate: '15.01.2024' },
  { id: 'camp-5', name: 'Flash Sale Feb', platform: 'instagram', status: 'scheduled', budget: 2000, spent: 0, impressions: 0, clicks: 0, conversions: 0, roas: 0, aiOptimized: true, startDate: '01.02.2024' },
];

const performanceData = [
  { day: 'Mo', impressions: 42000, clicks: 1240, conversions: 52 },
  { day: 'Di', impressions: 58000, clicks: 1680, conversions: 71 },
  { day: 'Mi', impressions: 51000, clicks: 1420, conversions: 63 },
  { day: 'Do', impressions: 72000, clicks: 2150, conversions: 89 },
  { day: 'Fr', impressions: 85000, clicks: 2580, conversions: 112 },
  { day: 'Sa', impressions: 98000, clicks: 3120, conversions: 134 },
  { day: 'So', impressions: 76000, clicks: 2340, conversions: 98 },
];

const audienceData = [
  { age: '18-24', male: 23, female: 31 },
  { age: '25-34', male: 35, female: 42 },
  { age: '35-44', male: 28, female: 24 },
  { age: '45-54', male: 15, female: 12 },
  { age: '55+', male: 8, female: 6 },
];

const emailTemplates = [
  { name: 'Willkommens-Serie', sent: 12450, openRate: 68, clickRate: 24, revenue: 8420 },
  { name: 'Warenkorbabbruch', sent: 3240, openRate: 52, clickRate: 18, revenue: 12340 },
  { name: 'Produktempfehlung', sent: 8900, openRate: 45, clickRate: 15, revenue: 6780 },
  { name: 'Win-Back Kampagne', sent: 2100, openRate: 38, clickRate: 12, revenue: 3450 },
];

export function MarketingAutomation() {
  const [activeTab, setActiveTab] = useState<'campaigns' | 'email' | 'analytics'>('campaigns');
  const [aiGenerating, setAiGenerating] = useState(false);

  const totalSpent = campaigns.reduce((sum, c) => sum + c.spent, 0);
  const totalConversions = campaigns.reduce((sum, c) => sum + c.conversions, 0);
  const avgROAS = campaigns.filter(c => c.roas > 0).reduce((sum, c) => sum + c.roas, 0) / campaigns.filter(c => c.roas > 0).length;

  const platformIcons: Record<string, React.ReactNode> = {
    instagram: <Instagram className="w-4 h-4" />,
    facebook: <Facebook className="w-4 h-4" />,
    email: <Mail className="w-4 h-4" />,
    tiktok: <span className="text-sm">🎵</span>,
  };

  const platformColors: Record<string, string> = {
    instagram: 'from-pink-500 to-purple-500',
    facebook: 'from-blue-500 to-blue-600',
    email: 'from-green-500 to-emerald-500',
    tiktok: 'from-gray-800 to-black',
  };

  const handleGenerateCampaign = () => {
    setAiGenerating(true);
    setTimeout(() => setAiGenerating(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <Target className="w-7 h-7 text-primary-400" />
            Marketing Automation
          </h2>
          <p className="text-sm text-gray-500 mt-1">KI-gesteuerte Kampagnen auf allen Kanälen</p>
        </div>
        <button
          onClick={handleGenerateCampaign}
          disabled={aiGenerating}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-primary-500 to-accent-500 text-white text-sm font-medium hover:shadow-lg hover:shadow-primary-500/25 transition-all disabled:opacity-50"
        >
          {aiGenerating ? (
            <>
              <Sparkles className="w-4 h-4 animate-spin" />
              KI generiert...
            </>
          ) : (
            <>
              <Brain className="w-4 h-4" />
              KI-Kampagne erstellen
            </>
          )}
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-xl bg-primary-500/20">
              <DollarSign className="w-5 h-5 text-primary-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white">€{(totalSpent / 1000).toFixed(1)}k</p>
          <p className="text-xs text-gray-500 mt-1">Werbeausgaben</p>
        </div>
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-xl bg-accent-500/20">
              <Users className="w-5 h-5 text-accent-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white">{totalConversions.toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-1">Conversions</p>
        </div>
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-xl bg-yellow-500/20">
              <TrendingUp className="w-5 h-5 text-yellow-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white">{avgROAS.toFixed(1)}x</p>
          <p className="text-xs text-gray-500 mt-1">Ø ROAS</p>
        </div>
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-xl bg-blue-500/20">
              <Eye className="w-5 h-5 text-blue-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white">1.4M</p>
          <p className="text-xs text-gray-500 mt-1">Impressions</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setActiveTab('campaigns')}
          className={`px-5 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
            activeTab === 'campaigns' ? 'bg-primary-500/20 text-primary-300 border border-primary-500/30' : 'bg-white/5 text-gray-400 hover:text-white'
          }`}
        >
          Kampagnen
        </button>
        <button
          onClick={() => setActiveTab('email')}
          className={`px-5 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
            activeTab === 'email' ? 'bg-primary-500/20 text-primary-300 border border-primary-500/30' : 'bg-white/5 text-gray-400 hover:text-white'
          }`}
        >
          E-Mail Automation
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-5 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
            activeTab === 'analytics' ? 'bg-primary-500/20 text-primary-300 border border-primary-500/30' : 'bg-white/5 text-gray-400 hover:text-white'
          }`}
        >
          Analytics
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'campaigns' && (
        <div className="space-y-4">
          {campaigns.map((campaign, i) => (
            <div key={campaign.id} className="glass rounded-2xl p-5 hover:border-primary-500/20 transition-all animate-slide-up" style={{ animationDelay: `${i * 60}ms` }}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl bg-gradient-to-br ${platformColors[campaign.platform]} text-white`}>
                    {platformIcons[campaign.platform]}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                      {campaign.name}
                      {campaign.aiOptimized && <Zap className="w-3 h-3 text-primary-400" />}
                    </h4>
                    <p className="text-xs text-gray-500">Gestartet: {campaign.startDate}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                    campaign.status === 'active' ? 'bg-accent-500/20 text-accent-400' :
                    campaign.status === 'scheduled' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>
                    {campaign.status === 'active' ? 'Aktiv' : campaign.status === 'scheduled' ? 'Geplant' : 'Pausiert'}
                  </span>
                  <button className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400">
                    {campaign.status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <div className="p-3 rounded-xl bg-white/5 text-center">
                  <p className="text-xs text-gray-500">Budget</p>
                  <p className="text-sm text-white font-medium">€{campaign.budget.toLocaleString()}</p>
                  <div className="mt-1 h-1 bg-dark-600 rounded-full">
                    <div className="h-full bg-primary-500 rounded-full" style={{ width: `${(campaign.spent / campaign.budget) * 100}%` }} />
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-white/5 text-center">
                  <p className="text-xs text-gray-500">Impressions</p>
                  <p className="text-sm text-white font-medium">{(campaign.impressions / 1000).toFixed(0)}k</p>
                </div>
                <div className="p-3 rounded-xl bg-white/5 text-center">
                  <p className="text-xs text-gray-500">Klicks</p>
                  <p className="text-sm text-white font-medium">{campaign.clicks.toLocaleString()}</p>
                </div>
                <div className="p-3 rounded-xl bg-white/5 text-center">
                  <p className="text-xs text-gray-500">Conversions</p>
                  <p className="text-sm text-white font-medium">{campaign.conversions}</p>
                </div>
                <div className="p-3 rounded-xl bg-accent-500/10 text-center border border-accent-500/20">
                  <p className="text-xs text-gray-500">ROAS</p>
                  <p className="text-sm text-accent-400 font-bold">{campaign.roas}x</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'email' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Email Templates */}
          <div className="glass rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <Mail className="w-4 h-4 text-primary-400" />
              Automatisierte E-Mail Flows
            </h3>
            <div className="space-y-3">
              {emailTemplates.map((template, i) => (
                <div key={i} className="p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm text-white font-medium">{template.name}</h4>
                    <div className="flex items-center gap-1 px-2 py-0.5 bg-accent-500/20 rounded">
                      <Zap className="w-3 h-3 text-accent-400" />
                      <span className="text-[10px] text-accent-400">KI-optimiert</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-center">
                    <div>
                      <p className="text-xs text-gray-500">Gesendet</p>
                      <p className="text-xs text-white font-medium">{(template.sent / 1000).toFixed(1)}k</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Öffnungsrate</p>
                      <p className="text-xs text-white font-medium">{template.openRate}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Klickrate</p>
                      <p className="text-xs text-white font-medium">{template.clickRate}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Umsatz</p>
                      <p className="text-xs text-accent-400 font-medium">€{(template.revenue / 1000).toFixed(1)}k</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Email Stats */}
          <div className="space-y-6">
            <div className="glass rounded-2xl p-6">
              <h3 className="text-sm font-semibold text-white mb-4">Newsletter Performance</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-white/5 text-center">
                  <Send className="w-6 h-6 text-primary-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">26.7k</p>
                  <p className="text-xs text-gray-500">E-Mails gesendet</p>
                </div>
                <div className="p-4 rounded-xl bg-white/5 text-center">
                  <Bell className="w-6 h-6 text-accent-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">52%</p>
                  <p className="text-xs text-gray-500">Ø Öffnungsrate</p>
                </div>
              </div>
            </div>

            <div className="glass rounded-2xl p-6 border border-primary-500/20 bg-gradient-to-r from-primary-500/5 to-transparent">
              <div className="flex items-center gap-3 mb-3">
                <Brain className="w-5 h-5 text-primary-400" />
                <h4 className="text-sm font-semibold text-white">KI-Personalisierung</h4>
              </div>
              <p className="text-xs text-gray-400 mb-3">
                Die KI analysiert Kundenverhalten und personalisiert automatisch Betreffzeilen, 
                Versandzeiten und Produktempfehlungen für jeden Empfänger.
              </p>
              <div className="flex items-center gap-2 text-xs text-accent-400">
                <Sparkles className="w-3 h-3" />
                <span>+34% höhere Conversion durch KI-Personalisierung</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Performance Chart */}
          <div className="glass rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-white mb-4">Wöchentliche Performance</h3>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={performanceData}>
                <defs>
                  <linearGradient id="colorImpressions" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="day" stroke="#555" fontSize={12} />
                <YAxis stroke="#555" fontSize={12} />
                <Tooltip contentStyle={{ background: '#1a1a3e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', fontSize: '12px' }} />
                <Area type="monotone" dataKey="impressions" stroke="#6366f1" fillOpacity={1} fill="url(#colorImpressions)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Audience Demographics */}
          <div className="glass rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-white mb-4">Zielgruppen-Demografie</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={audienceData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis type="number" stroke="#555" fontSize={12} />
                <YAxis type="category" dataKey="age" stroke="#555" fontSize={12} />
                <Tooltip contentStyle={{ background: '#1a1a3e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', fontSize: '12px' }} />
                <Bar dataKey="male" fill="#6366f1" name="Männlich" />
                <Bar dataKey="female" fill="#10b981" name="Weiblich" />
              </BarChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-primary-500" />
                <span className="text-xs text-gray-400">Männlich</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-accent-500" />
                <span className="text-xs text-gray-400">Weiblich</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
