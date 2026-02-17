import i18n from 'i18next';

export interface Currency {
  code: string;
  symbol: string;
  rate: number;
  locale: string;
}

export interface GeoLocation {
  country: string;
  currency: string;
}

const MOCK_GEO_DB: Record<string, string> = {
  US: 'USD',
  GB: 'GBP',
  DE: 'EUR',
  FR: 'EUR',
  ES: 'EUR',
  IT: 'EUR',
  NL: 'EUR',
  BE: 'EUR',
  AT: 'EUR',
  IE: 'EUR',
  PT: 'EUR',
  FI: 'EUR',
  GR: 'EUR',
  JP: 'JPY',
  CA: 'CAD',
  AU: 'AUD',
  CH: 'CHF',
};

const CURRENCY_LOCALE_MAP: Record<string, string> = {
  USD: 'en-US',
  EUR: 'de-DE',
  GBP: 'en-GB',
  JPY: 'ja-JP',
  CAD: 'en-CA',
  AUD: 'en-AU',
  CHF: 'de-CH',
};

export const SUPPORTED_CURRENCIES: Currency[] = [
  { code: 'USD', symbol: '$', rate: 1, locale: 'en-US' },
  { code: 'EUR', symbol: '€', rate: 0.92, locale: 'de-DE' },
  { code: 'GBP', symbol: '£', rate: 0.79, locale: 'en-GB' },
];

const CACHE_KEY = 'nexus_geo_cache';
const CACHE_DURATION = 60 * 60 * 1000;

function getCachedGeo(): GeoLocation | null {
  if (typeof window === 'undefined') return null;
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;
    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp > CACHE_DURATION) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
    return data as GeoLocation;
  } catch {
    return null;
  }
}

function setCachedGeo(geo: GeoLocation): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ data: geo, timestamp: Date.now() }));
  } catch { /* ignore */ }
}

export async function detectUserLocation(): Promise<GeoLocation> {
  const cached = getCachedGeo();
  if (cached) return cached;

  if (typeof window === 'undefined') {
    return { country: 'US', currency: 'USD' };
  }

  try {
    const response = await fetch('https://ipapi.co/json/');
    if (response.ok) {
      const data = await response.json();
      const countryCode = data.country_code || 'US';
      const currency = MOCK_GEO_DB[countryCode] || 'USD';
      const geo: GeoLocation = { country: countryCode, currency };
      setCachedGeo(geo);
      return geo;
    }
  } catch {
    console.warn('Geo-detection failed, using browser locale');
  }

  const browserLang = navigator.language || 'en-US';
  const countryFromLang = browserLang.split('-')[1] || 'US';
  const fallbackCurrency = MOCK_GEO_DB[countryFromLang] || 'USD';
  const geo: GeoLocation = { country: countryFromLang, currency: fallbackCurrency };
  setCachedGeo(geo);
  return geo;
}

export function getCurrencyFromCountry(countryCode: string): string {
  return MOCK_GEO_DB[countryCode] || 'USD';
}

export function formatCurrency(amount: number, currencyCode: string): string {
  const currency = SUPPORTED_CURRENCIES.find(c => c.code === currencyCode);
  const locale = currency?.locale || CURRENCY_LOCALE_MAP[currencyCode] || 'en-US';

  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    const sym = currency?.symbol || '$';
    return `${sym}${amount.toFixed(2)}`;
  }
}

export function convertPrice(amountInUSD: number, targetCurrency: string): number {
  const currency = SUPPORTED_CURRENCIES.find(c => c.code === targetCurrency);
  return amountInUSD * (currency?.rate || 1);
}

export function getCurrencyByCode(code: string): Currency | undefined {
  return SUPPORTED_CURRENCIES.find(c => c.code === code);
}

export function getUserCurrencyFromBrowser(): string {
  if (typeof window === 'undefined') return 'USD';
  
  const browserLang = navigator.language || 'en-US';
  const countryCode = browserLang.split('-')[1] || 'US';
  return MOCK_GEO_DB[countryCode] || 'USD';
}

export function initializeI18nCurrency(): void {
  i18n.on('languageChanged', (lng) => {
    const countryCode = lng.split('-')[1] || 'US';
    const detectedCurrency = MOCK_GEO_DB[countryCode] || 'USD';
    const stored = localStorage.getItem('nexus_currency_v1');
    if (!stored) {
      localStorage.setItem('nexus_currency_v1', detectedCurrency);
    }
  });
}

export default {
  detectUserLocation,
  getCurrencyFromCountry,
  formatCurrency,
  convertPrice,
  getCurrencyByCode,
  getUserCurrencyFromBrowser,
  initializeI18nCurrency,
  SUPPORTED_CURRENCIES,
};
