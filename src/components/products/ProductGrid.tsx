'use client'

import { motion } from 'framer-motion'
import { ProductCard } from './ProductCard'
import { ProductSkeleton } from './ProductSkeleton'
import type { Product } from '@/types'

interface ProductGridProps {
  products: Product[]
  loading?: boolean
  columns?: 2 | 3 | 4
  emptyMessage?: string
}

export function ProductGrid({
  products,
  loading = false,
  columns = 4,
  emptyMessage = 'Keine Produkte gefunden.',
}: ProductGridProps) {
  const gridCols = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  }

  if (loading) {
    return (
      <div className={`grid ${gridCols[columns]} gap-6`}>
        {[...Array(8)].map((_, i) => (
          <ProductSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center py-16"
      >
        <div className="w-24 h-24 mb-6 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
          <svg
            className="w-12 h-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
            />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          {emptyMessage}
        </h3>
        <p className="text-gray-500 dark:text-gray-400 text-center max-w-md">
          Versuche es mit anderen Filtern oder schaue später nochmal vorbei.
        </p>
      </motion.div>
    )
  }

  return (
    <div className={`grid ${gridCols[columns]} gap-6`}>
      {products.map((product, index) => (
        <ProductCard key={product.id} product={product} index={index} />
      ))}
    </div>
  )
}

// Featured Products Grid with special layout
interface FeaturedGridProps {
  products: Product[]
  title?: string
  subtitle?: string
}

export function FeaturedGrid({ products, title, subtitle }: FeaturedGridProps) {
  if (products.length === 0) return null

  const [featured, ...rest] = products

  return (
    <div className="space-y-6">
      {(title || subtitle) && (
        <div className="text-center mb-8">
          {title && (
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="text-gray-600 dark:text-gray-400">{subtitle}</p>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Featured Product - Larger */}
        <div className="md:col-span-2 md:row-span-2">
          <ProductCard product={featured} index={0} />
        </div>

        {/* Other Products */}
        {rest.slice(0, 4).map((product, index) => (
          <ProductCard key={product.id} product={product} index={index + 1} />
        ))}
      </div>
    </div>
  )
}
