// Product Types
export interface Product {
  id: string
  name: string
  description: string
  price: number
  originalPrice?: number
  images: string[]
  category: string
  categoryId: string
  rating: number
  reviewCount: number
  isNew?: boolean
  isSale?: boolean
  variants?: ProductVariant[]
  supplier?: Supplier
  stock: number
  createdAt: string
  updatedAt: string
}

export interface ProductVariant {
  id: string
  name: string
  value: string
  price?: number
  stock: number
}

export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  image?: string
  parentId?: string
}

// Cart Types
export interface CartItem {
  id: string
  product: Product
  quantity: number
  variant?: ProductVariant
}

// Order Types
export interface Order {
  id: string
  customerId: string
  items: OrderItem[]
  status: OrderStatus
  subtotal: number
  shipping: number
  tax: number
  total: number
  shippingAddress: Address
  billingAddress: Address
  paymentMethod: PaymentMethod
  paymentStatus: PaymentStatus
  trackingNumber?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface OrderItem {
  id: string
  productId: string
  productName: string
  productImage: string
  quantity: number
  price: number
  variant?: string
}

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded'
export type PaymentMethod = 'stripe' | 'paypal' | 'klarna'

// Customer Types
export interface Customer {
  id: string
  email: string
  name: string
  phone?: string
  addresses: Address[]
  defaultAddressId?: string
  createdAt: string
}

export interface Address {
  id: string
  name: string
  street: string
  city: string
  state?: string
  postalCode: string
  country: string
  phone?: string
  isDefault?: boolean
}

// Supplier Types
export interface Supplier {
  id: string
  name: string
  email: string
  phone?: string
  website?: string
  apiEndpoint?: string
  status: 'pending' | 'approved' | 'rejected' | 'suspended'
  rating: number
  orderCount: number
}

// Review Types
export interface Review {
  id: string
  productId: string
  customerId: string
  customerName: string
  rating: number
  title: string
  content: string
  images?: string[]
  verified: boolean
  helpful: number
  createdAt: string
}

// AI Types
export interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: string
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}
