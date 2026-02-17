import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import api from '../../../lib/api/client';
import { ProductCard } from './ProductCard';
import { Sparkles } from 'lucide-react';

export const SmartRecommendations: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRecs = async () => {
      try {
        const response = await api.get('/recommendations');
        setProducts(response.data);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRecs();
  }, []);

  if (isLoading || products.length === 0) return null;

  return (
    <section className="py-12 border-t border-white/5">
      <div className="flex items-center gap-2 mb-8">
        <Sparkles className="text-blue-400" size={20} />
        <h2 className="text-2xl font-bold">Recommended for You</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
};
