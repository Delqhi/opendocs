'use client'

import { useState, useMemo } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShoppingCart,
  Heart,
  Share2,
  Truck,
  Shield,
  RotateCcw,
  Star,
  Minus,
  Plus,
  ChevronLeft,
  Check,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge, StockBadge, NewBadge, SaleBadge } from '@/components/ui/Badge'
import { ProductGrid } from '@/components/products/ProductGrid'
import { ProductDetailSkeleton } from '@/components/products/ProductSkeleton'
import { useCartStore } from '@/lib/store'
import { formatPrice, calculateDiscount, cn } from '@/lib/utils'
import { sampleProducts, getRelatedProducts } from '@/data/sample-products'

export default function ProductDetailPage() {
  const params = useParams()
  const productId = params.id as string

  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const { addItem } = useCartStore()

  // Find product
  const product = useMemo(
    () => sampleProducts.find((p) => p.id === productId),
    [productId]
  )

  // Get related products
  const relatedProducts = useMemo(
    () => (product ? getRelatedProducts(product.id, 4) : []),
    [product]
  )

  if (!product) {
    return (
      <main className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ProductDetailSkeleton />
        </div>
      </main>
    )
  }

  const hasDiscount =
    product.compareAtPrice && product.compareAtPrice > product.price
  const discountPercent = hasDiscount
    ? calculateDiscount(product.compareAtPrice!, product.price)
    : 0

  const avgRating =
    product.reviews && product.reviews.length > 0
      ? product.reviews.reduce((acc, r) => acc + r.rating, 0) /
        product.reviews.length
      : 0

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity,
      image: product.images[0] || '/placeholder.jpg',
    })
  }

  const incrementQuantity = () => setQuantity((q) => Math.min(q + 1, product.stock || 99))
  const decrementQuantity = () => setQuantity((q) => Math.max(q - 1, 1))

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Breadcrumb */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center gap-2 text-sm">
            <Link href="/" className="text-gray-500 hover:text-fuchsia-500">
              Home
            </Link>
            <span className="text-gray-400">/</span>
            <Link href="/products" className="text-gray-500 hover:text-fuchsia-500">
              Produkte
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900 dark:text-white font-medium truncate">
              {product.name}
            </span>
          </nav>
        </div>
      </div>

      {/* Product Detail */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {/* Image Gallery */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            {/* Main Image */}
            <div className="relative aspect-square bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedImage}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0"
                >
                  <Image
                    src={product.images[selectedImage] || '/placeholder.jpg'}
                    alt={product.name}
                    fill
                    className="object-cover"
                    priority
                  />
                </motion.div>
              </AnimatePresence>

              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {product.isNew && <NewBadge />}
                {hasDiscount && <SaleBadge discount={discountPercent} />}
              </div>

              {/* Wishlist Button */}
              <button
                onClick={() => setIsWishlisted(!isWishlisted)}
                className={cn(
                  'absolute top-4 right-4 p-3 rounded-full transition-all',
                  isWishlisted
                    ? 'bg-red-500 text-white'
                    : 'bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-gray-600 dark:text-gray-300 hover:text-red-500'
                )}
              >
                <Heart className={cn('w-5 h-5', isWishlisted && 'fill-current')} />
              </button>
            </div>

            {/* Thumbnail Gallery */}
            {product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={cn(
                      'relative w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all',
                      selectedImage === index
                        ? 'border-fuchsia-500'
                        : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                    )}
                  >
                    <Image
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Category */}
            {product.category && (
              <Link
                href={`/products?category=${product.category.slug}`}
                className="inline-block text-sm text-fuchsia-500 dark:text-fuchsia-400 font-medium hover:underline uppercase tracking-wide"
              >
                {product.category.name}
              </Link>
            )}

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              {product.name}
            </h1>

            {/* Rating */}
            {avgRating > 0 && (
              <div className="flex items-center gap-3">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        'w-5 h-5',
                        i < Math.round(avgRating)
                          ? 'text-amber-400 fill-current'
                          : 'text-gray-300 dark:text-gray-600'
                      )}
                    />
                  ))}
                </div>
                <span className="text-gray-600 dark:text-gray-400">
                  {avgRating.toFixed(1)} ({product.reviews?.length} Bewertungen)
                </span>
              </div>
            )}

            {/* Price */}
            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold text-gray-900 dark:text-white">
                {formatPrice(product.price)}
              </span>
              {hasDiscount && (
                <>
                  <span className="text-xl text-gray-400 line-through">
                    {formatPrice(product.compareAtPrice!)}
                  </span>
                  <Badge variant="danger">-{discountPercent}%</Badge>
                </>
              )}
            </div>

            {/* Stock Status */}
            <StockBadge inStock={product.inStock} />

            {/* Description */}
            {product.description && (
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                {product.description}
              </p>
            )}

            {/* Quantity & Add to Cart */}
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Quantity Selector */}
              <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-xl">
                <button
                  onClick={decrementQuantity}
                  disabled={quantity <= 1}
                  className="p-3 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 rounded-l-xl transition-colors"
                >
                  <Minus className="w-5 h-5" />
                </button>
                <span className="px-6 py-3 font-semibold text-center min-w-[60px]">
                  {quantity}
                </span>
                <button
                  onClick={incrementQuantity}
                  disabled={quantity >= (product.stock || 99)}
                  className="p-3 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 rounded-r-xl transition-colors"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              {/* Add to Cart Button */}
              <Button
                size="lg"
                onClick={handleAddToCart}
                disabled={!product.inStock}
                leftIcon={<ShoppingCart className="w-5 h-5" />}
                className="flex-1"
              >
                {product.inStock ? 'In den Warenkorb' : 'Ausverkauft'}
              </Button>
            </div>

            {/* Share */}
            <button className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-fuchsia-500 transition-colors">
              <Share2 className="w-5 h-5" />
              <span>Teilen</span>
            </button>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
              {[
                { icon: Truck, title: 'Kostenloser Versand', desc: 'Ab 50€ Bestellwert' },
                { icon: Shield, title: '2 Jahre Garantie', desc: 'Volle Absicherung' },
                { icon: RotateCcw, title: '30 Tage Rückgabe', desc: 'Kostenlos retournieren' },
                { icon: Check, title: 'Sichere Zahlung', desc: 'SSL-verschlüsselt' },
              ].map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-fuchsia-100 dark:bg-fuchsia-900/30 flex items-center justify-center">
                    <feature.icon className="w-5 h-5 text-fuchsia-600 dark:text-fuchsia-400" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white text-sm">
                      {feature.title}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {feature.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-20"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-8">
              Das könnte dir auch gefallen
            </h2>
            <ProductGrid products={relatedProducts} columns={4} />
          </motion.section>
        )}
      </div>
    </main>
  )
}
