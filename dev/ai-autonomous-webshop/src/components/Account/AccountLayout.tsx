import { useState } from 'react';
import { useShopStore } from '../../store/shopStore';
import { AccountDashboard } from './AccountDashboard';
import { AccountOrders } from './AccountOrders';
import { AccountAddresses } from './AccountAddresses';
import { AccountProfile } from './AccountProfile';
import { LogOut } from 'lucide-react';

interface AccountLayoutProps {
  onLogout: () => void;
}

export function AccountLayout({ onLogout }: AccountLayoutProps) {
  const { userSession } = useShopStore();
  const [section, setSection] = useState<'overview' | 'orders' | 'addresses' | 'profile'>('overview');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Account</h2>
          <p className="text-xs text-muted">Manage your orders, addresses and profile</p>
        </div>
        {userSession.loggedIn && (
          <button onClick={onLogout} className="flex items-center gap-2 text-xs text-muted hover:text-foreground">
            <LogOut className="w-4 h-4" /> Log out
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2 text-xs">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'orders', label: 'Orders' },
          { id: 'addresses', label: 'Addresses' },
          { id: 'profile', label: 'Profile' },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setSection(item.id as typeof section)}
            className={`px-3 py-2 rounded-full border transition-all ${
              section === item.id ? 'bg-foreground text-white border-foreground' : 'border-subtle text-muted hover:text-foreground'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {section === 'overview' && <AccountDashboard onNavigate={setSection} />}
      {section === 'orders' && <AccountOrders />}
      {section === 'addresses' && <AccountAddresses />}
      {section === 'profile' && <AccountProfile />}
    </div>
  );
}
