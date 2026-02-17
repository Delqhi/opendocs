import { FileText } from 'lucide-react';

export function LegalTerms() {
  return (
    <div className="surface border border-subtle rounded-3xl p-6 sm:p-10 space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-black/5 dark:bg-white/[0.06] flex items-center justify-center">
          <FileText className="w-6 h-6 text-foreground" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Terms of Service</h1>
          <p className="text-xs text-muted">Last updated: Feb 2026 (template)</p>
        </div>
      </div>

      <div className="prose prose-sm max-w-none dark:prose-invert">
        <p>
          This is a demo implementation. Payments, fulfillment and tracking shown in the UI are simulated unless you connect real providers in Admin.
        </p>
        <h2>Returns</h2>
        <p>
          30-day return window is shown for demonstration. For production, replace with your legally valid return policy.
        </p>
        <h2>Affiliate products</h2>
        <p>
          Products marked as Affiliate may redirect to third‑party stores. Commission and pricing may vary.
        </p>
      </div>
    </div>
  );
}
