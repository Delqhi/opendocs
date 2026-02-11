'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Filter, X, ChevronDown, ChevronUp, SlidersHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import type { Category } from '@/types'

export interface FilterState {
  categories: string[]
  priceRange: [number, number]
  inStock: boolean | null
  sortBy: string
  search: string
}

interface ProductFiltersProps {
  categories: Category[]
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
  minPrice?: number
  maxPrice?: number
  productCount?: number
}

const sortOptions = [
  { value: 'newest', label: 'Neueste zuerst' },
  { value: 'price-asc', label: 'Preis: aufsteigend' },
  { value: 'price-desc', label: 'Preis: absteigend' },
  { value: 'name-asc', label: 'Name: A-Z' },
  { value: 'name-desc', label: 'Name: Z-A' },
  { value: 'popular', label: 'Beliebteste' },
]

export function ProductFilters({
  categories,
  filters,
  onFiltersChange,
  minPrice = 0,
  maxPrice = 1000,
  productCount = 0,
}: ProductFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [expandedSections, setExpandedSections] = useState<string[]>(['categories', 'price'])

  const toggleSection = (section: string) => {
    setExpandedSections((prev) =>
      prev.includes(section) ? prev.filter((s) => s !== section) : [...prev, section]
    )
  }

  const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const toggleCategory = (categoryId: string) => {
    const newCategories = filters.categories.includes(categoryId)
      ? filters.categories.filter((c) => c !== categoryId)
      : [...filters.categories, categoryId]
    updateFilter('categories', newCategories)
  }

  const clearAllFilters = () => {
    onFiltersChange({
      categories: [],
      priceRange: [minPrice, maxPrice],
      inStock: null,
      sortBy: 'newest',
      search: '',
    })
  }

  const activeFilterCount =
    filters.categories.length +
    (filters.inStock !== null ? 1 : 0) +
    (filters.priceRange[0] !== minPrice || filters.priceRange[1] !== maxPrice ? 1 : 0)

  const FilterSection = ({
    title,
    section,
    children,
  }: {
    title: string
    section: string
    children: React.ReactNode
  }) => {
    const isExpanded = expandedSections.includes(section)

    return (
      <div className="border-b border-gray-200 dark:border-gray-700 py-4">
        <button
          onClick={() => toggleSection(section)}
          className="flex items-center justify-between w-full text-left"
        >
          <span className="font-semibold text-gray-900 dark:text-white">{title}</span>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-500" />
          )}
        </button>
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="pt-4">{children}</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  const FilterContent = () => (
    <>
      {/* Sort */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Sortieren nach
        </label>
        <select
          value={filters.sortBy}
          onChange={(e) => updateFilter('sortBy', e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent"
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Categories */}
      <FilterSection title="Kategorien" section="categories">
        <div className="space-y-2">
          {categories.map((category) => (
            <label
              key={category.id}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <div
                className={cn(
                  'w-5 h-5 rounded border-2 flex items-center justify-center transition-all',
                  filters.categories.includes(category.id)
                    ? 'bg-fuchsia-500 border-fuchsia-500'
                    : 'border-gray-300 dark:border-gray-600 group-hover:border-fuchsia-400'
                )}
              >
                {filters.categories.includes(category.id) && (
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <span
                onClick={() => toggleCategory(category.id)}
                className="text-gray-700 dark:text-gray-300 group-hover:text-fuchsia-500 transition-colors"
              >
                {category.name}
              </span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Price Range */}
      <FilterSection title="Preis" section="price">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="text-xs text-gray-500 dark:text-gray-400">Min</label>
              <input
                type="number"
                value={filters.priceRange[0]}
                onChange={(e) =>
                  updateFilter('priceRange', [Number(e.target.value), filters.priceRange[1]])
                }
                min={minPrice}
                max={filters.priceRange[1]}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm"
              />
            </div>
            <span className="text-gray-400 mt-4">-</span>
            <div className="flex-1">
              <label className="text-xs text-gray-500 dark:text-gray-400">Max</label>
              <input
                type="number"
                value={filters.priceRange[1]}
                onChange={(e) =>
                  updateFilter('priceRange', [filters.priceRange[0], Number(e.target.value)])
                }
                min={filters.priceRange[0]}
                max={maxPrice}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm"
              />
            </div>
          </div>
          <input
            type="range"
            min={minPrice}
            max={maxPrice}
            value={filters.priceRange[1]}
            onChange={(e) =>
              updateFilter('priceRange', [filters.priceRange[0], Number(e.target.value)])
            }
            className="w-full accent-fuchsia-500"
          />
        </div>
      </FilterSection>

      {/* Stock */}
      <FilterSection title="Verfügbarkeit" section="stock">
        <div className="space-y-2">
          {[
            { value: null, label: 'Alle Produkte' },
            { value: true, label: 'Auf Lager' },
            { value: false, label: 'Ausverkauft' },
          ].map((option) => (
            <label key={String(option.value)} className="flex items-center gap-3 cursor-pointer group">
              <div
                className={cn(
                  'w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all',
                  filters.inStock === option.value
                    ? 'border-fuchsia-500'
                    : 'border-gray-300 dark:border-gray-600'
                )}
              >
                {filters.inStock === option.value && (
                  <div className="w-2 h-2 rounded-full bg-fuchsia-500" />
                )}
              </div>
              <span
                onClick={() => updateFilter('inStock', option.value)}
                className="text-gray-700 dark:text-gray-300"
              >
                {option.label}
              </span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Clear Filters */}
      {activeFilterCount > 0 && (
        <div className="mt-6">
          <Button variant="outline" fullWidth onClick={clearAllFilters}>
            Filter zurücksetzen ({activeFilterCount})
          </Button>
        </div>
      )}
    </>
  )

  return (
    <>
      {/* Mobile Filter Toggle */}
      <div className="lg:hidden mb-4">
        <Button
          variant="outline"
          onClick={() => setIsOpen(true)}
          leftIcon={<SlidersHorizontal className="w-4 h-4" />}
          fullWidth
        >
          Filter {activeFilterCount > 0 && `(${activeFilterCount})`}
        </Button>
      </div>

      {/* Mobile Filter Drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed top-0 left-0 bottom-0 w-80 max-w-full bg-white dark:bg-gray-900 z-50 overflow-y-auto lg:hidden"
            >
              <div className="sticky top-0 bg-white dark:bg-gray-900 z-10 p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Filter</h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  {productCount} Produkte gefunden
                </p>
                <FilterContent />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <div className="hidden lg:block sticky top-24">
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Filter</h2>
            {activeFilterCount > 0 && (
              <Badge variant="primary">{activeFilterCount}</Badge>
            )}
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            {productCount} Produkte gefunden
          </p>
          <FilterContent />
        </div>
      </div>
    </>
  )
}

// Export default filter state
export const defaultFilterState: FilterState = {
  categories: [],
  priceRange: [0, 1000],
  inStock: null,
  sortBy: 'newest',
  search: '',
}
