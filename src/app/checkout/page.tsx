'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  CreditCard,
  Truck,
  Shield,
  Check,
  ChevronRight,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useCartStore } from '@/lib/store'
import { formatPrice } from '@/lib/utils'

type CheckoutStep = 'shipping' | 'payment' | 'review'

export default function CheckoutPage() {
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('shipping')
  const [isProcessing, setIsProcessing] = useState(false)
  const { items, total, clearCart } = useCartStore()

  const [shippingData, setShippingData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    street: '',
    city: '',
    zip: '',
    country: 'Deutschland',
  })

  const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal' | 'klarna'>('card')

  const steps = [
    { id: 'shipping', label: 'Versand', icon: Truck },
    { id: 'payment', label: 'Zahlung', icon: CreditCard },
    { id: 'review', label: 'Prüfen', icon: Check },
  ]

  const shippingCost = total >= 50 ? 0 : 4.99
  const grandTotal = total + shippingCost

  const handleSubmit = async () => {
    setIsProcessing(true)
    // Simulate order processing
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setIsProcessing(false)
    clearCart()
    // Redirect to success page
    window.location.href = '/checkout/success'
  }

  const goToNextStep = () => {
    if (currentStep === 'shipping') setCurrentStep('payment')
    else if (currentStep === 'payment') setCurrentStep('review')
  }

  const goToPrevStep = () => {
    if (currentStep === 'payment') setCurrentStep('shipping')
    else if (currentStep === 'review') setCurrentStep('payment')
  }

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h1 className="text-2xl font-bold mb-4">Dein Warenkorb ist leer</h1>
          <Link href="/products">
            <Button>Produkte entdecken</Button>
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/cart"
            className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-fuchsia-500 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Zurück zum Warenkorb
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Kasse</h1>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`flex items-center gap-2 px-4 py-2 rounded-full ${
                    currentStep === step.id
                      ? 'bg-fuchsia-500 text-white'
                      : steps.findIndex((s) => s.id === currentStep) > index
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  <step.icon className="w-5 h-5" />
                  <span className="font-medium hidden sm:inline">{step.label}</span>
                </div>
                {index < steps.length - 1 && (
                  <ChevronRight className="w-5 h-5 mx-2 text-gray-400" />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form Area */}
          <div className="lg:col-span-2">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6"
            >
              {/* Shipping Step */}
              {currentStep === 'shipping' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Lieferadresse
                  </h2>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <Input
                      label="Vorname"
                      value={shippingData.firstName}
                      onChange={(e) =>
                        setShippingData({ ...shippingData, firstName: e.target.value })
                      }
                      required
                    />
                    <Input
                      label="Nachname"
                      value={shippingData.lastName}
                      onChange={(e) =>
                        setShippingData({ ...shippingData, lastName: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <Input
                      label="E-Mail"
                      type="email"
                      value={shippingData.email}
                      onChange={(e) =>
                        setShippingData({ ...shippingData, email: e.target.value })
                      }
                      required
                    />
                    <Input
                      label="Telefon"
                      type="tel"
                      value={shippingData.phone}
                      onChange={(e) =>
                        setShippingData({ ...shippingData, phone: e.target.value })
                      }
                    />
                  </div>

                  <Input
                    label="Straße & Hausnummer"
                    value={shippingData.street}
                    onChange={(e) =>
                      setShippingData({ ...shippingData, street: e.target.value })
                    }
                    required
                  />

                  <div className="grid sm:grid-cols-3 gap-4">
                    <Input
                      label="PLZ"
                      value={shippingData.zip}
                      onChange={(e) =>
                        setShippingData({ ...shippingData, zip: e.target.value })
                      }
                      required
                    />
                    <div className="sm:col-span-2">
                      <Input
                        label="Stadt"
                        value={shippingData.city}
                        onChange={(e) =>
                          setShippingData({ ...shippingData, city: e.target.value })
                        }
                        required
                      />
                    </div>
                  </div>

                  <Button onClick={goToNextStep} fullWidth size="lg">
                    Weiter zur Zahlung
                  </Button>
                </div>
              )}

              {/* Payment Step */}
              {currentStep === 'payment' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Zahlungsmethode
                  </h2>

                  <div className="space-y-3">
                    {[
                      { id: 'card', label: 'Kreditkarte', icon: '💳', desc: 'Visa, Mastercard, AMEX' },
                      { id: 'paypal', label: 'PayPal', icon: '🅿️', desc: 'Mit PayPal-Konto bezahlen' },
                      { id: 'klarna', label: 'Klarna', icon: '🛒', desc: 'Rechnung, Ratenzahlung' },
                    ].map((method) => (
                      <label
                        key={method.id}
                        className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          paymentMethod === method.id
                            ? 'border-fuchsia-500 bg-fuchsia-50 dark:bg-fuchsia-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="payment"
                          value={method.id}
                          checked={paymentMethod === method.id}
                          onChange={(e) => setPaymentMethod(e.target.value as typeof paymentMethod)}
                          className="sr-only"
                        />
                        <span className="text-2xl">{method.icon}</span>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {method.label}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {method.desc}
                          </p>
                        </div>
                        {paymentMethod === method.id && (
                          <Check className="w-5 h-5 text-fuchsia-500 ml-auto" />
                        )}
                      </label>
                    ))}
                  </div>

                  <div className="flex gap-4">
                    <Button variant="outline" onClick={goToPrevStep} fullWidth size="lg">
                      Zurück
                    </Button>
                    <Button onClick={goToNextStep} fullWidth size="lg">
                      Weiter
                    </Button>
                  </div>
                </div>
              )}

              {/* Review Step */}
              {currentStep === 'review' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Bestellung prüfen
                  </h2>

                  {/* Shipping Summary */}
                  <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                      Lieferadresse
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {shippingData.firstName} {shippingData.lastName}
                      <br />
                      {shippingData.street}
                      <br />
                      {shippingData.zip} {shippingData.city}
                      <br />
                      {shippingData.email}
                    </p>
                  </div>

                  {/* Items */}
                  <div className="space-y-3">
                    {items.map((item) => (
                      <div key={item.id} className="flex items-center gap-4">
                        <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                          <Image src={item.image} alt={item.name} fill className="object-cover" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 dark:text-white">
                            {item.name}
                          </p>
                          <p className="text-sm text-gray-500">Menge: {item.quantity}</p>
                        </div>
                        <p className="font-semibold">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-4">
                    <Button variant="outline" onClick={goToPrevStep} fullWidth size="lg">
                      Zurück
                    </Button>
                    <Button
                      onClick={handleSubmit}
                      isLoading={isProcessing}
                      fullWidth
                      size="lg"
                    >
                      Jetzt kaufen
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>

          {/* Order Summary */}
          <div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                Deine Bestellung
              </h2>

              <div className="space-y-3 mb-6">
                {items.slice(0, 3).map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100">
                      <Image src={item.image} alt={item.name} fill className="object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.name}</p>
                      <p className="text-xs text-gray-500">x{item.quantity}</p>
                    </div>
                    <p className="text-sm font-semibold">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
                {items.length > 3 && (
                  <p className="text-sm text-gray-500">+{items.length - 3} weitere Artikel</p>
                )}
              </div>

              <div className="space-y-2 border-t border-gray-200 dark:border-gray-700 pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Zwischensumme</span>
                  <span>{formatPrice(total)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Versand</span>
                  <span>{shippingCost === 0 ? 'Kostenlos' : formatPrice(shippingCost)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-200 dark:border-gray-700">
                  <span>Gesamt</span>
                  <span>{formatPrice(grandTotal)}</span>
                </div>
              </div>

              <div className="mt-6 flex items-center gap-2 text-sm text-gray-500">
                <Shield className="w-4 h-4" />
                <span>Sichere SSL-verschlüsselte Zahlung</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
