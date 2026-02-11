'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  ChartBarIcon,
  ShoppingBagIcon,
  UsersIcon,
  CubeIcon,
  CurrencyEuroIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  TruckIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline'
import { formatPrice, formatDate } from '@/lib/utils'
import { Button, Card, Input, Badge } from '@/components/ui'
import type { Order, Product, Supplier } from '@/types'

// Dashboard Stats
const stats = [
  {
    name: 'Umsatz heute',
    value: '€2,847.00',
    change: '+12.5%',
    trend: 'up',
    icon: CurrencyEuroIcon,
  },
  {
    name: 'Bestellungen',
    value: '156',
    change: '+8.2%',
    trend: 'up',
    icon: ShoppingBagIcon,
  },
  {
    name: 'Neue Kunden',
    value: '24',
    change: '+15.3%',
    trend: 'up',
    icon: UsersIcon,
  },
  {
    name: 'Produkte',
    value: '342',
    change: '-2.1%',
    trend: 'down',
    icon: CubeIcon,
  },
]

// Sample Orders
const recentOrders: Order[] = [
  {
    id: 'ORD-001',
    customerId: '1',
    items: [{ id: '1', productId: 'p1', productName: 'Wireless Kopfhörer', productImage: '', quantity: 1, price: 149.99 }],
    status: 'pending',
    subtotal: 149.99,
    shipping: 4.99,
    tax: 26.05,
    total: 181.03,
    shippingAddress: { id: '1', name: 'Max M.', street: 'Str. 1', city: 'Berlin', postalCode: '10115', country: 'DE' },
    billingAddress: { id: '1', name: 'Max M.', street: 'Str. 1', city: 'Berlin', postalCode: '10115', country: 'DE' },
    paymentMethod: 'stripe',
    paymentStatus: 'paid',
    createdAt: '2026-01-27T08:30:00Z',
    updatedAt: '2026-01-27T08:30:00Z',
  },
  {
    id: 'ORD-002',
    customerId: '2',
    items: [{ id: '2', productId: 'p2', productName: 'Smart Watch', productImage: '', quantity: 1, price: 299.99 }],
    status: 'processing',
    subtotal: 299.99,
    shipping: 0,
    tax: 50.40,
    total: 350.39,
    shippingAddress: { id: '2', name: 'Anna S.', street: 'Str. 2', city: 'München', postalCode: '80331', country: 'DE' },
    billingAddress: { id: '2', name: 'Anna S.', street: 'Str. 2', city: 'München', postalCode: '80331', country: 'DE' },
    paymentMethod: 'paypal',
    paymentStatus: 'paid',
    createdAt: '2026-01-27T07:15:00Z',
    updatedAt: '2026-01-27T09:00:00Z',
  },
  {
    id: 'ORD-003',
    customerId: '3',
    items: [{ id: '3', productId: 'p3', productName: 'Gaming Maus', productImage: '', quantity: 2, price: 79.99 }],
    status: 'shipped',
    subtotal: 159.98,
    shipping: 4.99,
    tax: 27.74,
    total: 192.71,
    shippingAddress: { id: '3', name: 'Peter K.', street: 'Str. 3', city: 'Hamburg', postalCode: '20095', country: 'DE' },
    billingAddress: { id: '3', name: 'Peter K.', street: 'Str. 3', city: 'Hamburg', postalCode: '20095', country: 'DE' },
    paymentMethod: 'klarna',
    paymentStatus: 'paid',
    trackingNumber: 'DHL-123456',
    createdAt: '2026-01-26T14:20:00Z',
    updatedAt: '2026-01-27T06:00:00Z',
  },
]

// Sample Pending Suppliers
const pendingSuppliers: Supplier[] = [
  {
    id: 's1',
    name: 'TechGadgets Pro',
    email: 'info@techgadgets.com',
    website: 'https://techgadgets.com',
    status: 'pending',
    rating: 4.5,
    orderCount: 0,
  },
  {
    id: 's2',
    name: 'HomeEssentials GmbH',
    email: 'kontakt@homeessentials.de',
    website: 'https://homeessentials.de',
    status: 'pending',
    rating: 4.2,
    orderCount: 0,
  },
]

