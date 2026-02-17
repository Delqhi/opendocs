import React, { Suspense, ReactNode } from 'react';
import { ProductCardSkeleton } from './ProductCardSkeleton';
import { ProductDetailSkeleton } from './ProductDetailSkeleton';
import { AdminStatsSkeleton } from './AdminStatsSkeleton';
import { ErrorBoundary, ErrorFallback } from './ErrorBoundary';

interface SuspenseFallbackProps {
  type?: 'product-card' | 'product-detail' | 'admin-stats' | 'custom';
  count?: number;
  customFallback?: ReactNode;
}

export function SuspenseFallback({ 
  type = 'product-card', 
  count = 1,
  customFallback 
}: SuspenseFallbackProps) {
  if (customFallback) {
    return <>{customFallback}</>;
  }

  switch (type) {
    case 'product-card':
      return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: count }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      );
    case 'product-detail':
      return <ProductDetailSkeleton />;
    case 'admin-stats':
      return <AdminStatsSkeleton />;
    default:
      return (
        <div className="animate-pulse bg-white/5 rounded-lg h-32 w-full" />
      );
  }
}

interface SuspenseWrapperProps {
  children: ReactNode;
  type?: 'product-card' | 'product-detail' | 'admin-stats' | 'custom';
  count?: number;
  customFallback?: ReactNode;
  errorFallback?: ReactNode;
}

export function SuspenseWrapper({
  children,
  type = 'product-card',
  count = 1,
  customFallback,
  errorFallback
}: SuspenseWrapperProps) {
  return (
    <ErrorBoundary fallback={errorFallback}>
      <Suspense fallback={<SuspenseFallback type={type} count={count} customFallback={customFallback} />}>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
}

export { 
  ProductCardSkeleton, 
  ProductDetailSkeleton, 
  AdminStatsSkeleton,
  ErrorBoundary,
  ErrorFallback
};
