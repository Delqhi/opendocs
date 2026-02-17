import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Globe } from 'lucide-react';
import { useShopStore } from '../store/shopStore';

export function CurrencySelector() {
  const { currency, currencies, setCurrency } = useShopStore();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/20 transition-all text-sm font-medium"
      >
        <Globe className="w-4 h-4" />
        <span>{currency.code}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-dark-800 rounded-xl shadow-xl border border-gray-200 dark:border-white/10 overflow-hidden z-50 animate-fade-in">
          <div className="p-2">
            <p className="px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Select Currency
            </p>
            {currencies.map((c) => (
              <button
                key={c.code}
                onClick={() => {
                  setCurrency(c.code);
                  setOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  c.code === currency.code
                    ? 'bg-black dark:bg-white text-white dark:text-black'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10'
                }`}
              >
                <span className="flex items-center gap-2">
                  <span className="text-lg">{c.symbol}</span>
                  <span>{c.code}</span>
                </span>
                {c.code === currency.code && <Check className="w-4 h-4" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Utility hook for price formatting
export function useFormatPrice() {
  const { currency } = useShopStore();
  
  return (priceInUSD: number): string => {
    const converted = priceInUSD * currency.rate;
    return `${currency.symbol}${converted.toFixed(2)}`;
  };
}
