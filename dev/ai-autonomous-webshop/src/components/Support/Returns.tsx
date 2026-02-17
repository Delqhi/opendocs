import { RotateCcw, ShieldCheck, CalendarDays } from 'lucide-react';
import { SupportPageShell } from './SupportPageShell';

export function SupportReturns() {
  return (
    <SupportPageShell
      title="Returns"
      subtitle="30-day returns with buyer protection (template policy)."
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="surface border border-subtle rounded-2xl p-4">
          <div className="flex items-center gap-2 text-foreground">
            <CalendarDays className="w-4 h-4" />
            <p className="text-sm font-semibold">30 days</p>
          </div>
          <p className="text-xs text-muted mt-2">Return window starts when the item is delivered.</p>
        </div>
        <div className="surface border border-subtle rounded-2xl p-4">
          <div className="flex items-center gap-2 text-foreground">
            <RotateCcw className="w-4 h-4" />
            <p className="text-sm font-semibold">Easy process</p>
          </div>
          <p className="text-xs text-muted mt-2">Request a return, print label, drop off.</p>
        </div>
        <div className="surface border border-subtle rounded-2xl p-4">
          <div className="flex items-center gap-2 text-foreground">
            <ShieldCheck className="w-4 h-4" />
            <p className="text-sm font-semibold">Protected</p>
          </div>
          <p className="text-xs text-muted mt-2">Refunds are protected by buyer assurance.</p>
        </div>
      </div>

      <div className="mt-6 surface border border-subtle rounded-2xl p-4">
        <p className="text-sm font-semibold text-foreground">Return conditions (template)</p>
        <ul className="mt-2 text-xs text-muted space-y-1 list-disc pl-4">
          <li>Item must be returned in original condition where applicable.</li>
          <li>Refunds are issued to the original payment method.</li>
          <li>Some affiliate items are returned via the partner store.</li>
        </ul>
      </div>
    </SupportPageShell>
  );
}
