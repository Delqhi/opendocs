'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  UserCircleIcon,
  ShoppingBagIcon,
  HeartIcon,
  MapPinIcon,
  CogIcon,
  ArrowRightOnRectangleIcon,
  ChevronRightIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
} from '@heroicons/react/24/outline'
import { useUserStore } from '@/lib/store'
import { formatPrice, formatDate } from '@/lib/utils'
import { Button, Card, Input, Modal } from '@/components/ui'
import type { Order, Address, Product } from '@/types'

// Sample data for demo
const sampleOrders: Order[] = [
  {
    id: 'ORD-001',
    customerId: '1',
    items: [
      { id: '1', productId: 'p1', productName: 'Wireless Kopfhörer Pro', productImage: '/placeholder-product.jpg', quantity: 1, price: 149.99 },
      { id: '2', productId: 'p2', productName: 'USB-C Ladekabel', productImage: '/placeholder-product.jpg', quantity: 2, price: 19.99 },
    ],
    status: 'delivered',
    subtotal: 189.97,
    shipping: 4.99,
    tax: 31.84,
    total: 226.80,
    shippingAddress: { id: '1', name: 'Max Mustermann', street: 'Musterstr. 123', city: 'Berlin', postalCode: '10115', country: 'Deutschland' },
    billingAddress: { id: '1', name: 'Max Mustermann', street: 'Musterstr. 123', city: 'Berlin', postalCode: '10115', country: 'Deutschland' },
    paymentMethod: 'stripe',
    paymentStatus: 'paid',
    trackingNumber: 'DHL-1234567890',
    createdAt: '2026-01-20T10:30:00Z',
    updatedAt: '2026-01-23T14:00:00Z',
  },
  {
    id: 'ORD-002',
    customerId: '1',
    items: [
      { id: '3', productId: 'p3', productName: 'Smart Watch Ultra', productImage: '/placeholder-product.jpg', quantity: 1, price: 299.99 },
    ],
    status: 'shipped',
    subtotal: 299.99,
    shipping: 0,
    tax: 50.40,
    total: 350.39,
    shippingAddress: { id: '1', name: 'Max Mustermann', street: 'Musterstr. 123', city: 'Berlin', postalCode: '10115', country: 'Deutschland' },
    billingAddress: { id: '1', name: 'Max Mustermann', street: 'Musterstr. 123', city: 'Berlin', postalCode: '10115', country: 'Deutschland' },
    paymentMethod: 'paypal',
    paymentStatus: 'paid',
    trackingNumber: 'DPD-9876543210',
    createdAt: '2026-01-25T15:45:00Z',
    updatedAt: '2026-01-26T09:00:00Z',
  },
]

const sampleWishlist: Product[] = [
  {
    id: 'w1',
    name: 'Gaming Maus RGB',
    description: 'Hochpräzise Gaming-Maus mit RGB-Beleuchtung',
    price: 79.99,
    originalPrice: 99.99,
    images: ['/placeholder-product.jpg'],
    category: 'Gaming',
    categoryId: 'gaming',
    rating: 4.7,
    reviewCount: 234,
    stock: 15,
    isSale: true,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'w2',
    name: 'Bluetooth Speaker',
    description: 'Tragbarer Bluetooth-Lautsprecher mit 360° Sound',
    price: 129.99,
    images: ['/placeholder-product.jpg'],
    category: 'Audio',
    categoryId: 'audio',
    rating: 4.5,
    reviewCount: 189,
    stock: 8,
    isNew: true,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
]

const sampleAddresses: Address[] = [
  {
    id: '1',
    name: 'Zuhause',
    street: 'Musterstraße 123',
    city: 'Berlin',
    postalCode: '10115',
    country: 'Deutschland',
    phone: '+49 30 12345678',
    isDefault: true,
  },
  {
    id: '2',
    name: 'Arbeit',
    street: 'Businessallee 456',
    city: 'München',
    postalCode: '80331',
    country: 'Deutschland',
    phone: '+49 89 87654321',
  },
]

type TabType = 'profile' | 'orders' | 'wishlist' | 'addresses' | 'settings'

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-500/20 text-yellow-400',
  confirmed: 'bg-blue-500/20 text-blue-400',
  processing: 'bg-purple-500/20 text-purple-400',
  shipped: 'bg-cyan-500/20 text-cyan-400',
  delivered: 'bg-green-500/20 text-green-400',
  cancelled: 'bg-red-500/20 text-red-400',
  refunded: 'bg-gray-500/20 text-gray-400',
}

