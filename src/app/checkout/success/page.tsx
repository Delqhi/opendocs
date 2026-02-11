'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { CheckCircleIcon, TruckIcon, EnvelopeIcon, PhoneIcon } from '@heroicons/react/24/outline'
import { useCartStore } from '@/lib/store'
import { formatPrice } from '@/lib/utils'
import { Button } from '@/components/ui'

interface OrderDetails {
  orderId: string
  email: string
  total: number
  items: Array<{
    name: string
    quantity: number
    price: number
  }>
  shippingAddress: {
    name: string
    street: string
    city: string
    postalCode: string
    country: string
  }
  estimatedDelivery: string
}

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const orderId = searchParams.get('order_id')
  const clearCart = useCartStore((state) => state.clearCart)
  
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Clear cart on successful checkout
    clearCart()
    
    // Simulate fetching order details
    // In production, fetch from API using session_id or order_id
    const fetchOrderDetails = async () => {
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setOrderDetails({
        orderId: orderId || `ORD-${Date.now()}`,
        email: 'kunde@example.com',
        total: 199.99,
        items: [
          { name: 'Beispielprodukt 1', quantity: 2, price: 49.99 },
          { name: 'Beispielprodukt 2', quantity: 1, price: 100.01 },
        ],
        shippingAddress: {
          name: 'Max Mustermann',
          street: 'Musterstraße 123',
          city: 'Berlin',
          postalCode: '10115',
          country: 'Deutschland',
        },
        estimatedDelivery: '3-5 Werktage',
      })
      setLoading(false)
    }
    
    fetchOrderDetails()
  }, [clearCart, orderId, sessionId])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-fuchsia-500 border-t-transparent mx-auto mb-4" />
          <p className="text-gray-400">Bestellung wird bestätigt...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-black py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/20 mb-6">
            <CheckCircleIcon className="w-12 h-12 text-green-500" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Vielen Dank für Ihre Bestellung!
          </h1>
          <p className="text-gray-400 text-lg">
            Ihre Bestellung wurde erfolgreich aufgegeben.
          </p>
        </div>

        {/* Order Confirmation Box */}
        <div className="glass rounded-2xl p-8 mb-8">
          <div className="flex items-center justify-between border-b border-white/10 pb-6 mb-6">
            <div>
              <p className="text-gray-400 text-sm">Bestellnummer</p>
              <p className="text-xl font-mono font-bold text-white">{orderDetails?.orderId}</p>
            </div>
            <div className="text-right">
              <p className="text-gray-400 text-sm">Gesamtbetrag</p>
              <p className="text-xl font-bold text-fuchsia-400">{formatPrice(orderDetails?.total || 0)}</p>
            </div>
          </div>

          {/* Order Items */}
          <div className="space-y-4 mb-6">
            <h3 className="font-semibold text-white">Bestellte Artikel</h3>
            {orderDetails?.items.map((item, index) => (
              <div key={index} className="flex justify-between items-center py-2">
                <div>
                  <p className="text-white">{item.name}</p>
                  <p className="text-sm text-gray-400">Menge: {item.quantity}</p>
                </div>
                <p className="text-white font-medium">{formatPrice(item.price * item.quantity)}</p>
              </div>
            ))}
          </div>

          {/* Shipping Address */}
          <div className="border-t border-white/10 pt-6">
            <h3 className="font-semibold text-white mb-3">Lieferadresse</h3>
            <div className="text-gray-400">
              <p>{orderDetails?.shippingAddress.name}</p>
              <p>{orderDetails?.shippingAddress.street}</p>
              <p>{orderDetails?.shippingAddress.postalCode} {orderDetails?.shippingAddress.city}</p>
              <p>{orderDetails?.shippingAddress.country}</p>
            </div>
          </div>
        </div>

        {/* What's Next */}
        <div className="glass rounded-2xl p-8 mb-8">
          <h2 className="text-xl font-bold text-white mb-6">Was passiert als nächstes?</h2>
          
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-fuchsia-500/20 flex items-center justify-center">
                <EnvelopeIcon className="w-5 h-5 text-fuchsia-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Bestätigungs-E-Mail</h3>
                <p className="text-gray-400 text-sm">
                  Sie erhalten in Kürze eine Bestätigungs-E-Mail mit allen Details zu Ihrer Bestellung.
                </p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center">
                <TruckIcon className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Versand</h3>
                <p className="text-gray-400 text-sm">
                  Ihre Bestellung wird innerhalb von 1-2 Werktagen versandt. 
                  Geschätzte Lieferzeit: <span className="text-white">{orderDetails?.estimatedDelivery}</span>
                </p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                <PhoneIcon className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Support</h3>
                <p className="text-gray-400 text-sm">
                  Bei Fragen zu Ihrer Bestellung nutzen Sie unseren KI-Chat oder kontaktieren Sie uns per E-Mail.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/products">
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              Weiter einkaufen
            </Button>
          </Link>
          <Link href="/account">
            <Button size="lg" className="w-full sm:w-auto">
              Bestellungen ansehen
            </Button>
          </Link>
        </div>

        {/* Social Proof */}
        <div className="text-center mt-12 pt-8 border-t border-white/10">
          <p className="text-gray-400 text-sm mb-4">
            Über 10.000 zufriedene Kunden vertrauen uns
          </p>
          <div className="flex justify-center gap-1">
            {[...Array(5)].map((_, i) => (
              <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
              </svg>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
