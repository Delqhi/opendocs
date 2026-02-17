import { useEffect, useState } from 'react';
import { WifiOff, X } from 'lucide-react';

export function OfflineBanner() {
  const [offline, setOffline] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const update = () => {
      const isOffline = typeof navigator !== 'undefined' ? !navigator.onLine : false;
      setOffline(isOffline);
      if (!isOffline) setDismissed(false);
    };

    update();
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    return () => {
      window.removeEventListener('online', update);
      window.removeEventListener('offline', update);
    };
  }, []);

  if (!offline || dismissed) return null;

  return (
    <div className="fixed top-[calc(3px+44px)] sm:top-[calc(3px+52px)] left-1/2 -translate-x-1/2 z-[95] w-[94%] max-w-2xl">
      <div className="surface-elev border border-subtle rounded-2xl px-4 py-3 flex items-start gap-3">
        <div className="mt-0.5 p-2 rounded-xl bg-red-500/10 text-red-500">
          <WifiOff className="w-4 h-4" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-foreground">You’re offline</p>
          <p className="text-xs text-muted mt-0.5">Browsing still works for cached pages. Checkout and live tracking require a connection.</p>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="p-2 rounded-lg text-muted hover:text-foreground hover:bg-black/5 dark:hover:bg-white/10"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
