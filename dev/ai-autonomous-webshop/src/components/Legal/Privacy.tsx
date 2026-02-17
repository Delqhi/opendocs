import { ShieldCheck } from 'lucide-react';

export function LegalPrivacy() {
  return (
    <div className="surface border border-subtle rounded-3xl p-6 sm:p-10 space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-black/5 dark:bg-white/[0.06] flex items-center justify-center">
          <ShieldCheck className="w-6 h-6 text-foreground" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Privacy Policy</h1>
          <p className="text-xs text-muted">Last updated: Feb 2026 (template)</p>
        </div>
      </div>

      <div className="prose prose-sm max-w-none dark:prose-invert">
        <p>
          This demo storefront stores only minimal data in your browser (localStorage) to provide wishlist, cart, and account demo features.
          No server-side storage is used in this build.
        </p>
        <h2>Data we store locally</h2>
        <ul>
          <li>Cart items</li>
          <li>Wishlist</li>
          <li>Recently viewed products</li>
          <li>Optional account demo session</li>
          <li>Cookie preference</li>
        </ul>
        <h2>Analytics</h2>
        <p>
          Analytics integrations can be configured in the Admin area. In this demo build, no external analytics are executed by default.
        </p>
        <h2>Contact</h2>
        <p>
          For privacy questions, contact the store operator.
        </p>
      </div>
    </div>
  );
}
