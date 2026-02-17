import { useShopStore } from '../../store/shopStore';
import { Heart, PackageCheck, MapPin, UserCircle, DollarSign, Truck, Brain, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

interface AccountDashboardProps {
  onNavigate: (section: 'overview' | 'orders' | 'addresses' | 'profile') => void;
}

export function AccountDashboard({ onNavigate }: AccountDashboardProps) {
  const { userSession, userOrders, userAddresses, wishlist } = useShopStore();
  const profile = userSession.profile;

  const pointsToNextTier = 2500 - (profile?.loyaltyPoints ?? 0);
  const progress = ((profile?.loyaltyPoints ?? 0) / 2500) * 100;

  return (
    <div className="space-y-6">
      {/* Loyalty Card 2026 Edition */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-black text-white p-8 sm:p-10 shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/20 blur-[100px] rounded-full" />
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Nexus Member</span>
              </div>
              <h2 className="text-3xl font-black tracking-tight">{profile?.firstName} {profile?.lastName}</h2>
              <div className="mt-2 flex items-center gap-4">
                <span className="px-3 py-1 rounded-full bg-white/10 border border-white/10 text-[10px] font-black uppercase tracking-widest">
                   {profile?.loyaltyTier} Tier
                </span>
                <span className="text-[11px] font-medium text-white/60">Member since Feb 2026</span>
              </div>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-1">Total Points</p>
              <p className="text-4xl font-black tracking-tighter">{profile?.loyaltyPoints?.toLocaleString()}</p>
            </div>
          </div>

          <div className="space-y-5">
            <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-white/60">
               <div className="flex gap-4">
                 <span className={profile?.loyaltyTier === 'starter' ? 'text-indigo-400' : ''}>Starter</span>
                 <span className={profile?.loyaltyTier === 'plus' ? 'text-indigo-400' : ''}>Plus</span>
                 <span className={profile?.loyaltyTier === 'elite' ? 'text-indigo-400' : ''}>Elite</span>
               </div>
               <span>{pointsToNextTier > 0 ? `${pointsToNextTier.toLocaleString()} pts to next tier` : 'Elite Tier Reached'}</span>
            </div>
            <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
               <motion.div 
                 initial={{ width: 0 }}
                 animate={{ width: `${progress}%` }}
                 className="h-full bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.4)]"
                 transition={{ duration: 1.5, ease: "easeOut" }}
               />
            </div>
            <div className="flex gap-2">
               {['Cashback', 'Priority Support', 'Exclusive Access'].map((perk) => (
                 <span key={perk} className="px-2 py-0.5 rounded-md bg-white/[0.03] text-[9px] font-black uppercase tracking-widest text-white/30 border border-white/5">
                    {perk}
                 </span>
               ))}
            </div>
          </div>

          <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-4">
             {[
               { label: 'Cashback', val: '2.5%', icon: <DollarSign className="w-3.5 h-3.5" /> },
               { label: 'Shipping', val: 'Priority', icon: <Truck className="w-3.5 h-3.5" /> },
               { label: 'AI Concierge', val: 'Elite', icon: <Brain className="w-3.5 h-3.5" /> },
               { label: 'Drops', val: 'Early Access', icon: <Zap className="w-3.5 h-3.5" /> }
             ].map((benefit, i) => (
               <div key={i} className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-default">
                  <div className="text-indigo-400 mb-2">{benefit.icon}</div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">{benefit.label}</p>
                  <p className="text-xs font-bold">{benefit.val}</p>
               </div>
             ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <button onClick={() => onNavigate('orders')} className="surface border border-subtle rounded-[2rem] p-6 text-left hover:border-black dark:hover:border-white transition-all group shadow-sm hover:shadow-xl">
          <div className="flex items-center gap-2 text-muted group-hover:text-foreground transition-colors"><PackageCheck className="w-5 h-5" /> <span className="text-[10px] font-black uppercase tracking-widest">Orders</span></div>
          <p className="text-3xl font-black text-foreground mt-4">{userOrders.length}</p>
          <div className="mt-4 flex items-center gap-1 text-[10px] text-emerald-500 font-bold">
             <Zap className="w-3 h-3 fill-current" /> All processed
          </div>
        </button>
        <button onClick={() => onNavigate('addresses')} className="surface border border-subtle rounded-[2rem] p-6 text-left hover:border-black dark:hover:border-white transition-all group shadow-sm hover:shadow-xl">
          <div className="flex items-center gap-2 text-muted group-hover:text-foreground transition-colors"><MapPin className="w-5 h-5" /> <span className="text-[10px] font-black uppercase tracking-widest">Addresses</span></div>
          <p className="text-3xl font-black text-foreground mt-4">{userAddresses.length}</p>
          <p className="mt-4 text-[10px] text-muted font-bold uppercase tracking-wider">Manage book</p>
        </button>
        <button onClick={() => onNavigate('overview')} className="surface border border-subtle rounded-[2rem] p-6 text-left hover:border-black dark:hover:border-white transition-all group shadow-sm hover:shadow-xl">
          <div className="flex items-center gap-2 text-muted group-hover:text-foreground transition-colors"><Heart className="w-5 h-5" /> <span className="text-[10px] font-black uppercase tracking-widest">Wishlist</span></div>
          <p className="text-3xl font-black text-foreground mt-4">{wishlist.length}</p>
          <p className="mt-4 text-[10px] text-muted font-bold uppercase tracking-wider">View items</p>
        </button>
        <button onClick={() => onNavigate('profile')} className="surface border border-subtle rounded-[2rem] p-6 text-left hover:border-black dark:hover:border-white transition-all group shadow-sm hover:shadow-xl">
          <div className="flex items-center gap-2 text-muted group-hover:text-foreground transition-colors"><UserCircle className="w-5 h-5" /> <span className="text-[10px] font-black uppercase tracking-widest">Profile</span></div>
          <p className="text-3xl font-black text-foreground mt-4 truncate">Settings</p>
          <p className="mt-4 text-[10px] text-muted font-bold uppercase tracking-wider">Account security</p>
        </button>
      </div>
    </div>
  );
}
