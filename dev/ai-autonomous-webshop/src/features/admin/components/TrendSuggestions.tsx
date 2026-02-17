import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, TrendingUp, ExternalLink, Plus } from 'lucide-react';
import { trendService } from '../services/trendService';
import { Button } from '../../../components/ui/Button';

export const TrendSuggestions: React.FC = () => {
  const [trends, setTrends] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTrends = async () => {
      try {
        const data = await trendService.getTrends();
        setTrends(data);
      } catch (error) {
        console.error('Failed to fetch trends', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTrends();
  }, []);

  if (isLoading) return <div className="animate-pulse h-64 bg-white/5 rounded-3xl" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="text-yellow-400" size={20} />
        <h2 className="text-xl font-bold">AI Trend Sourcing</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {trends.map((trend, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="glass p-6 rounded-3xl border border-yellow-500/20 relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-3 bg-yellow-500/10 text-yellow-500 rounded-bl-2xl text-xs font-bold flex items-center gap-1">
              <TrendingUp size={12} />
              {Math.round(trend.confidence * 100)}% Match
            </div>
            
            <h3 className="font-bold text-lg pr-12">{trend.name}</h3>
            <p className="text-gray-500 text-sm mt-2">{trend.description}</p>
            
            <div className="mt-6 flex items-center justify-between">
              <span className="text-xl font-bold text-white">${trend.price}</span>
              <span className="text-[10px] uppercase tracking-widest text-gray-600 font-bold">{trend.source}</span>
            </div>

            <div className="mt-4 pt-4 border-t border-white/5 flex gap-2">
              <Button size="sm" className="flex-1">
                <Plus size={14} className="mr-1" /> Import
              </Button>
              <button className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-colors text-gray-400 hover:text-white">
                <ExternalLink size={16} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
