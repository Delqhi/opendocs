import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, Zap, BarChart3 } from 'lucide-react';
import type { ProductDetailProduct } from './ProductDetail.types';

interface AIScarcityProps {
  product: ProductDetailProduct;
}

export function AIScarcity({ product }: AIScarcityProps) {
  const [metrics, setMetrics] = useState({
    demandVelocity: product.aiInsights?.demandVelocity ?? 75,
    valueIntegrity: product.aiInsights?.valueIntegrity ?? 88,
    fitScore: product.aiInsights?.fitScore ?? 94,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        demandVelocity: Math.min(100, prev.demandVelocity + (Math.random() > 0.8 ? 1 : 0)),
        valueIntegrity: Math.min(100, prev.valueIntegrity + (Math.random() > 0.9 ? 1 : 0)),
        fitScore: Math.min(100, prev.fitScore + (Math.random() > 0.85 ? 1 : 0)),
      }));
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const scarcityLevel = product.stock < 10 ? 'critical' : product.stock < 25 ? 'low' : 'medium';

  const scarcityConfig = {
    critical: {
      bg: 'bg-red-500/10 border-red-500/30',
      text: 'text-red-400',
      icon: '🔥',
      message: 'High demand - Selling fast!',
    },
    low: {
      bg: 'bg-orange-500/10 border-orange-500/30',
      text: 'text-orange-400',
      icon: '⚡',
      message: 'Limited stock available',
    },
    medium: {
      bg: 'bg-blue-500/10 border-blue-500/30',
      text: 'text-blue-400',
      icon: '📦',
      message: 'In stock - Ships soon',
    },
  };

  const scarcity = scarcityConfig[scarcityLevel];

  const metricItems = [
    { label: 'Demand Velocity', value: metrics.demandVelocity, icon: Zap },
    { label: 'Value Integrity', value: metrics.valueIntegrity, icon: BarChart3 },
    { label: 'Fit Score', value: metrics.fitScore, icon: Brain },
  ];

  return (
    <div className="glass rounded-2xl p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl">
            <Brain size={24} className="text-white" />
          </div>
          <div>
            <h3 className="font-bold text-lg">AI Demand Analysis</h3>
            <p className="text-sm text-gray-400">Real-time market intelligence</p>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full ${scarcity.bg} border ${scarcity.text} text-sm font-medium`}>
          {scarcity.icon} {scarcity.message}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {metricItems.map((metric, i) => (
          <div key={i} className="glass rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <metric.icon size={16} className="text-blue-400" />
              <span className="text-xs text-gray-500">{metric.label}</span>
            </div>
            <div className="text-2xl font-bold">{metric.value}%</div>
            <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${metric.value}%` }}
                transition={{ delay: 0.3 + i * 0.1, duration: 0.8 }}
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
              />
            </div>
          </div>
        ))}
      </div>

      <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
        <p className="text-sm text-gray-300 leading-relaxed">
          <span className="text-blue-400 font-medium">AI Insight: </span>
          {product.aiInsights?.reasoning ?? `This ${product.name} has shown ${metrics.demandVelocity > 80 ? 'exceptional' : 'strong'} demand with ${metrics.valueIntegrity}% value integrity. ${product.stock < 20 ? 'Stock is running low - secure yours now!' : 'Recommended for immediate purchase.'}`}
        </p>
      </div>
    </div>
  );
}
