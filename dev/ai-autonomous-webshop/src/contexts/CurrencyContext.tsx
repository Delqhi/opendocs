import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { useShopStore } from '../store/shopStore';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export interface Currency {
  code: string;
  symbol: string;
  name: string;
  rate: number;
  locale: string;
  decimal_places: number;
}

export interface GeoLocation {
  country: string;
  country_name: string;
  city: string;
  currency: string;
  ip: string;
}

interface CurrencyContextType {
  currency: Currency;
  currencies: Currency[];
  geo: GeoLocation | null;
  isLoading: boolean;
  setCurrency: (code: string) => Promise<void>;
  convertPrice: (amount: number, from?: string) => number;
  formatPrice: (amount: number, currencyCode?: string) => string;
  refreshGeo: () => Promise<void>;
}

const CurrencyContext = createContext<CurrencyContextType | null>(null);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const storeCurrency = useShopStore((s) => s.currency);
  const storeCurrencies = useShopStore((s) => s.currencies);
  const storeSetCurrency = useShopStore((s) => s.setCurrency);
  
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [geo, setGeo] = useState<GeoLocation | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCurrencies = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/v1/currency/list`);
      if (res.ok) {
        const data = await res.json();
        setCurrencies(data.currencies || []);
      }
    } catch (err) {
      console.error('Failed to fetch currencies:', err);
    }
  }, []);

  const fetchGeo = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/v1/geo`);
      if (res.ok) {
        const data = await res.json();
        setGeo(data);
        return data;
      }
    } catch (err) {
      console.error('Failed to fetch geo:', err);
    }
    return null;
  }, []);

  const initialize = useCallback(async () => {
    setIsLoading(true);
    try {
      const [currenciesData, geoData] = await Promise.all([
        fetch(`${API_BASE}/api/v1/currency/list`).then((r) => r.ok ? r.json() : null),
        fetchGeo(),
      ]);

      if (currenciesData?.currencies) {
        setCurrencies(currenciesData.currencies);
      }

      const storedCurrency = localStorage.getItem('nexus_currency_v1');
      
      if (!storedCurrency && geoData?.currency) {
        const matchingCurrency = currenciesData?.currencies?.find(
          (c: Currency) => c.code === geoData.currency
        );
        if (matchingCurrency) {
          storeSetCurrency(matchingCurrency.code);
        }
      } else if (storedCurrency) {
        storeSetCurrency(storedCurrency);
      }
    } catch (err) {
      console.error('Currency init failed:', err);
    } finally {
      setIsLoading(false);
    }
  }, [fetchGeo, storeSetCurrency]);

  useEffect(() => {
    initialize();
  }, [initialize]);

  const setCurrency = useCallback(async (code: string) => {
    try {
      await fetch(`${API_BASE}/api/v1/currency/set`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currency: code }),
      });
    } catch (err) {
      console.error('Failed to set currency on backend:', err);
    }
    
    storeSetCurrency(code);
    localStorage.setItem('nexus_currency_v1', code);
  }, [storeSetCurrency]);

  const convertPrice = useCallback((amount: number, from = 'USD'): number => {
    const targetCurrency = storeCurrency?.code || 'USD';
    if (from === targetCurrency) return amount;
    
    const fromCurr = currencies.find((c) => c.code === from);
    const toCurr = currencies.find((c) => c.code === targetCurrency);
    
    if (!fromCurr || !toCurr) return amount;
    
    const usdAmount = amount / fromCurr.rate;
    return Math.round(usdAmount * toCurr.rate * 100) / 100;
  }, [storeCurrency, currencies]);

  const formatPrice = useCallback((amount: number, currencyCode?: string): string => {
    const code = currencyCode || storeCurrency?.code || 'USD';
    const curr = currencies.find((c) => c.code === code);
    
    if (!curr) return `$${amount.toFixed(2)}`;
    
    return new Intl.NumberFormat(curr.locale, {
      style: 'currency',
      currency: code,
      minimumFractionDigits: curr.decimal_places,
      maximumFractionDigits: curr.decimal_places,
    }).format(amount);
  }, [storeCurrency, currencies]);

  const refreshGeo = useCallback(async () => {
    const data = await fetchGeo();
    if (data?.currency) {
      setCurrency(data.currency);
    }
  }, [fetchGeo, setCurrency]);

  const value = useMemo(() => ({
    currency: storeCurrency as Currency,
    currencies: currencies.length > 0 ? currencies : storeCurrencies as Currency[],
    geo,
    isLoading,
    setCurrency,
    convertPrice,
    formatPrice,
    refreshGeo,
  }), [storeCurrency, storeCurrencies, currencies, geo, isLoading, setCurrency, convertPrice, formatPrice, refreshGeo]);

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    return {
      currency: { code: 'USD', symbol: '$', name: 'US Dollar', rate: 1, locale: 'en-US', decimal_places: 2 },
      currencies: [{ code: 'USD', symbol: '$', name: 'US Dollar', rate: 1, locale: 'en-US', decimal_places: 2 }],
      geo: null,
      isLoading: false,
      setCurrency: async () => {},
      convertPrice: (amount: number) => amount,
      formatPrice: (amount: number) => `$${amount.toFixed(2)}`,
      refreshGeo: async () => {},
    };
  }
  return context;
}

export function useConvertPrice() {
  const { convertPrice, currency } = useCurrency();
  return useCallback((amountInUSD: number) => convertPrice(amountInUSD, 'USD'), [convertPrice, currency]);
}

export function useFormatPrice() {
  const { formatPrice, currency } = useCurrency();
  return useCallback((amount: number) => formatPrice(amount), [formatPrice, currency]);
}
