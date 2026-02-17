import { Mail, Phone, MessageSquare, ShieldCheck } from 'lucide-react';
import { useShopStore } from '../../store/shopStore';
import { SupportPageShell } from './SupportPageShell';

export function SupportContact() {
  const { settings } = useShopStore();

  return (
    <SupportPageShell
      title="Contact"
      subtitle="Priority support with AI + human escalation."
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="surface border border-subtle rounded-2xl p-4">
          <div className="flex items-center gap-2 text-foreground">
            <Mail className="w-4 h-4" />
            <p className="text-sm font-semibold">Email</p>
          </div>
          <p className="text-xs text-muted mt-2">{settings.supportEmail}</p>
          <p className="text-[11px] text-muted mt-1">Typical response: &lt; 2 hours</p>
        </div>

        <div className="surface border border-subtle rounded-2xl p-4">
          <div className="flex items-center gap-2 text-foreground">
            <Phone className="w-4 h-4" />
            <p className="text-sm font-semibold">Phone</p>
          </div>
          <p className="text-xs text-muted mt-2">{settings.supportPhone}</p>
          <p className="text-[11px] text-muted mt-1">24/7 availability (demo)</p>
        </div>

        <div className="surface border border-subtle rounded-2xl p-4">
          <div className="flex items-center gap-2 text-foreground">
            <MessageSquare className="w-4 h-4" />
            <p className="text-sm font-semibold">AI Concierge</p>
          </div>
          <p className="text-xs text-muted mt-2">Use the chat bubble to get product help instantly.</p>
          <p className="text-[11px] text-muted mt-1">Fastest support channel</p>
        </div>
      </div>

      <div className="mt-6 surface border border-subtle rounded-2xl p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-black/5 dark:bg-white/[0.06]">
            <ShieldCheck className="w-4 h-4 text-foreground" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Buyer protection</p>
            <p className="text-xs text-muted mt-1">
              If an order doesn’t arrive or isn’t as described, you’re covered by our buyer protection.
            </p>
          </div>
        </div>
      </div>
    </SupportPageShell>
  );
}
