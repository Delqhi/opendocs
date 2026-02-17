import { Suspense, use } from 'react';
import { useCatalogStore } from '../hooks/useCatalog';
import { type CatalogProduct } from '../services/catalogService';
import { ProductCard } from './ProductCard';
import { ProductGridSkeleton } from '../../../components/SkeletonLoader';

function ProductList({ productsPromise }: { productsPromise: Promise<CatalogProduct[]> }) {
  const products = use(productsPromise);

  if (products.length === 0) {
    return (
      <div className="col-span-full text-center py-20 text-gray-500">
        No products found.
      </div>
    );
  }

  return (
    <>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </>
  );
}

export const ProductGrid = () => {
  const { products, initProducts } = useCatalogStore();
  const productsPromise = initProducts();

  if (products.length > 0) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <Suspense fallback={<ProductGridSkeleton count={8} />}>
        <ProductList productsPromise={productsPromise} />
      </Suspense>
    </div>
  );
};
