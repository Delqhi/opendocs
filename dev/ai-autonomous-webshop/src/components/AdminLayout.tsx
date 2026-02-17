import { LogOut, LayoutDashboard, Brain, Truck, Building2, Megaphone, TrendingUp, Wallet, Layout, Boxes, Settings, Plug, Tag, UserCircle, Link2, Zap, Sparkles } from 'lucide-react';
import { useShopStore } from '../store/shopStore';
import { CommandPalette } from './CommandPalette';
import { Dashboard } from './Dashboard';
import { AICenter } from './AICenter';
import { OrderTracking } from './OrderTracking';
import { SupplierManagement } from './SupplierManagement';
import MarketingCenter from './MarketingCenter';
import ResearchLab from './ResearchLab';
import FinanceCenter from './FinanceCenter';
import LandingPageGenerator from './LandingPageGenerator';
import { AdminProducts } from './AdminProducts';
import { AdminSuppliers } from './AdminSuppliers';
import { AdminSettings } from './AdminSettings';
import { AdminIntegrations } from './AdminIntegrations';
import { AdminOrders } from './AdminOrders';
import { AdminCoupons } from './AdminCoupons';
import { AdminAffiliates } from './AdminAffiliates';
import { AdminProfile } from './AdminProfile';
import AdminOperations from './AdminOperations';
import { AdminAutomationRules } from './AdminAutomationRules';
import { AdminSupplierSuggestions } from './AdminSupplierSuggestions';

interface AdminLayoutProps {
  onLogout: () => void;
}

export function AdminLayout({ onLogout }: AdminLayoutProps) {
  const { currentView, setCurrentView } = useShopStore();

  const navItems = [
    { label: 'Dashboard', view: 'dashboard' as const, icon: LayoutDashboard },
    { label: 'AI Center', view: 'ai-center' as const, icon: Brain },
    // Ops / legacy tracking UI
    { label: 'Orders (Tracking UI)', view: 'orders' as const, icon: Truck },
    { label: 'Suppliers (Ops)', view: 'suppliers' as const, icon: Building2 },
    { label: 'Marketing', view: 'marketing' as const, icon: Megaphone },
    { label: 'Research', view: 'research' as const, icon: TrendingUp },
    { label: 'Finances', view: 'finances' as const, icon: Wallet },
    { label: 'Landing Pages', view: 'landing-pages' as const, icon: Layout },

    // Store management
    { label: 'Products', view: 'admin-products' as const, icon: Boxes },
    { label: 'Suppliers', view: 'admin-suppliers' as const, icon: Building2 },
    { label: 'Affiliate Networks', view: 'admin-affiliates' as const, icon: Link2 },
    { label: 'Coupons', view: 'admin-coupons' as const, icon: Tag },
    { label: 'Orders (Store)', view: 'admin-orders' as const, icon: Truck },
    { label: 'Admin Profile', view: 'admin-profile' as const, icon: UserCircle },

    { label: 'Settings', view: 'admin-settings' as const, icon: Settings },
    { label: 'Integrations', view: 'admin-integrations' as const, icon: Plug },
    { label: 'Operations', view: 'admin-operations' as const, icon: Truck },
    { label: 'Automation Rules', view: 'admin-automation-rules' as const, icon: Zap },
    { label: 'Supplier Suggestions', view: 'admin-supplier-suggestions' as const, icon: Sparkles },
    { label: 'Affiliate Networks', view: 'admin-affiliates' as const, icon: Link2 },
  ];

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'ai-center':
        return <AICenter />;
      case 'orders':
        return <OrderTracking />;
      case 'suppliers':
        return <SupplierManagement />;
      case 'marketing':
        return <MarketingCenter />;
      case 'research':
        return <ResearchLab />;
      case 'finances':
        return <FinanceCenter />;
      case 'landing-pages':
        return <LandingPageGenerator />;

      case 'admin-products':
        return <AdminProducts />;
      case 'admin-suppliers':
        return <AdminSuppliers />;
      case 'admin-orders':
        return <AdminOrders />;
      case 'admin-coupons':
        return <AdminCoupons />;
      case 'admin-affiliates':
        return <AdminAffiliates />;
      case 'admin-profile':
        return <AdminProfile />;
      case 'admin-settings':
        return <AdminSettings />;
      case 'admin-integrations':
        return <AdminIntegrations />;
      case 'admin-operations':
        return <AdminOperations />;
      case 'admin-automation-rules':
        return <AdminAutomationRules />;
      case 'admin-supplier-suggestions':
        return <AdminSupplierSuggestions />;

      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-dark-900 text-white">
      <div className="flex">
        <aside className="hidden lg:flex w-64 shrink-0 border-r border-white/[0.06] min-h-screen p-4 flex-col">
          <div className="text-lg font-semibold text-white mb-6">NEXUS Admin</div>
          <nav className="space-y-1 flex-1">
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => setCurrentView(item.view)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                  currentView === item.view
                    ? 'bg-white/10 text-white'
                    : 'text-gray-500 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </button>
            ))}
          </nav>
          <button
            onClick={onLogout}
            className="mt-6 flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-white/[0.04]"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </aside>

        <div className="flex-1 min-w-0">
          <header className="sticky top-0 z-20 border-b border-white/[0.06] bg-dark-900/95 backdrop-blur-xl">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
              <div className="text-sm text-gray-400">Admin Console</div>
              <div className="flex items-center gap-3">
                <CommandPalette isAdmin={true} onNavigate={(view) => setCurrentView(view as Parameters<typeof setCurrentView>[0])} />
                <button
                  onClick={onLogout}
                  className="lg:hidden flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-gray-300 border border-white/[0.06]"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            </div>
          </header>

          <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
            {renderView()}
          </main>
        </div>
      </div>
    </div>
  );
}
