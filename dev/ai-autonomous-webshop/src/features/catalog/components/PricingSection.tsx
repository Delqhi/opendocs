import { motion } from 'framer-motion';
import { Package, TrendingUp, AlertTriangle } from 'lucide-react';

type Currency = 'USD' | 'EUR' | 'GBP' | 'JPY';

interface CurrencyConfig {
  symbol: string;
  locale: string;
}

const currencyConfigs: Record<Currency, CurrencyConfig> = {
  USD: { symbol: '$', locale: 'en-US' },
  EUR: { symbol: '€', locale: 'de-DE' },
  GBP: { symbol: '£', locale: 'en-GB' },
  JPY: { symbol: '¥', locale: 'ja-JP' },
};

interface StockInfo {
  stock: number;
  stockLevel: 'high' | 'medium' | 'low' | 'critical';
  restockDate?: string;
}

interface PricingSectionProps {
  price: number;
  originalPrice: number;
  currency?: Currency;
  stockInfo?: StockInfo;
}

export function PricingSection({ 
  price, 
  originalPrice, 
  currency = 'USD',
  stockInfo,
}: PricingSectionProps) {
  const discount = Math.round((1 - price / originalPrice) * 100);
  const config = currencyConfigs[currency];

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat(config.locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: currency === 'JPY' ? 0 : 2,
    }).format(amount);
  };

  const getStockDisplay = () => {
    if (!stockInfo) return null;
    
    const { stock, stockLevel, restockDate } = stockInfo;
    
    const stockConfig = {
      high: { color: 'text-green-400', bg: 'bg-green-500/20', label: 'In Stock' },
      medium: { color: 'text-yellow-400', bg: 'bg-yellow-500/20', label: 'Low Stock' },
      low: { color: 'text-orange-400', bg: 'bg-orange-500/20', label: 'Selling Fast' },
      critical: { color: 'text-red-400', bg: 'bg-red-500/20', label: 'Almost Gone' },
    };
    
    const config = stockConfig[stockLevel];
    
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex items-center gap-2 ${config.bg} px-3 py-1.5 rounded-full`}
      >
        <Package size={14} className={config.color} />
        <span className={`text-sm font-medium ${config.color}`}>{config.label}</span>
        {stockLevel === 'critical' && stock <= 5 && (
          <span className="text-xs text-red-300">Only {stock} left!</span>
        )}
      </motion.div>
    );
  };

  const getPriceMovement = () => {
    if (price < originalPrice) {
      return (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="flex items-center gap-1 text-green-400 text-sm"
        >
          <TrendingUp size={14} />
          <span>Best price today</span>
        </motion.div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-baseline gap-3">
        <motion.span
          key={price}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl sm:text-4xl font-bold text-white"
        >
          {formatPrice(price)}
        </motion.span>
        {discount > 0 && (
          <>
            <span className="text-lg text-gray-500 line-through">
              {formatPrice(originalPrice)}
            </span>
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="bg-green-500/20 text-green-400 px-2 py-1 rounded-full text-sm font-medium"
            >
              Save {discount}%
            </motion.span>
          </>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {getStockDisplay()}
        {getPriceMovement()}
      </div>

      {stockInfo?.restockDate && stockInfo.stockLevel === 'critical' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-2 text-amber-400 text-sm"
        >
          <AlertTriangle size={14} />
          <span>Restocks on {new Date(stockInfo.restockDate).toLocaleDateString()}</span>
        </motion.div>
      )}
    </div>
  );
}
