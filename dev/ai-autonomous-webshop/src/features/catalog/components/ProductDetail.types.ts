import { use, useState, useEffect } from 'react';
import api from '../../../lib/api/client';

export interface ProductDetailProduct {
  id: number;
  name: string;
  description: string;
  price: number;
  originalPrice: number;
  category: string;
  image: string;
  images?: string[];
  videoUrl?: string;
  rating: number;
  reviews: number;
  stock: number;
  demandScore: number;
  sold: number;
  badge?: string;
  tags: string[];
  aiInsights?: {
    fitScore: number;
    valueIntegrity: number;
    demandVelocity: number;
    reasoning: string;
  };
  marketComparison?: {
    competitor: string;
    price: number;
  }[];
  ugcPhotos?: string[];
  specifications?: Record<string, string>;
}

export interface LiveActivity {
  viewers: number;
  purchasesLastHour: number;
  stockLevel: 'high' | 'medium' | 'low' | 'critical';
  restockDate?: string;
}

export interface ProductDetailState {
  product: ProductDetailProduct | null;
  liveActivity: LiveActivity | null;
  isLoading: boolean;
  error: Error | null;
}

function ProductDetailResource(productId: number) {
  return {
    product: api.get(`/products/${productId}`).then((res) => res.data),
    liveActivity: api.get(`/products/${productId}/activity`).then((res) => res.data).catch(() => null),
  };
}

export function useProductDetail(productId: number) {
  const { product, liveActivity } = use(ProductDetailResource(productId));
  
  return {
    product: product as ProductDetailProduct | null,
    liveActivity: liveActivity as LiveActivity | null,
  };
}

export function useProductDetailSync(productId: number) {
  const [state, setState] = useState<ProductDetailState>({
    product: null,
    liveActivity: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    let mounted = true;

    async function fetchData() {
      try {
        const [productRes, activityRes] = await Promise.all([
          api.get(`/products/${productId}`),
          api.get(`/products/${productId}/activity`).catch(() => ({ data: null })),
        ]);

        if (!mounted) return;

        setState({
          product: productRes.data,
          liveActivity: activityRes.data,
          isLoading: false,
          error: null,
        });
      } catch (err) {
        if (!mounted) return;
        setState(prev => ({ ...prev, isLoading: false, error: err as Error }));
      }
    }

    fetchData();
    return () => { mounted = false; };
  }, [productId]);

  return state;
}
