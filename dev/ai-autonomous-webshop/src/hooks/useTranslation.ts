import { useShopStore } from '../store/shopStore';

/**
 * 2026 Best Practice: Lightweight i18n hook
 * Supports EN, DE, ES, FR, ZH
 */
export function useTranslation() {
  const { language, translations } = useShopStore();

  const t = (key: string, fallback?: string): string => {
    const keys = key.split('.');
    let result = translations[language];
    
    if (!result) result = translations['en'];

    for (const k of keys) {
      if (result && typeof result === 'object' && k in result) {
        result = result[k];
      } else {
        return fallback || key;
      }
    }

    return typeof result === 'string' ? result : (fallback || key);
  };

  return { t, language };
}
