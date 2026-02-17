import { Clock, ChevronRight } from 'lucide-react';
import { useShopStore } from '../store/shopStore';
import { useFormatPrice } from './CurrencySelector';

interface RecentlyViewedProps {
  onProductClick: (productId: string) => void;
}

export function RecentlyViewed({ onProductClick }: RecentlyViewedProps) {
  const { recentlyViewed, products } = useShopStore();
  const formatPrice = useFormatPrice();

  const recentProducts = recentlyViewed
    .map(id => products.find(p => p.id === id))
    .filter(Boolean)
    .slice(0, 6);

  if (recentProducts.length === 0) return null;

  return (
    <section className="mt-12 sm:mt-16">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-gray-400" />
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
            Recently Viewed
          </h2>
        </div>
        <button className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
          View All <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 no-scrollbar">
        {recentProducts.map((product) => product && (
          <button
            key={product.id}
            onClick={() => onProductClick(product.id)}
            className="shrink-0 w-36 sm:w-44 group text-left"
          >
            <div className="aspect-square rounded-xl overflow-hidden bg-gray-100 dark:bg-dark-800 mb-2">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
            </div>
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {product.name}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {formatPrice(product.price)}
            </p>
          </button>
        ))}
      </div>
    </section>
  );
}
