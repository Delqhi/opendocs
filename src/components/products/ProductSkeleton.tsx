'use client'

export function ProductSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 animate-pulse">
      {/* Image Skeleton */}
      <div className="aspect-square bg-gray-200 dark:bg-gray-700" />

      {/* Content Skeleton */}
      <div className="p-4 space-y-3">
        {/* Category */}
        <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded" />

        {/* Title */}
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
        </div>

        {/* Rating */}
        <div className="flex gap-1">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="w-3.5 h-3.5 bg-gray-200 dark:bg-gray-700 rounded" />
          ))}
        </div>

        {/* Price */}
        <div className="flex items-center gap-2">
          <div className="h-5 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-4 w-14 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
      </div>
    </div>
  )
}

export function ProductDetailSkeleton() {
  return (
    <div className="grid md:grid-cols-2 gap-8 lg:gap-12 animate-pulse">
      {/* Image Gallery Skeleton */}
      <div className="space-y-4">
        <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-2xl" />
        <div className="flex gap-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-xl" />
          ))}
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="space-y-6">
        {/* Category */}
        <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded" />

        {/* Title */}
        <div className="space-y-2">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
        </div>

        {/* Rating */}
        <div className="flex items-center gap-3">
          <div className="flex gap-1">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded" />
            ))}
          </div>
          <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>

        {/* Price */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-28 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
        </div>

        {/* Quantity & Add to Cart */}
        <div className="flex gap-4">
          <div className="h-14 w-32 bg-gray-200 dark:bg-gray-700 rounded-xl" />
          <div className="h-14 flex-1 bg-gray-200 dark:bg-gray-700 rounded-xl" />
        </div>

        {/* Features */}
        <div className="grid grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-200 dark:bg-gray-700 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  )
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {[...Array(count)].map((_, i) => (
        <ProductSkeleton key={i} />
      ))}
    </div>
  )
}
