import { Home, Search, ShoppingBag, Heart, User } from 'lucide-react';
import { useShopStore } from '../store/shopStore';

export function MobileBottomNav() {
  const { cart, wishlist, setCurrentView, setShopMode, currentView } = useShopStore();
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const wishlistCount = wishlist.length;

  const isAccount = currentView === 'account';

  const openSearch = () => {
    window.dispatchEvent(new CustomEvent('open-command-palette'));
  };

  return (
    <div className="sm:hidden fixed inset-x-0 bottom-0 z-[70] safe-bottom">
      <div className="mx-3 mb-3 rounded-2xl border border-subtle surface-elev">
        <div className="grid grid-cols-5">
          <Tab
            label="Home"
            active={!isAccount}
            onClick={() => {
              setCurrentView('shop');
              setShopMode('browse');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            icon={<Home className="w-5 h-5" />}
          />

          <Tab label="Search" onClick={openSearch} icon={<Search className="w-5 h-5" />} />

          <Tab
            label="Cart"
            onClick={() => window.dispatchEvent(new CustomEvent('toggle-mobile-cart'))}
            icon={<ShoppingBag className="w-5 h-5" />}
            badge={cartCount}
          />

          <Tab
            label="Saved"
            onClick={() => {
              setCurrentView('shop');
              setShopMode('wishlist');
            }}
            icon={<Heart className="w-5 h-5" />}
            badge={wishlistCount}
          />

          <Tab
            label="Account"
            active={isAccount}
            onClick={() => setCurrentView('account')}
            icon={<User className="w-5 h-5" />}
          />
        </div>
      </div>
    </div>
  );
}

function Tab({
  label,
  icon,
  onClick,
  badge,
  active,
}: {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  badge?: number;
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative py-3 flex flex-col items-center justify-center gap-1 text-[10px] transition-colors ${
        active ? 'text-foreground' : 'text-muted'
      }`}
      aria-label={label}
    >
      <span className="relative">
        {icon}
        {badge !== undefined && badge > 0 && (
          <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-foreground text-white text-[10px] font-bold flex items-center justify-center">
            {badge > 99 ? '99+' : badge}
          </span>
        )}
      </span>
      <span>{label}</span>
    </button>
  );
}
