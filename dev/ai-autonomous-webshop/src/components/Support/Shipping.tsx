import { Truck, Clock, MapPin, ShieldCheck } from 'lucide-react';
import { SupportPageShell } from './SupportPageShell';

export function SupportShipping() {
  return (
    <SupportPageShell
      title="Shipping"
      subtitle="Worldwide delivery with tracking. Express options available."
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="surface border border-subtle rounded-2xl p-4">
          <div className="flex items-center gap-2 text-foreground">
            <Truck className="w-4 h-4" />
            <p className="text-sm font-semibold">Standard</p>
          </div>
          <p className="text-xs text-muted mt-2">Free worldwide shipping on most products.</p>
          <p className="text-xs text-muted mt-1 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> 5–12 business days (avg)
          </p>
        </div>

        <div className="surface border border-subtle rounded-2xl p-4">
          <div className="flex items-center gap-2 text-foreground">
            <Truck className="w-4 h-4" />
            <p className="text-sm font-semibold">Express / Priority</p>
          </div>
          <p className="text-xs text-muted mt-2">Fast delivery where available.</p>
          <p className="text-xs text-muted mt-1 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> 1–5 business days
          </p>
        </div>
      </div>

      <div className="mt-3 surface border border-subtle rounded-2xl p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-black/5 dark:bg-white/[0.06]">
            <MapPin className="w-4 h-4 text-foreground" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Tracking</p>
            <p className="text-xs text-muted mt-1">
              Every shipment includes tracking. Updates may take 24–48 hours after dispatch.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-3 surface border border-subtle rounded-2xl p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-black/5 dark:bg-white/[0.06]">
            <ShieldCheck className="w-4 h-4 text-foreground" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Delivery guarantee</p>
            <p className="text-xs text-muted mt-1">
              If your order doesn’t arrive, you can claim a refund via buyer protection.
            </p>
          </div>
        </div>
      </div>
    </SupportPageShell>
  );
}
