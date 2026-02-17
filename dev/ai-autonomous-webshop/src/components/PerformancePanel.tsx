import { Gauge, Clock, ShieldCheck } from 'lucide-react';

export function PerformancePanel() {
  return (
    <div className="surface border border-subtle rounded-2xl p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-black/5 dark:bg-white/[0.06]">
          <Gauge className="w-4 h-4 text-foreground" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">98/100 Store health</p>
          <p className="text-xs text-muted">Performance + integrity checks</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-black/5 dark:bg-white/[0.06]">
          <Clock className="w-4 h-4 text-foreground" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">0.4s avg load</p>
          <p className="text-xs text-muted">Global CDN optimization</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-black/5 dark:bg-white/[0.06]">
          <ShieldCheck className="w-4 h-4 text-foreground" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">Fraud shield active</p>
          <p className="text-xs text-muted">AI risk scoring on checkout</p>
        </div>
      </div>
    </div>
  );
}
