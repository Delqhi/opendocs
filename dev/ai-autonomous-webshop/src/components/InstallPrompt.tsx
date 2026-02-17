import { useEffect, useState } from 'react';
import { Download, X, Smartphone, WifiOff, RefreshCw } from 'lucide-react';
import { useRegisterSW } from 'virtual:pwa-register/react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallPrompt() {
  const { offlineReady, needRefresh, updateServiceWorker } = useRegisterSW({
    onNeedRefresh() {},
    onOfflineReady() {
      console.log('App is offline-ready');
    },
    onRegisterError(error) {
      console.error('SW registration failed:', error);
    }
  });

  const [dismissed, setDismissed] = useState(false);
  const [showOfflineNotice, setShowOfflineNotice] = useState(false);

  useEffect(() => {
    const handleOnline = () => setShowOfflineNotice(false);
    const handleOffline = () => setShowOfflineNotice(true);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    if (!navigator.onLine) setShowOfflineNotice(true);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (showOfflineNotice && !offlineReady) {
    return (
      <div className="fixed top-4 left-1/2 z-[90] w-[92%] max-w-md -translate-x-1/2 rounded-xl bg-amber-50 border border-amber-200 shadow-lg p-3 flex items-center gap-3">
        <WifiOff className="w-4 h-4 text-amber-600 flex-shrink-0" />
        <p className="text-xs text-amber-800 flex-1">You're offline. Some features may be limited.</p>
        <button onClick={() => setShowOfflineNotice(false)} className="text-amber-600 hover:text-amber-800">
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  if (needRefresh) {
    return (
      <div className="fixed bottom-6 left-1/2 z-[90] w-[92%] max-w-lg -translate-x-1/2 rounded-2xl border border-subtle surface shadow-elev p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-black/5 dark:bg-white/[0.06] flex items-center justify-center">
            <RefreshCw className="w-5 h-5 text-foreground" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-foreground">New version available</p>
            <p className="text-xs text-muted mt-1">Refresh to get the latest features and fixes.</p>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <button
            onClick={() => updateServiceWorker(true)}
            className="flex-1 px-4 py-2 rounded-xl bg-foreground text-white text-xs font-semibold flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" /> Refresh Now
          </button>
          <button onClick={() => setDismissed(true)} className="px-4 py-2 rounded-xl border border-subtle text-xs text-muted hover:text-foreground">
            Later
          </button>
        </div>
      </div>
    );
  }

  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handler = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
      setVisible(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === 'accepted') {
      setVisible(false);
      setDeferredPrompt(null);
    }
  };

  if (!visible || dismissed || offlineReady) return null;

  return (
    <div className="fixed bottom-6 left-1/2 z-[90] w-[92%] max-w-lg -translate-x-1/2 rounded-2xl border border-subtle surface shadow-elev p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-black/5 dark:bg-white/[0.06] flex items-center justify-center">
          <Smartphone className="w-5 h-5 text-foreground" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-foreground">Install NEXUS for faster checkout</p>
          <p className="text-xs text-muted mt-1">Get app-like speed, offline access, and instant launches from your home screen.</p>
        </div>
        <button onClick={() => setVisible(false)} className="text-muted hover:text-foreground">
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <button
          onClick={handleInstall}
          className="flex-1 px-4 py-2 rounded-xl bg-foreground text-white text-xs font-semibold flex items-center justify-center gap-2"
        >
          <Download className="w-4 h-4" /> Install App
        </button>
        <button onClick={() => setVisible(false)} className="px-4 py-2 rounded-xl border border-subtle text-xs text-muted hover:text-foreground">
          Not now
        </button>
      </div>
    </div>
  );
}