const statusLabels: Record<string, string> = {
  pending: 'Ausstehend',
  confirmed: 'Bestätigt',
  processing: 'In Bearbeitung',
  shipped: 'Versendet',
  delivered: 'Zugestellt',
  cancelled: 'Storniert',
  refunded: 'Erstattet',
}

export default function AccountPage() {
  const [activeTab, setActiveTab] = useState<TabType>('profile')
  const { user, isAuthenticated, logout } = useUserStore()
  const [editingAddress, setEditingAddress] = useState<Address | null>(null)
  const [showAddressModal, setShowAddressModal] = useState(false)

  // Demo user data if not authenticated
  const displayUser = user || {
    id: '1',
    name: 'Max Mustermann',
    email: 'max@example.com',
    phone: '+49 30 12345678',
    addresses: sampleAddresses,
    createdAt: '2025-06-15T00:00:00Z',
  }

  const tabs = [
    { id: 'profile' as TabType, label: 'Profil', icon: UserCircleIcon },
    { id: 'orders' as TabType, label: 'Bestellungen', icon: ShoppingBagIcon },
    { id: 'wishlist' as TabType, label: 'Wunschliste', icon: HeartIcon },
    { id: 'addresses' as TabType, label: 'Adressen', icon: MapPinIcon },
    { id: 'settings' as TabType, label: 'Einstellungen', icon: CogIcon },
  ]

  const handleLogout = () => {
    logout()
    window.location.href = '/'
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-black py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Mein Konto</h1>
          <p className="text-gray-400">Verwalten Sie Ihre Bestellungen, Adressen und Einstellungen</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="glass rounded-2xl p-6 sticky top-24">
              {/* User Info */}
              <div className="text-center mb-6 pb-6 border-b border-white/10">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-fuchsia-500 to-cyan-500 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-white">
                    {displayUser.name.charAt(0)}
                  </span>
                </div>
                <h2 className="text-lg font-semibold text-white">{displayUser.name}</h2>
                <p className="text-sm text-gray-400">{displayUser.email}</p>
              </div>

              {/* Navigation */}
              <nav className="space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      activeTab === tab.id
                        ? 'bg-fuchsia-500/20 text-fuchsia-400'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <tab.icon className="w-5 h-5" />
                    <span>{tab.label}</span>
                    {activeTab === tab.id && (
                      <ChevronRightIcon className="w-4 h-4 ml-auto" />
                    )}
                  </button>
                ))}
              </nav>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 mt-4 rounded-lg text-red-400 hover:bg-red-500/10 transition-all"
              >
                <ArrowRightOnRectangleIcon className="w-5 h-5" />
                <span>Abmelden</span>
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="glass rounded-2xl p-8">
                <h2 className="text-xl font-bold text-white mb-6">Profil bearbeiten</h2>
                
                <form className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      label="Vorname"
                      defaultValue={displayUser.name.split(' ')[0]}
                      placeholder="Vorname eingeben"
                    />
                    <Input
                      label="Nachname"
                      defaultValue={displayUser.name.split(' ')[1] || ''}
                      placeholder="Nachname eingeben"
                    />
                  </div>
                  
                  <Input
                    label="E-Mail-Adresse"
                    type="email"
                    defaultValue={displayUser.email}
                    placeholder="E-Mail eingeben"
                  />
                  
                  <Input
                    label="Telefonnummer"
                    type="tel"
                    defaultValue={displayUser.phone || ''}
                    placeholder="Telefonnummer eingeben"
                  />

                  <div className="pt-4 border-t border-white/10">
                    <h3 className="font-semibold text-white mb-4">Passwort ändern</h3>
                    <div className="space-y-4">
                      <Input
                        label="Aktuelles Passwort"
                        type="password"
                        placeholder="••••••••"
                      />
                      <Input
                        label="Neues Passwort"
                        type="password"
                        placeholder="••••••••"
                      />
                      <Input
                        label="Passwort bestätigen"
                        type="password"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-4">
                    <Button variant="ghost">Abbrechen</Button>
                    <Button type="submit">Speichern</Button>
                  </div>
                </form>
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white">Meine Bestellungen</h2>
                  <span className="text-sm text-gray-400">{sampleOrders.length} Bestellungen</span>
                </div>

                {sampleOrders.length === 0 ? (
                  <div className="glass rounded-2xl p-12 text-center">
                    <ShoppingBagIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-white mb-2">Keine Bestellungen</h3>
                    <p className="text-gray-400 mb-6">Sie haben noch keine Bestellungen aufgegeben.</p>
                    <Link href="/products">
                      <Button>Jetzt einkaufen</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {sampleOrders.map((order) => (
                      <div key={order.id} className="glass rounded-2xl p-6">
                        {/* Order Header */}
                        <div className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-4 border-b border-white/10">
                          <div>
                            <p className="text-sm text-gray-400">Bestellnummer</p>
                            <p className="font-mono font-semibold text-white">{order.id}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-400">Datum</p>
                            <p className="text-white">{formatDate(order.createdAt)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-400">Status</p>
                            <span className={`inline-flex px-3 py-1 rounded-full text-sm ${statusColors[order.status]}`}>
                              {statusLabels[order.status]}
                            </span>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-400">Gesamt</p>
                            <p className="text-lg font-bold text-fuchsia-400">{formatPrice(order.total)}</p>
                          </div>
                        </div>

                        {/* Order Items */}
                        <div className="space-y-3">
                          {order.items.map((item) => (
                            <div key={item.id} className="flex items-center gap-4">
                              <div className="w-16 h-16 rounded-lg bg-gray-800 flex-shrink-0 overflow-hidden">
                                <Image
                                  src={item.productImage || '/placeholder-product.jpg'}
                                  alt={item.productName}
                                  width={64}
                                  height={64}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="flex-grow">
                                <p className="text-white font-medium">{item.productName}</p>
                                <p className="text-sm text-gray-400">Menge: {item.quantity}</p>
                              </div>
                              <p className="text-white">{formatPrice(item.price * item.quantity)}</p>
                            </div>
                          ))}
                        </div>

                        {/* Tracking */}
                        {order.trackingNumber && (
                          <div className="mt-4 pt-4 border-t border-white/10">
                            <p className="text-sm text-gray-400">
                              Sendungsverfolgung: 
                              <span className="ml-2 text-cyan-400 font-mono">{order.trackingNumber}</span>
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Wishlist Tab */}
            {activeTab === 'wishlist' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white">Meine Wunschliste</h2>
                  <span className="text-sm text-gray-400">{sampleWishlist.length} Artikel</span>
                </div>

                {sampleWishlist.length === 0 ? (
                  <div className="glass rounded-2xl p-12 text-center">
                    <HeartIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-white mb-2">Wunschliste ist leer</h3>
                    <p className="text-gray-400 mb-6">Fügen Sie Produkte hinzu, die Sie später kaufen möchten.</p>
                    <Link href="/products">
                      <Button>Produkte entdecken</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {sampleWishlist.map((product) => (
                      <div key={product.id} className="glass rounded-xl p-4 flex gap-4">
                        <div className="w-24 h-24 rounded-lg bg-gray-800 flex-shrink-0 overflow-hidden">
                          <Image
                            src={product.images[0] || '/placeholder-product.jpg'}
                            alt={product.name}
                            width={96}
                            height={96}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-grow">
                          <h3 className="font-semibold text-white mb-1">{product.name}</h3>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-lg font-bold text-fuchsia-400">{formatPrice(product.price)}</span>
                            {product.originalPrice && (
                              <span className="text-sm text-gray-500 line-through">{formatPrice(product.originalPrice)}</span>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm">In den Warenkorb</Button>
                            <Button size="sm" variant="ghost" className="text-red-400">
                              <TrashIcon className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Addresses Tab */}
            {activeTab === 'addresses' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white">Meine Adressen</h2>
                  <Button onClick={() => setShowAddressModal(true)}>
                    <PlusIcon className="w-4 h-4 mr-2" />
                    Neue Adresse
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {sampleAddresses.map((address) => (
                    <div key={address.id} className="glass rounded-xl p-6 relative">
                      {address.isDefault && (
                        <span className="absolute top-4 right-4 px-2 py-1 bg-fuchsia-500/20 text-fuchsia-400 text-xs rounded-full">
                          Standard
                        </span>
                      )}
                      <h3 className="font-semibold text-white mb-3">{address.name}</h3>
                      <div className="text-gray-400 space-y-1 mb-4">
                        <p>{address.street}</p>
                        <p>{address.postalCode} {address.city}</p>
                        <p>{address.country}</p>
                        {address.phone && <p className="text-cyan-400">{address.phone}</p>}
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="ghost" onClick={() => setEditingAddress(address)}>
                          <PencilIcon className="w-4 h-4 mr-1" />
                          Bearbeiten
                        </Button>
                        <Button size="sm" variant="ghost" className="text-red-400">
                          <TrashIcon className="w-4 h-4 mr-1" />
                          Löschen
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="glass rounded-2xl p-8">
                <h2 className="text-xl font-bold text-white mb-6">Einstellungen</h2>
                
                <div className="space-y-8">
                  {/* Notifications */}
                  <div>
                    <h3 className="font-semibold text-white mb-4">Benachrichtigungen</h3>
                    <div className="space-y-4">
                      <label className="flex items-center justify-between cursor-pointer">
                        <div>
                          <p className="text-white">E-Mail-Benachrichtigungen</p>
                          <p className="text-sm text-gray-400">Erhalten Sie Updates zu Bestellungen per E-Mail</p>
                        </div>
                        <input type="checkbox" defaultChecked className="toggle toggle-fuchsia" />
                      </label>
                      <label className="flex items-center justify-between cursor-pointer">
                        <div>
                          <p className="text-white">Newsletter</p>
                          <p className="text-sm text-gray-400">Erhalten Sie Angebote und Neuigkeiten</p>
                        </div>
                        <input type="checkbox" defaultChecked className="toggle toggle-fuchsia" />
                      </label>
                      <label className="flex items-center justify-between cursor-pointer">
                        <div>
                          <p className="text-white">SMS-Benachrichtigungen</p>
                          <p className="text-sm text-gray-400">Erhalten Sie Versandbenachrichtigungen per SMS</p>
                        </div>
                        <input type="checkbox" className="toggle toggle-fuchsia" />
                      </label>
                    </div>
                  </div>

                  {/* Privacy */}
                  <div className="pt-6 border-t border-white/10">
                    <h3 className="font-semibold text-white mb-4">Datenschutz</h3>
                    <div className="space-y-4">
                      <label className="flex items-center justify-between cursor-pointer">
                        <div>
                          <p className="text-white">Personalisierte Werbung</p>
                          <p className="text-sm text-gray-400">Erhalten Sie personalisierte Produktempfehlungen</p>
                        </div>
                        <input type="checkbox" defaultChecked className="toggle toggle-fuchsia" />
                      </label>
                      <label className="flex items-center justify-between cursor-pointer">
                        <div>
                          <p className="text-white">Analysen teilen</p>
                          <p className="text-sm text-gray-400">Helfen Sie uns, den Shop zu verbessern</p>
                        </div>
                        <input type="checkbox" defaultChecked className="toggle toggle-fuchsia" />
                      </label>
                    </div>
                  </div>

                  {/* Danger Zone */}
                  <div className="pt-6 border-t border-white/10">
                    <h3 className="font-semibold text-red-400 mb-4">Gefahrenzone</h3>
                    <p className="text-gray-400 text-sm mb-4">
                      Wenn Sie Ihr Konto löschen, werden alle Ihre Daten unwiderruflich gelöscht.
                    </p>
                    <Button variant="outline" className="border-red-500 text-red-400 hover:bg-red-500/10">
                      Konto löschen
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Address Modal */}
      <Modal
        isOpen={showAddressModal || !!editingAddress}
        onClose={() => {
          setShowAddressModal(false)
          setEditingAddress(null)
        }}
        title={editingAddress ? 'Adresse bearbeiten' : 'Neue Adresse hinzufügen'}
      >
        <form className="space-y-4">
          <Input
            label="Bezeichnung"
            placeholder="z.B. Zuhause, Arbeit"
            defaultValue={editingAddress?.name}
          />
          <Input
            label="Straße und Hausnummer"
            placeholder="Musterstraße 123"
            defaultValue={editingAddress?.street}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="PLZ"
              placeholder="10115"
              defaultValue={editingAddress?.postalCode}
            />
            <Input
              label="Stadt"
              placeholder="Berlin"
              defaultValue={editingAddress?.city}
            />
          </div>
          <Input
            label="Land"
            placeholder="Deutschland"
            defaultValue={editingAddress?.country}
          />
          <Input
            label="Telefon (optional)"
            type="tel"
            placeholder="+49 30 12345678"
            defaultValue={editingAddress?.phone}
          />
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" defaultChecked={editingAddress?.isDefault} className="checkbox" />
            <span className="text-white">Als Standardadresse festlegen</span>
          </label>
          <div className="flex justify-end gap-4 pt-4">
            <Button variant="ghost" onClick={() => { setShowAddressModal(false); setEditingAddress(null) }}>
              Abbrechen
            </Button>
            <Button type="submit">
              {editingAddress ? 'Speichern' : 'Hinzufügen'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
