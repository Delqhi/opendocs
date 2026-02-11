'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Trash2, Plus, Minus, ArrowLeft, ShoppingBag, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useCartStore } from '@/lib/store'
import { formatPrice } from '@/lib/utils'

export default function CartPage() {
  const { items, updateQuantity, removeItem, total, itemCount, clearCart } = useCartStore()

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <ShoppingBag className="w-12 h-12 text-gray-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Dein Warenkorb ist leer
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Entdecke unsere Produkte und füge sie deinem Warenkorb hinzu.
            </p>
            <Link href="/products">
              <Button leftIcon={<ArrowLeft className="w-4 h-4" />}>
                Weiter einkaufen
              </Button>
            </Link>
          </motion.div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Warenkorb ({itemCount} {itemCount === 1 ? 'Artikel' : 'Artikel'})
          </h1>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6"
              >
                <div className="flex gap-4 sm:gap-6">
                  {/* Image */}
                  <Link href={`/products/${item.id}`} className="flex-shrink-0">
                    <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </Link>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <Link href={`/products/${item.id}`}>
                      <h3 className="font-semibold text-gray-900 dark:text-white hover:text-fuchsia-500 transition-colors truncate">
                        {item.name}
                      </h3>
                    </Link>

                    <p className="text-lg font-bold text-fuchsia-500 mt-1">
                      {formatPrice(item.price)}
                    </p>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-4 mt-4">
                      <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg">
                        <button
                          onClick={() =>
                            updateQuantity(item.id, Math.max(1, item.quantity - 1))
                          }
                          disabled={item.quantity <= 1}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 rounded-l-lg transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="px-4 py-2 font-medium min-w-[40px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-r-lg transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                        aria-label="Entfernen"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Item Total (Desktop) */}
                  <div className="hidden sm:block text-right">
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Clear Cart Button */}
            <div className="flex justify-end pt-4">
              <button
                onClick={clearCart}
                className="text-sm text-gray-500 hover:text-red-500 transition-colors"
              >
                Warenkorb leeren
              </button>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 sticky top-24"
            >
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                Bestellübersicht
              </h2>

              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Zwischensumme</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {formatPrice(total)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Versand</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {total >= 50 ? 'Kostenlos' : formatPrice(4.99)}
                  </span>
                </div>

                {total < 50 && (
                  <p className="text-sm text-fuchsia-500">
                    Nur noch {formatPrice(50 - total)} bis zum kostenlosen Versand!
                  </p>
                )}

                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <div className="flex justify-between">
                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                      Gesamt
                    </span>
                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                      {formatPrice(total >= 50 ? total : total + 4.99)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    inkl. MwSt.
                  </p>
                </div>
              </div>

              <Link href="/checkout" className="block mt-6">
                <Button fullWidth size="lg" rightIcon={<ArrowRight className="w-5 h-5" />}>
                  Zur Kasse
                </Button>
              </Link>

              <Link
                href="/products"
                className="block text-center mt-4 text-gray-600 dark:text-gray-400 hover:text-fuchsia-500 transition-colors"
              >
                Weiter einkaufen
              </Link>

              {/* Payment Methods */}
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-3">
                  Sichere Zahlungsmethoden
                </p>
                <div className="flex justify-center gap-2 text-2xl">
                  💳 🏦 📱
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </main>
  )
}
