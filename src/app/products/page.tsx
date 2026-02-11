'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { ProductGrid } from '@/components/products/ProductGrid'
import { ProductFilters, defaultFilterState } from '@/components/products/ProductFilters'
import type { FilterState } from '@/components/products/ProductFilters'
import { sampleProducts, sampleCategories } from '@/data/sample-products'
import { Input } from '@/components/ui/Input'
import { Search } from 'lucide-react'

export default function ProductsPage() {
  const [filters, setFilters] = useState<FilterState>(defaultFilterState)

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let result = [...sampleProducts]

    // Search filter
    if (filters.search) {
      const search = filters.search.toLowerCase()
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(search) ||
          p.description?.toLowerCase().includes(search)
      )
    }

    // Category filter
    if (filters.categories.length > 0) {
      result = result.filter((p) =>
        filters.categories.includes(p.categoryId || '')
      )
    }

    // Price range filter
    result = result.filter(
      (p) => p.price >= filters.priceRange[0] && p.price <= filters.priceRange[1]
    )

    // Stock filter
    if (filters.inStock !== null) {
      result = result.filter((p) => p.inStock === filters.inStock)
    }

    // Sort
    switch (filters.sortBy) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price)
        break
      case 'price-desc':
        result.sort((a, b) => b.price - a.price)
        break
      case 'name-asc':
        result.sort((a, b) => a.name.localeCompare(b.name))
        break
      case 'name-desc':
        result.sort((a, b) => b.name.localeCompare(a.name))
        break
      case 'popular':
        result.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0))
        break
      case 'newest':
      default:
        result.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0))
    }

    return result
  }, [filters])

  const maxPrice = Math.max(...sampleProducts.map((p) => p.price))

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Alle Produkte
            </h1>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Entdecke unsere gesamte Produktauswahl - von Technik über Mode bis hin zu Lifestyle-Produkten.
            </p>
          </motion.div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="max-w-xl mx-auto mt-6"
          >
            <Input
              placeholder="Produkte suchen..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              leftIcon={<Search className="w-5 h-5" />}
            />
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <aside className="lg:w-72 flex-shrink-0">
            <ProductFilters
              categories={sampleCategories}
              filters={filters}
              onFiltersChange={setFilters}
              minPrice={0}
              maxPrice={maxPrice}
              productCount={filteredProducts.length}
            />
          </aside>

          {/* Product Grid */}
          <div className="flex-1">
            <ProductGrid products={filteredProducts} columns={3} />
          </div>
        </div>
      </div>
    </main>
  )
}
