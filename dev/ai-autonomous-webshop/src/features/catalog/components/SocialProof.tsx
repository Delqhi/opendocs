import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, ShoppingBag, TrendingUp } from 'lucide-react';
import type { LiveActivity } from './ProductDetail.types';

interface SocialProofProps {
  liveActivity: LiveActivity | null;
}

export function SocialProof({ liveActivity }: SocialProofProps) {
  const [purchases, setPurchases] = useState<number[]>([]);

  useEffect(() => {
    if (!liveActivity) return;
    
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        setPurchases(prev => [...prev.slice(-4), Math.floor(Math.random() * 5) + 1]);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [liveActivity]);

  if (!liveActivity) return null;

  const stockStatus = {
    high: { color: 'text-green-400', label: 'In Stock' },
    medium: { color: 'text-yellow-400', label: 'Limited Stock' },
    low: { color: 'text-orange-400', label: 'Low Stock' },
    critical: { color: 'text-red-400', label: 'Almost Gone' },
  };

  const status = stockStatus[liveActivity.stockLevel];

  return (
    <div className="space-y-3">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-xl p-4 flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/20 rounded-lg">
            <Eye size={18} className="text-blue-400" />
          </div>
          <div>
            <p className="text-sm text-gray-400">Right now</p>
            <p className="text-lg font-bold">{liveActivity.viewers} people viewing</p>
          </div>
        </div>
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
      </motion.div>

      {purchases.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-1"
        >
          {purchases.slice(-2).reverse().map((qty, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 text-sm text-gray-400"
            >
              <ShoppingBag size={14} className="text-green-400" />
              <span>
                <span className="text-white font-medium">{qty}</span> purchased in the last hour
              </span>
            </motion.div>
          ))}
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass rounded-xl p-4 flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-500/20 rounded-lg">
            <TrendingUp size={18} className="text-green-400" />
          </div>
          <div>
            <p className="text-sm text-gray-400">Availability</p>
            <p className={`text-lg font-bold ${status.color}`}>{status.label}</p>
          </div>
        </div>
        {liveActivity.restockDate && (
          <span className="text-xs text-gray-500">Restock: {liveActivity.restockDate}</span>
        )}
      </motion.div>
    </div>
  );
}
