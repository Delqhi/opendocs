import { Building2 } from 'lucide-react';

export function LegalImprint() {
  return (
    <div className="surface border border-subtle rounded-3xl p-6 sm:p-10 space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-black/5 dark:bg-white/[0.06] flex items-center justify-center">
          <Building2 className="w-6 h-6 text-foreground" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Imprint</h1>
          <p className="text-xs text-muted">Replace with your legal entity details</p>
        </div>
      </div>

      <div className="text-sm text-muted space-y-3">
        <div>
          <p className="text-foreground font-semibold">Store Operator</p>
          <p>Company Name</p>
          <p>Street, Number</p>
          <p>City, ZIP</p>
          <p>Country</p>
        </div>
        <div>
          <p className="text-foreground font-semibold">Contact</p>
          <p>Email: support@example.com</p>
          <p>Phone: +1 555 000 0000</p>
        </div>
        <div>
          <p className="text-foreground font-semibold">Disclaimer</p>
          <p>
            This page is a template. Ensure your final imprint matches requirements in your target markets.
          </p>
        </div>
      </div>
    </div>
  );
}
