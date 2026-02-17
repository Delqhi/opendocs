import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

export * from './currency';

const resources = {
  en: {
    translation: {
      "hero_title": "The Future of Autonomous Commerce",
      "hero_subtitle": "Experience the world's most advanced AI-driven storefront. Powered by Go and React 2026.",
      "shop_collection": "Shop the Collection",
      "learn_more": "Learn More",
      "featured_products": "Featured Products",
      "ai_curated": "AI Curated",
      "login": "Login",
      "get_started": "Get Started",
      "catalog": "Catalog",
      "trending": "Trending",
      "ai_scout": "AI Scout",
    }
  },
  de: {
    translation: {
      "hero_title": "Die Zukunft des autonomen Handels",
      "hero_subtitle": "Erleben Sie den fortschrittlichsten KI-gesteuerten Shop der Welt. Powered by Go und React 2026.",
      "shop_collection": "Kollektion shoppen",
      "learn_more": "Mehr erfahren",
      "featured_products": "Vorgestellte Produkte",
      "ai_curated": "KI Kuratiert",
      "login": "Anmelden",
      "get_started": "Loslegen",
      "catalog": "Katalog",
      "trending": "Trends",
      "ai_scout": "KI Scout",
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    }
  });

export default i18n;
