import { ArrowLeft, X, Check, Minus } from 'lucide-react';
import { useShopStore } from '../store/shopStore';
import { useFormatPrice } from './CurrencySelector';

interface CompareViewProps {
  onBack: () => void;
  onSelect: (productId: string) => void;
}

export function CompareView({ onBack, onSelect }: CompareViewProps) {
  const { compareList, products, toggleCompare } = useShopStore();
  const formatPrice = useFormatPrice();

  const items = compareList.map((id) => products.find((p) => p.id === id)).filter(Boolean);

  if (items.length === 0) {
    return (
      <div className="surface border border-subtle rounded-3xl p-8 text-center">
        <h2 className="text-lg font-semibold text-foreground">Compare list is empty</h2>
        <p className="text-sm text-muted mt-1">Add 2-4 products to compare side by side.</p>
        <button onClick={onBack} className="mt-4 px-4 py-2 rounded-xl bg-foreground text-white text-sm font-semibold">Back to shop</button>
      </div>
    );
  }

  const rows = [
    { label: 'Price', value: (p: NonNullable<(typeof items)[number]>) => formatPrice(p.price) },
    { label: 'Rating', value: (p: NonNullable<(typeof items)[number]>) => `${p.rating} (${p.reviews})` },
    { label: 'Stock', value: (p: NonNullable<(typeof items)[number]>) => p.stock > 50 ? 'In stock' : `Only ${p.stock}` },
    { label: 'Demand', value: (p: NonNullable<(typeof items)[number]>) => `${p.demandScore}/100` },
    { label: 'AI Score', value: (p: NonNullable<(typeof items)[number]>) => `${p.aiScore}/100` },
    { label: 'Source', value: (p: NonNullable<(typeof items)[number]>) => p.sourceType ?? 'dropship' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-2 text-xs text-muted hover:text-foreground">
          <ArrowLeft className="w-4 h-4" /> Back to shop
        </button>
        <div className="text-xs text-muted">Comparing {items.length} products</div>
      </div>

      <div className="grid gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {items.map((product) => product && (
            <div key={product.id} className="surface border border-subtle rounded-2xl overflow-hidden">
              <img src={product.image} alt={product.name} className="w-full h-40 object-cover" />
              <div className="p-3 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold text-foreground line-clamp-2">{product.name}</p>
                  <button onClick={() => toggleCompare(product.id)} className="text-muted hover:text-foreground">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <button onClick={() => onSelect(product.id)} className="text-xs text-blue-500 hover:text-blue-600">
                  View details
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="surface border border-subtle rounded-2xl overflow-hidden">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0">
            {items.map((product, idx) => (
              <div key={product?.id ?? idx} className={`p-4 border-t border-subtle ${idx > 0 ? 'sm:border-l' : ''}`}>
                {rows.map((row) => (
                  <div key={row.label} className="flex items-center justify-between text-xs py-2">
                    <span className="text-muted">{row.label}</span>
                    <span className="text-foreground font-medium">
                      {product ? row.value(product) : <Minus className="w-3 h-3" />}
                    </span>
                  </div>
                ))}
                <div className="mt-2 flex items-center gap-2 text-xs text-emerald-500">
                  <Check className="w-3 h-3" /> Verified pick
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
