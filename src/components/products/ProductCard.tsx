'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ShoppingCart, Heart, Eye, Star } from 'lucide-react'
import { useCartStore } from '@/lib/store'
import { formatPrice, calculateDiscount, cn } from '@/lib/utils'
import { Badge, NewBadge, SaleBadge } from '@/components/ui/Badge'
import type { Product } from '@/types'

interface ProductCardProps {
  product: Product
  index?: number
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { addItem } = useCartStore()

  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price
  const discountPercent = hasDiscount
    ? calculateDiscount(product.compareAtPrice!, product.price)
    : 0

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.images[0] || '/placeholder.jpg',
    })
  }

  // Calculate average rating
  const avgRating = product.reviews && product.reviews.length > 0
    ? product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length
    : 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
    >
      <Link href={`/products/${product.id}`}>
        <div className="group relative bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:shadow-xl hover:shadow-fuchsia-500/10 dark:hover:shadow-fuchsia-500/5 hover:-translate-y-1">
          {/* Image Container */}
          <div className="relative aspect-square overflow-hidden bg-gray-100 dark:bg-gray-900">
            <Image
              src={product.images[0] || '/placeholder.jpg'}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
            
            {/* Badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-2">
              {product.isNew && <NewBadge />}
              {hasDiscount && <SaleBadge discount={discountPercent} />}
            </div>

            {/* Quick Actions */}
            <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 transform translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
              <button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                }}
                className="p-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-fuchsia-500 hover:text-white transition-colors"
                aria-label="Zur Wunschliste hinzufügen"
              >
                <Heart className="w-4 h-4" />
              </button>
              <button
                className="p-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-fuchsia-500 hover:text-white transition-colors"
                aria-label="Schnellansicht"
              >
                <Eye className="w-4 h-4" />
              </button>
            </div>

            {/* Add to Cart Button */}
            <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
              <button
                onClick={handleAddToCart}
                disabled={!product.inStock}
                className={cn(
                  'w-full py-3 px-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-200',
                  product.inStock
                    ? 'bg-fuchsia-500 text-white hover:bg-fuchsia-600 shadow-lg'
                    : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                )}
              >
                <ShoppingCart className="w-4 h-4" />
                {product.inStock ? 'In den Warenkorb' : 'Ausverkauft'}
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            {/* Category */}
            {product.category && (
              <p className="text-xs text-fuchsia-500 dark:text-fuchsia-400 font-medium mb-1 uppercase tracking-wide">
                {product.category.name}
              </p>
            )}

            {/* Title */}
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-fuchsia-500 transition-colors">
              {product.name}
            </h3>

            {/* Rating */}
            {avgRating > 0 && (
              <div className="flex items-center gap-1 mb-2">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        'w-3.5 h-3.5',
                        i < Math.round(avgRating)
                          ? 'text-amber-400 fill-current'
                          : 'text-gray-300 dark:text-gray-600'
                      )}
                    />
                  ))}
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  ({product.reviews?.length || 0})
                </span>
              </div>
            )}

            {/* Price */}
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-gray-900 dark:text-white">
                {formatPrice(product.price)}
              </span>
              {hasDiscount && (
                <span className="text-sm text-gray-400 line-through">
                  {formatPrice(product.compareAtPrice!)}
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
