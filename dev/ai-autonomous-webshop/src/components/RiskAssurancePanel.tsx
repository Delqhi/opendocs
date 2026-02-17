import { ShieldCheck, BadgeCheck, Globe2, Lock } from 'lucide-react';

export function RiskAssurancePanel() {
  return (
    <div className="surface border border-subtle rounded-2xl p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
      {[
        { icon: <ShieldCheck className="w-4 h-4" />, title: 'Fraud protection', text: 'AI risk scoring on every checkout' },
        { icon: <Lock className="w-4 h-4" />, title: 'Secure payments', text: 'PCI compliant + encrypted tokens' },
        { icon: <Globe2 className="w-4 h-4" />, title: 'Compliance', text: 'GDPR, CCPA, and global taxes' },
        { icon: <BadgeCheck className="w-4 h-4" />, title: 'Verified products', text: 'Supplier verification & QC checks' },
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
