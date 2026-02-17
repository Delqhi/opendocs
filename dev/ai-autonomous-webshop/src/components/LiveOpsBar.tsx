import { useEffect, useState } from 'react';
import { Activity, ShieldCheck, Zap } from 'lucide-react';

export function LiveOpsBar() {
  const [orders, setOrders] = useState(1200);
  const [decisions, setDecisions] = useState(8200);

  useEffect(() => {
    const interval = setInterval(() => {
      setOrders((prev) => prev + Math.floor(Math.random() * 3));
      setDecisions((prev) => prev + Math.floor(Math.random() * 8));
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="surface border border-subtle rounded-2xl px-4 py-3 flex flex-wrap items-center gap-3 text-xs text-muted">
      <div className="flex items-center gap-2">
        <Activity className="w-3.5 h-3.5 text-emerald-500" />
        <span><b className="text-foreground">{orders.toLocaleString()}</b> orders today</span>
      </div>
      <span className="text-muted">•</span>
      <div className="flex items-center gap-2">
        <Zap className="w-3.5 h-3.5 text-blue-500" />
        <span><b className="text-foreground">{decisions.toLocaleString()}</b> AI decisions</span>
      </div>
      <span className="text-muted">•</span>
      <div className="flex items-center gap-2">
        <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
        <span>Buyer protection active</span>
      </div>
    </div>
  );
}