// Sample Low Stock Products
const lowStockProducts: Product[] = [
  {
    id: 'ls1',
    name: 'USB-C Hub 7-in-1',
    description: '',
    price: 49.99,
    images: ['/placeholder-product.jpg'],
    category: 'Zubehör',
    categoryId: 'accessories',
    rating: 4.6,
    reviewCount: 89,
    stock: 3,
    createdAt: '',
    updatedAt: '',
  },
  {
    id: 'ls2',
    name: 'Wireless Charger 15W',
    description: '',
    price: 29.99,
    images: ['/placeholder-product.jpg'],
    category: 'Zubehör',
    categoryId: 'accessories',
    rating: 4.4,
    reviewCount: 156,
    stock: 5,
    createdAt: '',
    updatedAt: '',
  },
]

type TabType = 'dashboard' | 'orders' | 'products' | 'customers' | 'suppliers' | 'analytics'

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-500/20 text-yellow-400',
  confirmed: 'bg-blue-500/20 text-blue-400',
  processing: 'bg-purple-500/20 text-purple-400',
  shipped: 'bg-cyan-500/20 text-cyan-400',
  delivered: 'bg-green-500/20 text-green-400',
  cancelled: 'bg-red-500/20 text-red-400',
}

const statusLabels: Record<string, string> = {
  pending: 'Ausstehend',
  confirmed: 'Bestätigt',
  processing: 'In Bearbeitung',
  shipped: 'Versendet',
  delivered: 'Zugestellt',
  cancelled: 'Storniert',
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard')
  const [searchQuery, setSearchQuery] = useState('')

  const tabs = [
    { id: 'dashboard' as TabType, label: 'Dashboard', icon: ChartBarIcon },
    { id: 'orders' as TabType, label: 'Bestellungen', icon: ShoppingBagIcon },
    { id: 'products' as TabType, label: 'Produkte', icon: CubeIcon },
    { id: 'customers' as TabType, label: 'Kunden', icon: UsersIcon },
    { id: 'suppliers' as TabType, label: 'Lieferanten', icon: TruckIcon },
    { id: 'analytics' as TabType, label: 'Analytik', icon: ArrowTrendingUpIcon },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-black">
      {/* Admin Header */}
      <div className="border-b border-white/10 bg-gray-900/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold text-white">Admin Dashboard</h1>
              <span className="px-2 py-1 bg-fuchsia-500/20 text-fuchsia-400 text-xs rounded-full">
                Simone Shop
              </span>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Suchen..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-fuchsia-500 w-64"
                />
              </div>
              <Button size="sm" onClick={() => window.location.reload()}>
                <ArrowPathIcon className="w-4 h-4 mr-2" />
                Aktualisieren
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-4 overflow-x-auto pb-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-fuchsia-500/20 text-fuchsia-400'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat) => (
                <div key={stat.name} className="glass rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-lg bg-fuchsia-500/20 flex items-center justify-center">
                      <stat.icon className="w-6 h-6 text-fuchsia-400" />
                    </div>
                    <span className={`flex items-center gap-1 text-sm ${
                      stat.trend === 'up' ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {stat.trend === 'up' ? (
                        <ArrowTrendingUpIcon className="w-4 h-4" />
                      ) : (
                        <ArrowTrendingDownIcon className="w-4 h-4" />
                      )}
                      {stat.change}
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p className="text-sm text-gray-400">{stat.name}</p>
                </div>
              ))}
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recent Orders */}
              <div className="glass rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold text-white">Neueste Bestellungen</h2>
                  <Button size="sm" variant="ghost" onClick={() => setActiveTab('orders')}>
                    Alle anzeigen
                  </Button>
                </div>
                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                      <div>
                        <p className="font-mono text-white">{order.id}</p>
                        <p className="text-sm text-gray-400">{order.shippingAddress.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-white">{formatPrice(order.total)}</p>
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs ${statusColors[order.status]}`}>
                          {statusLabels[order.status]}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pending Actions */}
              <div className="space-y-6">
                {/* Pending Suppliers */}
                <div className="glass rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-white">Neue Lieferanten</h2>
                    <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full">
                      {pendingSuppliers.length} ausstehend
                    </span>
                  </div>
                  <div className="space-y-3">
                    {pendingSuppliers.map((supplier) => (
                      <div key={supplier.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <div>
                          <p className="font-semibold text-white">{supplier.name}</p>
                          <p className="text-sm text-gray-400">{supplier.email}</p>
                        </div>
                        <div className="flex gap-2">
                          <button className="p-2 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition">
                            <CheckCircleIcon className="w-5 h-5" />
                          </button>
                          <button className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition">
                            <XCircleIcon className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Low Stock Alert */}
                <div className="glass rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-white">Niedriger Bestand</h2>
                    <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-full">
                      {lowStockProducts.length} Produkte
                    </span>
                  </div>
                  <div className="space-y-3">
                    {lowStockProducts.map((product) => (
                      <div key={product.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded bg-gray-800" />
                          <div>
                            <p className="font-semibold text-white">{product.name}</p>
                            <p className="text-sm text-red-400">Nur noch {product.stock} auf Lager</p>
                          </div>
                        </div>
                        <Button size="sm" variant="outline">
                          Nachbestellen
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="glass rounded-xl p-6">
              <h2 className="text-lg font-bold text-white mb-4">Schnellaktionen</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button variant="outline" className="h-auto py-4 flex-col gap-2">
                  <PlusIcon className="w-6 h-6" />
                  <span>Produkt hinzufügen</span>
                </Button>
                <Button variant="outline" className="h-auto py-4 flex-col gap-2">
                  <TruckIcon className="w-6 h-6" />
                  <span>Lieferanten suchen</span>
                </Button>
                <Button variant="outline" className="h-auto py-4 flex-col gap-2">
                  <CurrencyEuroIcon className="w-6 h-6" />
                  <span>Auszahlung anfordern</span>
                </Button>
                <Button variant="outline" className="h-auto py-4 flex-col gap-2">
                  <ChartBarIcon className="w-6 h-6" />
                  <span>Bericht erstellen</span>
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Alle Bestellungen</h2>
              <div className="flex gap-4">
                <Button variant="outline">
                  <FunnelIcon className="w-4 h-4 mr-2" />
                  Filter
                </Button>
                <Button>
                  Export CSV
                </Button>
              </div>
            </div>

            <div className="glass rounded-xl overflow-hidden">
              <table className="w-full">
                <thead className="bg-white/5">
                  <tr>
                    <th className="text-left p-4 text-gray-400 font-medium">Bestellung</th>
                    <th className="text-left p-4 text-gray-400 font-medium">Kunde</th>
                    <th className="text-left p-4 text-gray-400 font-medium">Datum</th>
                    <th className="text-left p-4 text-gray-400 font-medium">Status</th>
                    <th className="text-left p-4 text-gray-400 font-medium">Zahlung</th>
                    <th className="text-right p-4 text-gray-400 font-medium">Betrag</th>
                    <th className="text-right p-4 text-gray-400 font-medium">Aktionen</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-white/5">
                      <td className="p-4 font-mono text-white">{order.id}</td>
                      <td className="p-4 text-white">{order.shippingAddress.name}</td>
                      <td className="p-4 text-gray-400">{formatDate(order.createdAt)}</td>
                      <td className="p-4">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs ${statusColors[order.status]}`}>
                          {statusLabels[order.status]}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs ${
                          order.paymentStatus === 'paid' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {order.paymentStatus === 'paid' ? 'Bezahlt' : 'Ausstehend'}
                        </span>
                      </td>
                      <td className="p-4 text-right font-semibold text-white">{formatPrice(order.total)}</td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition">
                            <EyeIcon className="w-4 h-4" />
                          </button>
                          <button className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition">
                            <PencilIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Produkte verwalten</h2>
              <div className="flex gap-4">
                <Button variant="outline">
                  <FunnelIcon className="w-4 h-4 mr-2" />
                  Filter
                </Button>
                <Button>
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Neues Produkt
                </Button>
              </div>
            </div>

            <div className="glass rounded-xl p-12 text-center">
              <CubeIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Produktverwaltung</h3>
              <p className="text-gray-400 mb-6">
                Hier können Sie Produkte hinzufügen, bearbeiten und verwalten.
                Die KI findet automatisch neue Trend-Produkte.
              </p>
              <Button>
                <PlusIcon className="w-4 h-4 mr-2" />
                Erstes Produkt hinzufügen
              </Button>
            </div>
          </div>
        )}

        {/* Customers Tab */}
        {activeTab === 'customers' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Kundenverwaltung</h2>
              <Button variant="outline">
                Export
              </Button>
            </div>

            <div className="glass rounded-xl p-12 text-center">
              <UsersIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Kundenübersicht</h3>
              <p className="text-gray-400">
                Hier werden alle registrierten Kunden angezeigt.
                Verwalten Sie Kundenkonten und sehen Sie Bestellhistorien ein.
              </p>
            </div>
          </div>
        )}

        {/* Suppliers Tab */}
        {activeTab === 'suppliers' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Lieferanten</h2>
              <div className="flex gap-4">
                <Button variant="outline">
                  KI-Suche starten
                </Button>
                <Button>
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Lieferant hinzufügen
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {pendingSuppliers.map((supplier) => (
                <div key={supplier.id} className="glass rounded-xl p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-white">{supplier.name}</h3>
                      <p className="text-sm text-gray-400">{supplier.email}</p>
                    </div>
                    <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full">
                      Ausstehend
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`w-4 h-4 ${i < Math.floor(supplier.rating) ? 'text-yellow-400' : 'text-gray-600'} fill-current`}
                          viewBox="0 0 20 20"
                        >
                          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                        </svg>
                      ))}
                      <span className="text-sm text-gray-400 ml-1">{supplier.rating}</span>
                    </div>
                    {supplier.website && (
                      <a href={supplier.website} target="_blank" rel="noopener noreferrer" className="text-sm text-cyan-400 hover:underline">
                        Website
                      </a>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1">
                      <CheckCircleIcon className="w-4 h-4 mr-1" />
                      Genehmigen
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1 border-red-500 text-red-400">
                      <XCircleIcon className="w-4 h-4 mr-1" />
                      Ablehnen
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-white">Analytik & Berichte</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="glass rounded-xl p-6">
                <h3 className="font-semibold text-white mb-2">Umsatz diese Woche</h3>
                <p className="text-3xl font-bold text-fuchsia-400">€12,847.00</p>
                <p className="text-sm text-green-400 mt-1">+23.5% vs. letzte Woche</p>
              </div>
              <div className="glass rounded-xl p-6">
                <h3 className="font-semibold text-white mb-2">Conversion Rate</h3>
                <p className="text-3xl font-bold text-cyan-400">3.2%</p>
                <p className="text-sm text-green-400 mt-1">+0.4% vs. letzte Woche</p>
              </div>
              <div className="glass rounded-xl p-6">
                <h3 className="font-semibold text-white mb-2">Durchschn. Bestellwert</h3>
                <p className="text-3xl font-bold text-white">€89.50</p>
                <p className="text-sm text-red-400 mt-1">-2.1% vs. letzte Woche</p>
              </div>
            </div>

            <div className="glass rounded-xl p-6">
              <h3 className="font-semibold text-white mb-4">Umsatzentwicklung</h3>
              <div className="h-64 flex items-center justify-center text-gray-400">
                <p>Chart-Visualisierung hier einfügen</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
