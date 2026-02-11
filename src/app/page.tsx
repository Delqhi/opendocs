'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ArrowRight, Sparkles, Truck, Shield, CreditCard, Star, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { ProductGrid } from '@/components/products/ProductGrid'
import { sampleProducts, sampleCategories, getFeaturedProducts, getNewProducts } from '@/data/sample-products'

export default function HomePage() {
  const featuredProducts = getFeaturedProducts()
  const newProducts = getNewProducts()

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-fuchsia-900/20 to-gray-900">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-mesh opacity-50" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-fuchsia-500/30 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Text Content */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center lg:text-left"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="inline-flex items-center gap-2 bg-fuchsia-500/20 text-fuchsia-300 px-4 py-2 rounded-full text-sm font-medium mb-6"
              >
                <Sparkles className="w-4 h-4" />
                Neu: KI-gestütztes Einkaufserlebnis
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6"
              >
                Entdecke die
                <span className="block text-gradient">Zukunft des Shoppings</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-lg text-gray-300 mb-8 max-w-xl mx-auto lg:mx-0"
              >
                Erlebe ein vollständig autonomes Einkaufserlebnis mit KI-Beratung,
                automatischer Bestellabwicklung und schnellem Versand.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
              >
                <Link href="/products">
                  <Button size="lg" rightIcon={<ArrowRight className="w-5 h-5" />}>
                    Jetzt entdecken
                  </Button>
                </Link>
                <Link href="/about">
                  <Button variant="outline" size="lg">
                    Mehr erfahren
                  </Button>
                </Link>
              </motion.div>

              {/* Trust Badges */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="flex items-center gap-6 mt-10 justify-center lg:justify-start"
              >
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-amber-400 fill-current" />
                  ))}
                  <span className="text-gray-400 ml-2">4.9/5</span>
                </div>
                <div className="text-gray-400">
                  <span className="text-white font-semibold">10.000+</span> zufriedene Kunden
                </div>
              </motion.div>
            </motion.div>

            {/* Hero Image/Product Showcase */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="relative"
            >
              <div className="relative aspect-square max-w-lg mx-auto">
                <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-500 to-cyan-500 rounded-3xl blur-2xl opacity-30" />
                <div className="relative bg-gray-800/50 backdrop-blur-sm rounded-3xl border border-gray-700/50 p-8 h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-fuchsia-500 to-cyan-500 flex items-center justify-center">
                      <Sparkles className="w-16 h-16 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">KI Shopping Assistent</h3>
                    <p className="text-gray-400">Verfügbar 24/7 für deine Fragen</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Bar */}
      <section className="bg-white dark:bg-gray-800 border-y border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Truck, text: 'Kostenloser Versand', subtext: 'Ab 50€ Bestellwert' },
              { icon: Shield, text: 'Sichere Zahlung', subtext: '100% verschlüsselt' },
              { icon: CreditCard, text: 'Flexible Zahlung', subtext: 'Klarna, PayPal & mehr' },
              { icon: Sparkles, text: 'KI-Beratung', subtext: '24/7 verfügbar' },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-3"
              >
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-fuchsia-100 dark:bg-fuchsia-900/30 flex items-center justify-center">
                  <feature.icon className="w-6 h-6 text-fuchsia-600 dark:text-fuchsia-400" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white text-sm">{feature.text}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{feature.subtext}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 lg:py-24 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Beliebte Kategorien
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Entdecke unsere handverlesenen Produktkategorien für jeden Geschmack
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {sampleCategories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
              >
                <Link href={`/products?category=${category.slug}`}>
                  <div className="group relative bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 text-center hover:shadow-xl hover:border-fuchsia-500 dark:hover:border-fuchsia-400 transition-all duration-300 hover:-translate-y-1">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-br from-fuchsia-100 to-cyan-100 dark:from-fuchsia-900/30 dark:to-cyan-900/30 flex items-center justify-center text-3xl">
                      {category.image || '📦'}
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-fuchsia-500 transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {category.productCount} Produkte
                    </p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12"
          >
            <div>
              <div className="flex items-center gap-2 text-fuchsia-500 dark:text-fuchsia-400 mb-2">
                <TrendingUp className="w-5 h-5" />
                <span className="text-sm font-semibold uppercase tracking-wide">Bestseller</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                Top Produkte
              </h2>
            </div>
            <Link href="/products?sort=popular">
              <Button variant="outline" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Alle ansehen
              </Button>
            </Link>
          </motion.div>

          <ProductGrid products={featuredProducts} columns={4} />
        </div>
      </section>

      {/* New Arrivals */}
      <section className="py-16 lg:py-24 bg-gray-50 dark:bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12"
          >
            <div>
              <div className="flex items-center gap-2 text-cyan-500 dark:text-cyan-400 mb-2">
                <Sparkles className="w-5 h-5" />
                <span className="text-sm font-semibold uppercase tracking-wide">Neu eingetroffen</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                Neuheiten
              </h2>
            </div>
            <Link href="/products?sort=newest">
              <Button variant="outline" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Alle Neuheiten
              </Button>
            </Link>
          </motion.div>

          <ProductGrid products={newProducts} columns={4} />
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-fuchsia-600 to-cyan-600 p-8 md:p-12 lg:p-16"
          >
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full blur-3xl" />
              <div className="absolute bottom-0 right-0 w-60 h-60 bg-white rounded-full blur-3xl" />
            </div>

            <div className="relative grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  Bleib auf dem Laufenden
                </h2>
                <p className="text-white/80 text-lg">
                  Melde dich für unseren Newsletter an und erhalte exklusive Angebote,
                  Rabattcodes und die neuesten Produkte direkt in dein Postfach.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  placeholder="Deine E-Mail-Adresse"
                  className="flex-1 px-5 py-4 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
                />
                <Button
                  variant="secondary"
                  size="lg"
                  className="bg-white text-fuchsia-600 hover:bg-gray-100 shadow-lg"
                >
                  Anmelden
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  )
}
