import { ShieldCheck, Truck, RotateCcw, Headphones } from 'lucide-react';

export function GlobalTrustBar() {
  return (
    <div className="surface border border-subtle rounded-2xl p-4 sm:p-5 grid grid-cols-2 lg:grid-cols-4 gap-3">
      {[
        { icon: <Truck className="w-4 h-4" />, title: 'Global Delivery', text: 'Tracked shipping in 120+ countries' },
        { icon: <ShieldCheck className="w-4 h-4" />, title: 'Buyer Protection', text: 'Full refund if not as described' },
        { icon: <RotateCcw className="w-4 h-4" />, title: '30-Day Returns', text: 'Free returns, no questions asked' },
        { icon: <Headphones className="w-4 h-4" />, title: '24/7 Support', text: 'Priority AI + human fallback' },
      ].map((item) => (
        <div key={item.title} className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-black/5 dark:bg-white/[0.06] text-foreground">
            {item.icon}
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">{item.title}</p>
            <p className="text-xs text-muted">{item.text}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
