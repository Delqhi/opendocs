import { useState, useEffect } from 'react';
import { Cookie, X, Shield, Settings } from 'lucide-react';
import { useShopStore } from '../store/shopStore';

export function CookieBanner() {
  const { cookieConsent, setCookieConsent } = useShopStore();
  const [showDetails, setShowDetails] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('nexus_cookie_consent');
    if (stored !== null) {
      setCookieConsent(stored === 'true');
    } else {
      const timer = setTimeout(() => setVisible(true), 1200);
      return () => clearTimeout(timer);
    }
  }, [setCookieConsent]);

  const handleAccept = () => {
    localStorage.setItem('nexus_cookie_consent', 'true');
    setCookieConsent(true);
    setVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem('nexus_cookie_consent', 'false');
    setCookieConsent(false);
    setVisible(false);
  };

  if (cookieConsent !== null || !visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[100] p-4 animate-slide-up">
      <div className="max-w-4xl mx-auto rounded-2xl shadow-2xl overflow-hidden border bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
        {/* Main Banner */}
        <div className="p-4 sm:p-6">
          <div className="flex items-start gap-4">
            <div className="shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Cookie className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">We value your privacy 🔒</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                We use cookies to enhance your shopping experience, analyze site traffic, and personalize content. By clicking "Accept All", you consent to our use of cookies.
              </p>

              {showDetails && (
                <div className="mt-4 p-4 rounded-xl space-y-3 bg-gray-50 border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Essential Cookies</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Required for the website to function. Always enabled.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Settings className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Analytics & Personalization</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Help us understand how you use our site and show relevant products.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <button onClick={handleDecline} className="shrink-0 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors" aria-label="Close">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Actions */}
          <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button onClick={handleAccept} className="flex-1 sm:flex-none px-6 py-3 rounded-xl text-sm font-medium transition-opacity bg-gray-900 text-white hover:opacity-90 dark:bg-white dark:text-black">
              Accept All
            </button>
            <button onClick={handleDecline} className="flex-1 sm:flex-none px-6 py-3 rounded-xl text-sm font-medium transition-colors bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700">
              Essential Only
            </button>
            <button onClick={() => setShowDetails(!showDetails)} className="text-sm underline text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white">
              {showDetails ? 'Hide Details' : 'Cookie Details'}
            </button>
          </div>
        </div>

        {/* Trust Strip */}
        <div className="px-4 sm:px-6 py-3 border-t bg-gray-50 dark:bg-gray-800 border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-center gap-4 text-xs text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> GDPR Compliant</span>
            <span>•</span>
            <span>CCPA Ready</span>
            <span>•</span>
            <span>SSL Encrypted</span>
          </div>
        </div>
      </div>
    </div>
  );
}
