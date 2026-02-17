import { ArrowRight, ShieldCheck } from 'lucide-react';

export function SmartFooterCTA() {
  return (
    <div className="surface border border-subtle rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <p className="text-sm font-semibold text-foreground">Need help choosing?</p>
        <p className="text-xs text-muted mt-1">Talk to the AI concierge for personalized picks and faster checkout.</p>
      </div>
      <button className="px-4 py-2 rounded-xl bg-foreground text-white text-xs font-semibold inline-flex items-center gap-2">
        Ask AI Concierge <ArrowRight className="w-4 h-4" />
      </button>
      <div className="flex items-center gap-2 text-[10px] text-muted">
        <ShieldCheck className="w-3 h-3" /> Buyer protection included
      </div>
    </div>
  );
}
