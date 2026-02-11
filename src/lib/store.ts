import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Product, CartItem, Customer } from '@/types'

// Cart Store
interface CartState {
  items: CartItem[]
  addItem: (product: Product, quantity?: number) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  total: () => number
  itemCount: () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (product: Product, quantity = 1) => {
        set((state) => {
          const existingItem = state.items.find(item => item.product.id === product.id)
          
          if (existingItem) {
            return {
              items: state.items.map(item =>
                item.product.id === product.id
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              ),
            }
          }
          
          return {
            items: [...state.items, { id: crypto.randomUUID(), product, quantity }],
          }
        })
      },
      
      removeItem: (productId: string) => {
        set((state) => ({
          items: state.items.filter(item => item.product.id !== productId),
        }))
      },
      
      updateQuantity: (productId: string, quantity: number) => {
        if (quantity < 1) {
          get().removeItem(productId)
          return
        }
        
        set((state) => ({
          items: state.items.map(item =>
            item.product.id === productId
              ? { ...item, quantity }
              : item
          ),
        }))
      },
      
      clearCart: () => set({ items: [] }),
      
      total: () => {
        const items = get().items
        return items.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
      },
      
      itemCount: () => {
        const items = get().items
        return items.reduce((sum, item) => sum + item.quantity, 0)
      },
    }),
    {
      name: 'simone-cart',
    }
  )
)

// UI Store
interface UIState {
  isCartOpen: boolean
  isMobileMenuOpen: boolean
  isChatOpen: boolean
  toggleCart: () => void
  openCart: () => void
  closeCart: () => void
  toggleMobileMenu: () => void
  closeMobileMenu: () => void
  toggleChat: () => void
  openChat: () => void
  closeChat: () => void
}

export const useUIStore = create<UIState>((set) => ({
  isCartOpen: false,
  isMobileMenuOpen: false,
  isChatOpen: false,
  
  toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen, isMobileMenuOpen: false })),
  openCart: () => set({ isCartOpen: true, isMobileMenuOpen: false }),
  closeCart: () => set({ isCartOpen: false }),
  
  toggleMobileMenu: () => set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen, isCartOpen: false })),
  closeMobileMenu: () => set({ isMobileMenuOpen: false }),
  
  toggleChat: () => set((state) => ({ isChatOpen: !state.isChatOpen })),
  openChat: () => set({ isChatOpen: true }),
  closeChat: () => set({ isChatOpen: false }),
}))

// User Store
interface UserState {
  user: Customer | null
  isAuthenticated: boolean
  login: (customer: Customer) => void
  logout: () => void
  updateUser: (data: Partial<Customer>) => void
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      
      login: (customer: Customer) => set({ user: customer, isAuthenticated: true }),
      
      logout: () => set({ user: null, isAuthenticated: false }),
      
      updateUser: (data: Partial<Customer>) => set((state) => ({
        user: state.user ? { ...state.user, ...data } : null,
      })),
    }),
    {
      name: 'simone-user',
    }
  )
)
