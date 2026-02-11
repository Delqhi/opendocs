import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

// Merge class names with Tailwind CSS
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format price to EUR currency
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
  }).format(price)
}

// Format date to German locale
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(d)
}

// Format date with time
export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d)
}

// Truncate text with ellipsis
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text
  return text.slice(0, length).trim() + '...'
}

// Generate random ID
export function generateId(): string {
  return crypto.randomUUID()
}

// Calculate discount percentage
export function calculateDiscount(originalPrice: number, salePrice: number): number {
  if (originalPrice <= 0) return 0
  return Math.round(((originalPrice - salePrice) / originalPrice) * 100)
}

// Debounce function
export function debounce<T extends (...args: Parameters<T>) => ReturnType<T>>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// Sleep function for async operations
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// Get order status label in German
export function getOrderStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    pending: 'Ausstehend',
    confirmed: 'Bestätigt',
    processing: 'In Bearbeitung',
    shipped: 'Versendet',
    delivered: 'Zugestellt',
    cancelled: 'Storniert',
    refunded: 'Erstattet',
  }
  return labels[status] || status
}

// Get payment status label in German
export function getPaymentStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    pending: 'Ausstehend',
    paid: 'Bezahlt',
    failed: 'Fehlgeschlagen',
    refunded: 'Erstattet',
  }
  return labels[status] || status
}

// Get payment method label
export function getPaymentMethodLabel(method: string): string {
  const labels: Record<string, string> = {
    stripe: 'Kreditkarte',
    paypal: 'PayPal',
    klarna: 'Klarna',
  }
  return labels[method] || method
}

// Validate email format
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Validate German postal code
export function isValidPostalCode(postalCode: string): boolean {
  const postalCodeRegex = /^\d{5}$/
  return postalCodeRegex.test(postalCode)
}

// Generate star rating array
export function generateStars(rating: number): ('full' | 'half' | 'empty')[] {
  const stars: ('full' | 'half' | 'empty')[] = []
  const fullStars = Math.floor(rating)
  const hasHalfStar = rating % 1 >= 0.5
  
  for (let i = 0; i < fullStars; i++) {
    stars.push('full')
  }
  
  if (hasHalfStar) {
    stars.push('half')
  }
  
  while (stars.length < 5) {
    stars.push('empty')
  }
  
  return stars
}
