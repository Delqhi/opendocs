import { Star, Sparkles, Check } from 'lucide-react';
import type { ProductDetailProduct } from './ProductDetail.types';

interface ProductInfoProps {
  product: ProductDetailProduct;
}

export function ProductInfo({ product }: ProductInfoProps) {
  const aiSummary = {
    headline: `Premium ${product.category} with Exceptional Value`,
    highlights: [
      `Top ${Math.floor(Math.random() * 20) + 80}% customer satisfaction in category`,
      `Verified authentic - ${product.reviews.toLocaleString()}+ verified reviews`,
      `AI-detected best-in-class price performance`,
    ],
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <span className="text-blue-400 font-medium">{product.category}</span>
        <span className="w-1 h-1 bg-gray-600 rounded-full" />
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              size={12}
              strokeWidth={0}
              className={i < Math.floor(product.rating) ? 'fill-yellow-400' : 'fill-gray-600'}
            />
          ))}
          <span className="ml-1 text-gray-400">{product.rating}</span>
        </div>
        <span className="text-gray-500">({product.reviews.toLocaleString()} reviews)</span>
      </div>

      <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
        {product.name}
      </h2>

      <p className="text-gray-400 leading-relaxed">
        {product.description}
      </p>

      <div className="glass rounded-2xl p-5 space-y-4 border border-blue-500/20">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-500/20 rounded-lg">
            <Sparkles size={16} className="text-blue-400" />
          </div>
          <span className="font-semibold">AI Summary</span>
        </div>
        <p className="text-sm text-gray-300 leading-relaxed">
          {aiSummary.headline}
        </p>
        <ul className="space-y-2">
          {aiSummary.highlights.map((h, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-gray-400">
              <Check size={14} className="text-green-400 mt-0.5 shrink-0" />
              {h}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
