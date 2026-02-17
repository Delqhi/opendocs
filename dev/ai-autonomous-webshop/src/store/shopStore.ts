import { create } from 'zustand';
import { trackEvent } from '../utils/analytics';
import { getSupabaseClient } from '../utils/supabaseClient';
import {
  isSupabaseConfigured,
  pullAllFromSupabase,
  pushAdminProfile as sbPushAdminProfile,
  pushProduct as sbPushProduct,
  removeProduct as sbRemoveProduct,
  pushSupplier as sbPushSupplier,
  removeSupplier as sbRemoveSupplier,
  pushCoupon as sbPushCoupon,
  removeCoupon as sbRemoveCoupon,
  pushOrder as sbPushOrder,
} from '../utils/supabaseData';

export interface ProductAIInsight {
  fitScore: number;
  valueIntegrity: number;
  demandVelocity: number;
  aiReasoning: string;
}

export interface MarketPrice {
  competitor: string;
  price: number;
}

export interface BundleDeal {
  id: string;
  products: string[]; // array of product IDs
  discountPercent: number;
  savings: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice: number;
  category: string;
  image: string;
  images?: string[];
  blurHash?: string;
  videoUrl?: string;
  rating: number;
  reviews: number;
  stock: number;
  aiScore: number;
  trending: boolean;
  onSale?: boolean;
  tags: string[];
  supplier: string;
  margin: number;
  aiOptimized: boolean;
  demandScore: number;
  sold: number;
  badge?: string;
  sourceType?: 'affiliate' | 'dropship' | 'own';
  affiliateUrl?: string;
  affiliateNetworkId?: string;
  supplierId?: string;
  supplierPrice?: number;
  sku?: string;
  status?: 'active' | 'draft' | 'archived';
  aiInsights?: ProductAIInsight;
  marketComparison?: MarketPrice[];
  ugcPhotos?: string[];
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface AIInsight {
  id: string;
  type: 'trend' | 'price' | 'stock' | 'marketing' | 'profit';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  timestamp: Date;
  action?: string;
  automated: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

export interface AdminSupplier {
  id: string;
  name: string;
  type: 'dropship' | 'affiliate' | 'warehouse';
  region: string;
  status: 'active' | 'paused' | 'pending';
  rating: number;
  shippingTime: string;
  priceIndex: number;
  apiEndpoint?: string;
  orderEndpoint?: string;
  catalogUrl?: string;
  catalogFormat?: 'json' | 'csv';
  catalogAuthHeader?: string;
  defaultAffiliateNetworkId?: string;
  website?: string;
  contactEmail?: string;
  notes?: string;
}

export interface AffiliateNetwork {
  id: string;
  name: string;
  status: 'active' | 'paused';
  trackingUrl: string;
  commissionRate: number;
  cookieDays: number;
}

export interface Campaign {
  id: string;
  name: string;
  platform: 'instagram' | 'facebook' | 'email' | 'tiktok';
  status: 'active' | 'paused' | 'scheduled';
  budget: number;
  spent: number;
  impressions: number;
  clicks: number;
  conversions: number;
  roas: number;
  aiOptimized: boolean;
  startDate: string;
}

export interface Influencer {
  id: string;
  name: string;
  platform: 'TikTok' | 'Instagram' | 'YouTube';
  followers: number;
  engagement: string;
  status: 'Active' | 'Generating Post' | 'Scheduled';
  roi: number;
  avatar: string;
}

export interface FinanceSnapshot {
  month: string;
  revenue: number;
  profit: number;
  expenses: number;
}

export interface ShopSettings {
  storeName: string;
  supportEmail: string;
  supportPhone: string;
  defaultCurrency: string;
  timezone: string;
  primaryMarket: string;
  returnPolicyDays: number;

  /**
   * Admin/ops AI provider (used for backoffice automations, diagnostics, etc.)
   */
  aiProvider: 'openai' | 'anthropic' | 'ollama' | 'custom' | 'puter';
  aiApiKey: string;
  aiBaseUrl: string;
  aiModel: string;
  aiTemperature: number;
  aiMaxTokens: number;

  /**
   * Buyer-facing AI concierge provider.
   * Best practice for Feb 2026: keep this "user-pays" (Puter) so shoppers don't rely on your API keys.
   */
  buyerAiProvider: 'puter' | 'openai' | 'anthropic' | 'ollama' | 'custom';
  buyerAiModel: string;
  autopilotEnabled: boolean;
  autoPricing: boolean;
  autoSourcing: boolean;
  autoMarketing: boolean;
  autoSupport: boolean;
  autoFulfillment: boolean;
  autoContent: boolean;
  webhookOrders: string;
  webhookInventory: string;
  webhookTracking: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
  supabaseFnCreateOrder: string;
  supabaseFnFulfillOrder: string;
  supabaseFnSendEmail: string;
  supabaseFnTrackingUpdate: string;
  supabaseTableProducts?: string;
  supabaseTableSuppliers?: string;
  supabaseTableCoupons?: string;
  supabaseTableOrders?: string;
  supabaseTableCustomers?: string;
  supabaseTableAnalytics?: string;
  supabaseTableAdminProfile?: string;
  openClawUrl: string;
  openClawSecret: string;
  n8nWebhookUrl: string;
  nvidiaApiKey: string;
  channels: {
    website: boolean;
    amazon: boolean;
    tiktokShop: boolean;
    ebay: boolean;
  };
}

export interface Integrations {
  payments: string[];
  shippingCarriers: string[];
  analytics: {
    googleAnalyticsId: string;
    metaPixelId: string;
    tiktokPixelId: string;
  };
}

export interface Coupon {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minOrder: number;
  maxUses: number;
  usedCount: number;
  expiresAt: Date | null;
  active: boolean;
}

export interface Currency {
  code: string;
  symbol: string;
  rate: number;
}

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  loyaltyTier: 'starter' | 'plus' | 'elite';
  loyaltyPoints: number;
  createdAt: string;
}

export interface UserAddress {
  id: string;
  label: string;
  name: string;
  phone?: string;
  address1: string;
  address2?: string;
  city: string;
  state?: string;
  zip: string;
  country: string;
  isDefault?: boolean;
}

export interface UserOrder {
  id: string;
  email?: string;
  date: string;
  status: 'processing' | 'shipped' | 'delivered';
  total: number;
  items: { id: string; name: string; qty: number; price: number }[];
  tracking?: string;
}

export interface UserSession {
  loggedIn: boolean;
  profile: UserProfile | null;
}

export interface AdminProfile {
  username: string;
  displayName: string;
  email: string;
  role: 'owner' | 'admin' | 'ops' | 'support';
  createdAt: string;
  lastLoginAt?: string;
}

export interface AutomationRule {
  id: string;
  trigger: string;
  condition: string;
  action: string;
  active: boolean;
}

export type CheckoutAddress = {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  address1: string;
  address2?: string;
  city: string;
  state?: string;
  zip: string;
  country: string;
};

export type CheckoutRequest = {
  items: Array<{
    productId: string;
    name: string;
    qty: number;
    price: number;
    sourceType: 'affiliate' | 'dropship' | 'own';
    affiliateUrl?: string;
    affiliateNetworkId?: string;
    supplierId?: string;
    supplier?: string;
    sku?: string;
  }>;
  currency: string;
  couponCode?: string | null;
  shippingMethod: 'standard' | 'express' | 'priority';
  totals: {
    subtotal: number;
    discount: number;
    shipping: number;
    tax: number;
    total: number;
  };
  address: CheckoutAddress;
  notes?: {
    gift?: boolean;
    giftMessage?: string;
    orderNote?: string;
  };
};

export type CheckoutResult = {
  orderId: string;
  trackingNumber?: string;
  carrier?: string;
  status?: 'processing' | 'shipped' | 'delivered';
  message?: string;
};

interface ShopState {
  products: Product[];
  cart: CartItem[];
  aiInsights: AIInsight[];
  chatMessages: ChatMessage[];
  currentView:
    | 'shop' | 'dashboard' | 'ai-center' | 'orders' | 'suppliers' | 'marketing' | 'research' | 'finances' | 'landing-pages'
    | 'admin-products' | 'admin-suppliers' | 'admin-settings' | 'admin-integrations' | 'admin-orders' | 'admin-coupons' | 'admin-affiliates' | 'admin-profile' | 'admin-operations' | 'admin-automation-rules' | 'admin-supplier-suggestions'
    | 'account' | 'wishlist' | 'product-detail' | 'support-contact' | 'support-shipping' | 'support-returns' | 'support-faq' | 'legal-privacy' | 'legal-terms' | 'legal-imprint' | 'not-found';
  shopMode: 'browse' | 'wishlist' | 'compare' | 'account';
  selectedProduct: Product | null;
  searchQuery: string;
  selectedCategory: string;
  aiAutoPilot: boolean;
  totalRevenue: number;
  totalOrders: number;
  conversionRate: number;
  customerSatisfaction: number;
  darkMode: boolean;
  chatOpen: boolean;
  cartOpen: boolean;
  purchaseModal: { open: boolean; product: Product | null };
  suppliers: AdminSupplier[];

  toggleCart: () => void;
  setPurchaseModal: (open: boolean, product: Product | null) => void;
  setCartOpen: (open: boolean) => void;
  affiliateNetworks: AffiliateNetwork[];
  settings: ShopSettings;
  integrations: Integrations;
  campaigns: Campaign[];
  influencers: Influencer[];
  financeSnapshots: FinanceSnapshot[];
  wishlist: string[];
  compareList: string[];
  recentlyViewed: string[];
  appliedCoupon: Coupon | null;
  coupons: Coupon[];
  bundleDeals: BundleDeal[];
  currency: Currency;
  currencies: Currency[];
  cookieConsent: boolean | null;
  isLoading: boolean;
  toasts: ToastMessage[];
  userSession: UserSession;
  userOrders: UserOrder[];
  userAddresses: UserAddress[];
  adminProfile: AdminProfile;
  automationRules: AutomationRule[];
  language: 'en' | 'de' | 'es' | 'fr' | 'zh';
  translations: Record<string, any>;

  setLanguage: (lang: 'en' | 'de' | 'es' | 'fr' | 'zh') => void;
  addAutomationRule: (rule: AutomationRule) => void;
  updateAutomationRule: (id: string, updates: Partial<AutomationRule>) => void;
  deleteAutomationRule: (id: string) => void;
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  setCurrentView: (view: ShopState['currentView']) => void;
  setShopMode: (mode: ShopState['shopMode']) => void;
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: string) => void;
  toggleAiAutoPilot: () => void;
  addChatMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  setChatMessages: (messages: ChatMessage[]) => void;
  clearChatMessages: () => void;
  addAiInsight: (insight: Omit<AIInsight, 'id' | 'timestamp'>) => void;
  toggleChat: () => void;
  clearCart: () => void;
  addProduct: (product: Product) => void;
  updateProduct: (productId: string, updates: Partial<Product>) => void;
  deleteProduct: (productId: string) => void;
  addSupplier: (supplier: AdminSupplier) => void;
  updateSupplier: (supplierId: string, updates: Partial<AdminSupplier>) => void;
  deleteSupplier: (supplierId: string) => void;
  addAffiliateNetwork: (network: AffiliateNetwork) => void;
  updateAffiliateNetwork: (networkId: string, updates: Partial<AffiliateNetwork>) => void;
  deleteAffiliateNetwork: (networkId: string) => void;
  addCampaign: (campaign: Campaign) => void;
  updateCampaign: (id: string, updates: Partial<Campaign>) => void;
  deleteCampaign: (id: string) => void;
  addInfluencer: (influencer: Influencer) => void;
  updateInfluencer: (id: string, updates: Partial<Influencer>) => void;
  deleteInfluencer: (id: string) => void;
  updateSettings: (updates: Partial<ShopSettings>) => void;
  updateIntegrations: (updates: Partial<Integrations>) => void;
  toggleWishlist: (productId: string) => void;
  toggleCompare: (productId: string) => void;
  addToRecentlyViewed: (productId: string) => void;
  applyCoupon: (code: string) => boolean;
  removeCoupon: () => void;
  addCoupon: (coupon: Coupon) => void;
  updateCoupon: (couponId: string, updates: Partial<Coupon>) => void;
  deleteCoupon: (couponId: string) => void;
  setCurrency: (code: string) => void;
  setCookieConsent: (consent: boolean) => void;
  toggleDarkMode: () => void;
  setLoading: (loading: boolean) => void;
  pushToast: (toast: Omit<ToastMessage, 'id'>) => void;
  clearToast: (id: string) => void;
  clearToasts: () => void;
  loginUser: (email: string, password: string) => boolean;
  registerUser: (data: Omit<UserProfile, 'id' | 'createdAt' | 'loyaltyTier' | 'loyaltyPoints'> & { password: string }) => boolean;
  logoutUser: () => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  addAddress: (address: UserAddress) => void;
  updateAddress: (addressId: string, updates: Partial<UserAddress>) => void;
  deleteAddress: (addressId: string) => void;
  addUserOrder: (order: UserOrder) => void;
  updateUserOrder: (orderId: string, updates: Partial<UserOrder>) => void;
  bulkUpsertProducts: (products: Product[], opts?: { prepend?: boolean }) => void;
  updateAdminProfile: (updates: Partial<AdminProfile>) => void;
  setSelectedProduct: (product: Product | null) => void;
  checkoutAndFulfill: (req: CheckoutRequest) => Promise<CheckoutResult>;
  syncFromSupabase: () => Promise<{ ok: boolean; message: string }>;
  syncToSupabase: () => Promise<{ ok: boolean; message: string }>;
  addBundleToCart: (bundleId: string) => void;
}

const STORAGE_KEY = 'nexus_admin_state_v1';
const CART_KEY = 'nexus_cart_v1';
const WISHLIST_KEY = 'nexus_wishlist_v1';
const COMPARE_KEY = 'nexus_compare_v1';
const RECENT_KEY = 'nexus_recent_viewed_v1';
const USER_KEY = 'nexus_user_session_v1';
const THEME_KEY = 'nexus_theme_v1';
const CURRENCY_KEY = 'nexus_currency_v1';
const ADMIN_PROFILE_KEY = 'nexus_admin_profile_v1';

const loadTheme = (): boolean => {
  // Light-mode first: only enable dark mode if the user explicitly chose it.
  if (typeof window === 'undefined') return false;
  try {
    const stored = localStorage.getItem(THEME_KEY);
    return stored === 'dark';
  } catch {
    return false;
  }
};

const saveTheme = (dark: boolean) => {
  if (typeof window === 'undefined') return;
  try { localStorage.setItem(THEME_KEY, dark ? 'dark' : 'light'); } catch { /* ignore */ }
};

const saveCookieConsent = (consent: boolean) => {
  if (typeof window === 'undefined') return;
  try { localStorage.setItem('nexus_cookie_consent', String(consent)); } catch { /* ignore */ }
};

const loadCurrencyCode = (): string | null => {
  if (typeof window === 'undefined') return null;
  try { return localStorage.getItem(CURRENCY_KEY); } catch { return null; }
};

const saveCurrencyCode = (code: string) => {
  if (typeof window === 'undefined') return;
  try { localStorage.setItem(CURRENCY_KEY, code); } catch { /* ignore */ }
};

const defaultSuppliers: AdminSupplier[] = [
  { id: 'sup-01', name: 'Shenzhen Prime Tech', type: 'dropship', region: 'Asia', status: 'active', rating: 4.9, shippingTime: '5-8 days', priceIndex: 72, apiEndpoint: 'https://api.shenzhenprime.com', website: 'https://shenzhenprime.com', contactEmail: 'sales@shenzhenprime.com' },
  { id: 'sup-02', name: 'Global Fulfillment EU', type: 'warehouse', region: 'EU', status: 'active', rating: 4.7, shippingTime: '2-4 days', priceIndex: 98, apiEndpoint: 'https://api.globalfulfillment.eu', website: 'https://globalfulfillment.eu', contactEmail: 'support@globalfulfillment.eu' },
  { id: 'sup-03', name: 'Affiliate Nexus Network', type: 'affiliate', region: 'Global', status: 'active', rating: 4.6, shippingTime: 'Varies', priceIndex: 88, website: 'https://affiliatenexus.io', contactEmail: 'partners@affiliatenexus.io' },
];

const defaultProducts: Product[] = [
  { id: 'p1', name: 'MagSafe 3-in-1 Charging Station', description: 'Charge your iPhone, AirPods & Apple Watch simultaneously.', price: 34.99, originalPrice: 59.99, category: 'Phone Accessories', image: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=600&q=80', rating: 4.8, reviews: 12847, stock: 340, aiScore: 97, trending: true, tags: ['#1 Best Seller', 'Fast Ship'], supplier: 'Shenzhen Prime Tech', margin: 62, aiOptimized: true, demandScore: 98, sold: 48200, badge: 'BEST SELLER', sourceType: 'dropship', supplierId: 'sup-01', supplierPrice: 12.4, sku: 'MS-3IN1-01', status: 'active', aiInsights: { fitScore: 98, valueIntegrity: 92, demandVelocity: 87, aiReasoning: "This product is currently trending in your region. Our dynamic pricing engine just secured a 12% lower entry price." }, marketComparison: [{ competitor: 'Amazon', price: 44.99 }, { competitor: 'BestBuy', price: 49.00 }], ugcPhotos: ['https://images.unsplash.com/photo-1616348436168-de43ad0db179?w=400&q=80', 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=400&q=80'] },
  { id: 'p2', name: 'GaN 100W Fast Charger USB-C', description: 'Ultra-compact 100W charger for laptops, phones & tablets.', price: 29.99, originalPrice: 49.99, category: 'Phone Accessories', image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600&q=80', rating: 4.9, reviews: 8932, stock: 520, aiScore: 96, trending: true, tags: ['Top Rated', 'Universal'], supplier: 'Global Fulfillment EU', margin: 58, aiOptimized: true, demandScore: 95, sold: 31400, badge: 'TOP RATED', sourceType: 'dropship', supplierId: 'sup-02', supplierPrice: 10.9, sku: 'GAN-100W-02', status: 'active', aiInsights: { fitScore: 96, valueIntegrity: 95, demandVelocity: 91, aiReasoning: "Universal compatibility makes this a low-return risk item. High stock availability ensures same-day dispatch." }, marketComparison: [{ competitor: 'Apple Store', price: 99.00 }, { competitor: 'Anker', price: 59.99 }] },
  { id: 'p3', name: 'Mini Massage Gun Pro', description: 'Deep tissue percussion massager. 6 speed settings.', price: 39.99, originalPrice: 79.99, category: 'Health & Wellness', image: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=600&q=80', rating: 4.7, reviews: 15420, stock: 280, aiScore: 95, trending: true, tags: ['Viral', '50% Off'], supplier: 'Shenzhen Prime Tech', margin: 65, aiOptimized: true, demandScore: 96, sold: 62300, badge: 'VIRAL', sourceType: 'dropship', supplierId: 'sup-01', supplierPrice: 14.2, sku: 'MSG-PR-03', status: 'active', aiInsights: { fitScore: 95, valueIntegrity: 88, demandVelocity: 98, aiReasoning: "High TikTok engagement detected. Seasonal demand is peaking, securing current price is recommended." }, marketComparison: [{ competitor: 'Theragun', price: 199.00 }, { competitor: 'Hyperice', price: 159.00 }] },
  { id: 'p4', name: 'LED Smart Light Strip 10m', description: 'App-controlled RGB light strip with music sync.', price: 19.99, originalPrice: 39.99, category: 'Smart Home', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&q=80', rating: 4.6, reviews: 22340, stock: 890, aiScore: 93, trending: true, tags: ['TikTok Viral', 'Easy Setup'], supplier: 'Shenzhen Prime Tech', margin: 72, aiOptimized: true, demandScore: 94, sold: 89100, badge: 'TRENDING', sourceType: 'dropship', supplierId: 'sup-01', supplierPrice: 6.8, sku: 'LED-10M-04', status: 'active' },
  { id: 'p5', name: 'Wireless Earbuds Pro ANC', description: 'Active noise cancellation, 40h battery.', price: 44.99, originalPrice: 89.99, category: 'Audio & Tech', image: 'https://images.unsplash.com/photo-1590658268037-6bf12f032f55?w=600&q=80', rating: 4.8, reviews: 9870, stock: 410, aiScore: 94, trending: false, tags: ['Premium Sound', 'ANC'], supplier: 'Global Fulfillment EU', margin: 55, aiOptimized: true, demandScore: 91, sold: 27800, sourceType: 'dropship', supplierId: 'sup-02', supplierPrice: 19.4, sku: 'EAR-ANC-05', status: 'active' },
  { id: 'p6', name: 'Pet GPS Tracker Collar', description: 'Real-time GPS tracking for dogs & cats.', price: 27.99, originalPrice: 54.99, category: 'Pet Products', image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600&q=80', rating: 4.7, reviews: 6540, stock: 320, aiScore: 92, trending: true, tags: ['Pet Owners Love', 'GPS'], supplier: 'Affiliate Nexus Network', margin: 60, aiOptimized: true, demandScore: 93, sold: 19400, badge: 'HOT', sourceType: 'affiliate', affiliateUrl: 'https://affiliate.example.com/pet-gps', supplierId: 'sup-03', supplierPrice: 12.2, sku: 'PET-GPS-06', status: 'active' },
  { id: 'p7', name: 'LED Face Beauty Mask', description: '7-color LED therapy mask for skin rejuvenation.', price: 42.99, originalPrice: 89.99, category: 'Beauty Tech', image: 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=600&q=80', rating: 4.6, reviews: 11230, stock: 190, aiScore: 91, trending: true, tags: ['Self Care', 'Viral'], supplier: 'Shenzhen Prime Tech', margin: 68, aiOptimized: true, demandScore: 92, sold: 34500, badge: 'VIRAL', sourceType: 'dropship', supplierId: 'sup-01', supplierPrice: 14.9, sku: 'LED-MSK-07', status: 'active' },
  { id: 'p8', name: 'Car Heads-Up Display HUD', description: 'OBD2 HUD showing speed, RPM, fuel & navigation.', price: 32.99, originalPrice: 64.99, category: 'Car Accessories', image: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=600&q=80', rating: 4.5, reviews: 4320, stock: 250, aiScore: 89, trending: false, tags: ['Cool Tech', 'Easy Install'], supplier: 'Global Fulfillment EU', margin: 58, aiOptimized: true, demandScore: 87, sold: 12800, sourceType: 'dropship', supplierId: 'sup-02', supplierPrice: 12.7, sku: 'HUD-08', status: 'active' },
  { id: 'p9', name: 'Portable Blender USB-C', description: 'Blend smoothies anywhere. 6 blades, USB-C rechargeable.', price: 24.99, originalPrice: 44.99, category: 'Home & Kitchen', image: 'https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=600&q=80', rating: 4.7, reviews: 18900, stock: 670, aiScore: 93, trending: true, tags: ['Health', 'Portable'], supplier: 'Shenzhen Prime Tech', margin: 64, aiOptimized: true, demandScore: 94, sold: 71200, badge: 'BEST SELLER', sourceType: 'dropship', supplierId: 'sup-01', supplierPrice: 7.8, sku: 'BLND-USB-09', status: 'active' },
  { id: 'p10', name: 'Smart Watch Fitness Tracker', description: 'Heart rate, SpO2, sleep tracking, 100+ sports modes.', price: 36.99, originalPrice: 79.99, category: 'Wearables', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80', rating: 4.6, reviews: 14200, stock: 450, aiScore: 92, trending: false, tags: ['Fitness', 'Value'], supplier: 'Global Fulfillment EU', margin: 59, aiOptimized: true, demandScore: 90, sold: 42600, sourceType: 'dropship', supplierId: 'sup-02', supplierPrice: 15.1, sku: 'SWT-10', status: 'active' },
  { id: 'p11', name: 'Ring Light 10" with Tripod', description: 'Professional ring light for content creators.', price: 22.99, originalPrice: 39.99, category: 'Audio & Tech', image: 'https://images.unsplash.com/photo-1598550476439-6847785fcea6?w=600&q=80', rating: 4.8, reviews: 7650, stock: 380, aiScore: 90, trending: false, tags: ['Creator', 'Content'], supplier: 'Shenzhen Prime Tech', margin: 61, aiOptimized: true, demandScore: 88, sold: 23400, sourceType: 'dropship', supplierId: 'sup-01', supplierPrice: 8.1, sku: 'RNG-TRI-11', status: 'active' },
  { id: 'p12', name: 'Self-Cleaning Water Bottle', description: 'UV-C sterilization in 60 seconds.', price: 29.99, originalPrice: 54.99, category: 'Health & Wellness', image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&q=80', rating: 4.7, reviews: 5430, stock: 290, aiScore: 91, trending: true, tags: ['Eco', 'Premium'], supplier: 'Affiliate Nexus Network', margin: 57, aiOptimized: true, demandScore: 89, sold: 18700, badge: 'ECO', sourceType: 'affiliate', affiliateUrl: 'https://affiliate.example.com/uv-bottle', supplierId: 'sup-03', supplierPrice: 12.9, sku: 'UV-BTL-12', status: 'active' },
  { id: 'p13', name: 'Magnetic Phone Mount for Car', description: 'N52 neodymium magnets, 360° rotation.', price: 14.99, originalPrice: 29.99, category: 'Car Accessories', image: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=600&q=80', rating: 4.8, reviews: 19800, stock: 950, aiScore: 94, trending: false, tags: ['Impulse Buy', 'Must Have'], supplier: 'Shenzhen Prime Tech', margin: 74, aiOptimized: true, demandScore: 95, sold: 87300, sourceType: 'dropship', supplierId: 'sup-01', supplierPrice: 4.1, sku: 'MAG-MNT-13', status: 'active' },
  { id: 'p14', name: 'Aroma Diffuser & Humidifier', description: 'Ultrasonic essential oil diffuser, 7 LED colors.', price: 21.99, originalPrice: 42.99, category: 'Smart Home', image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600&q=80', rating: 4.6, reviews: 8760, stock: 430, aiScore: 88, trending: false, tags: ['Relaxation', 'Home'], supplier: 'Global Fulfillment EU', margin: 66, aiOptimized: true, demandScore: 86, sold: 29100, sourceType: 'dropship', supplierId: 'sup-02', supplierPrice: 7.5, sku: 'AROMA-14', status: 'active' },
  { id: 'p15', name: 'Heatless Hair Curler Set', description: 'Get perfect curls overnight. No heat damage.', price: 12.99, originalPrice: 24.99, category: 'Beauty Tech', image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&q=80', rating: 4.5, reviews: 31200, stock: 1200, aiScore: 95, trending: true, tags: ['TikTok Hit', 'Gift Idea'], supplier: 'Shenzhen Prime Tech', margin: 78, aiOptimized: true, demandScore: 97, sold: 124000, badge: '#1 MOST SOLD', sourceType: 'dropship', supplierId: 'sup-01', supplierPrice: 2.9, sku: 'CURL-SET-15', status: 'active' },
  { id: 'p16', name: 'Pet Self-Cleaning Brush', description: 'One-click hair removal brush for dogs & cats.', price: 11.99, originalPrice: 24.99, category: 'Pet Products', image: 'https://images.unsplash.com/photo-1583337130417-13104dec14a7?w=600&q=80', rating: 4.8, reviews: 9870, stock: 780, aiScore: 93, trending: false, tags: ['Pet Care', 'Easy Clean'], supplier: 'Affiliate Nexus Network', margin: 76, aiOptimized: true, demandScore: 92, sold: 56700, sourceType: 'affiliate', affiliateUrl: 'https://affiliate.example.com/pet-brush', supplierId: 'sup-03', supplierPrice: 3.1, sku: 'PET-BR-16', status: 'active' },
  { id: 'p17', name: 'Laptop Stand Aluminum', description: 'Ergonomic laptop riser, adjustable height.', price: 26.99, originalPrice: 49.99, category: 'Home & Kitchen', image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&q=80', rating: 4.7, reviews: 6230, stock: 340, aiScore: 89, trending: false, tags: ['WFH Essential', 'Ergonomic'], supplier: 'Global Fulfillment EU', margin: 55, aiOptimized: true, demandScore: 87, sold: 21300, sourceType: 'dropship', supplierId: 'sup-02', supplierPrice: 11.5, sku: 'LPT-STD-17', status: 'active' },
  { id: 'p18', name: 'Smart Door Lock Fingerprint', description: 'Keyless entry with fingerprint, PIN, app & key.', price: 54.99, originalPrice: 119.99, category: 'Smart Home', image: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=600&q=80', rating: 4.6, reviews: 3450, stock: 160, aiScore: 90, trending: true, tags: ['Security', 'Smart'], supplier: 'Global Fulfillment EU', margin: 52, aiOptimized: true, demandScore: 88, sold: 8900, badge: 'NEW', sourceType: 'dropship', supplierId: 'sup-02', supplierPrice: 26.3, sku: 'LOCK-FP-18', status: 'active' },
];

const defaultAffiliateNetworks: AffiliateNetwork[] = [
  { id: 'aff-01', name: 'Impact Radius', status: 'active', trackingUrl: 'https://track.impact.com', commissionRate: 12, cookieDays: 30 },
  { id: 'aff-02', name: 'Partnerize', status: 'active', trackingUrl: 'https://track.partnerize.com', commissionRate: 10, cookieDays: 14 },
];

const defaultSettings: ShopSettings & { openClawUrl: string; openClawSecret: string; n8nWebhookUrl: string; nvidiaApiKey: string } = {
  storeName: 'NEXUS AI Commerce',
  supportEmail: 'support@nexusai.store',
  supportPhone: '+1 (555) 456-9000',
  defaultCurrency: 'USD',
  timezone: 'UTC',
  primaryMarket: 'Global',
  returnPolicyDays: 30,

  // Admin/ops model provider
  aiProvider: 'puter',
  aiApiKey: '',
  aiBaseUrl: '',
  aiModel: 'gpt-4o-mini',
  aiTemperature: 0.3,
  aiMaxTokens: 2048,

  // Buyer-facing concierge (User-Pays)
  buyerAiProvider: 'puter',
  buyerAiModel: 'gpt-4o-mini',
  autopilotEnabled: true,
  autoPricing: true,
  autoSourcing: true,
  autoMarketing: true,
  autoSupport: true,
  autoFulfillment: true,
  autoContent: true,
  webhookOrders: 'https://hooks.nexusai.store/orders',
  webhookInventory: 'https://hooks.nexusai.store/inventory',
  webhookTracking: 'https://hooks.nexusai.store/tracking',
  supabaseUrl: localStorage.getItem('nexus_supabase_url') || '',
  supabaseAnonKey: localStorage.getItem('nexus_supabase_key') || '',
  supabaseFnCreateOrder: localStorage.getItem('nexus_supabase_fn_create') || 'create_order',
  supabaseFnFulfillOrder: localStorage.getItem('nexus_supabase_fn_fulfill') || 'fulfill_order',
  supabaseFnSendEmail: localStorage.getItem('nexus_supabase_fn_email') || 'send_email',
  supabaseFnTrackingUpdate: localStorage.getItem('nexus_supabase_fn_tracking') || 'tracking_update',
  supabaseTableProducts: localStorage.getItem('nexus_supabase_tbl_products') || 'nexus_products',
  supabaseTableSuppliers: localStorage.getItem('nexus_supabase_tbl_suppliers') || 'nexus_suppliers',
  supabaseTableCoupons: localStorage.getItem('nexus_supabase_tbl_coupons') || 'nexus_coupons',
  supabaseTableOrders: localStorage.getItem('nexus_supabase_tbl_orders') || 'nexus_orders',
  supabaseTableCustomers: localStorage.getItem('nexus_supabase_tbl_customers') || 'nexus_customers',
  supabaseTableAnalytics: localStorage.getItem('nexus_supabase_tbl_analytics') || 'nexus_analytics',
  supabaseTableAdminProfile: localStorage.getItem('nexus_supabase_tbl_admin') || 'nexus_admin',
  channels: { website: true, amazon: true, tiktokShop: true, ebay: false },
  
  openClawUrl: 'http://localhost:8080',
  openClawSecret: '',
  n8nWebhookUrl: 'http://localhost:5678/webhook/fulfill',
  nvidiaApiKey: '',
};

const defaultIntegrations: Integrations = {
  payments: ['Stripe', 'PayPal', 'Apple Pay', 'Klarna'],
  shippingCarriers: ['DHL', 'UPS', 'FedEx', 'Yanwen'],
  analytics: { googleAnalyticsId: 'G-XXXXXXX', metaPixelId: 'META-PIXEL-123', tiktokPixelId: 'TT-PIXEL-456' },
};

const defaultCampaigns: Campaign[] = [
  { id: 'camp-1', name: 'Holiday Sale 2024', platform: 'instagram', status: 'active', budget: 5000, spent: 3247, impressions: 284500, clicks: 8432, conversions: 342, roas: 4.2, aiOptimized: true, startDate: '2024-01-10' },
  { id: 'camp-2', name: 'New Year Promo', platform: 'facebook', status: 'active', budget: 3000, spent: 1856, impressions: 156000, clicks: 4521, conversions: 189, roas: 3.8, aiOptimized: true, startDate: '2024-01-01' },
];

const defaultInfluencers: Influencer[] = [
  { id: 'I1', name: 'Virtual Val', platform: 'TikTok', followers: 1200000, engagement: '8.4%', status: 'Active', roi: 450, avatar: 'https://i.pravatar.cc/150?u=val' },
  { id: 'I2', name: 'Neon Nate', platform: 'Instagram', followers: 850000, engagement: '5.2%', status: 'Scheduled', roi: 320, avatar: 'https://i.pravatar.cc/150?u=nate' },
];

const defaultFinanceSnapshots: FinanceSnapshot[] = [
  { month: 'Jan', revenue: 45000, profit: 12000, expenses: 33000 },
  { month: 'Feb', revenue: 52000, profit: 15000, expenses: 37000 },
  { month: 'Mar', revenue: 48000, profit: 13000, expenses: 35000 },
  { month: 'Apr', revenue: 61000, profit: 18000, expenses: 43000 },
  { month: 'May', revenue: 75000, profit: 24000, expenses: 51000 },
  { month: 'Jun', revenue: 82000, profit: 28000, expenses: 54000 },
];

const defaultCurrencies: Currency[] = [
  { code: 'USD', symbol: '$', rate: 1 },
  { code: 'EUR', symbol: '€', rate: 0.92 },
  { code: 'GBP', symbol: '£', rate: 0.79 },
  { code: 'JPY', symbol: '¥', rate: 149.5 },
  { code: 'CAD', symbol: 'C$', rate: 1.36 },
  { code: 'AUD', symbol: 'A$', rate: 1.53 },
  { code: 'CHF', symbol: 'CHF', rate: 0.88 },
];

const defaultCoupons: Coupon[] = [
  { id: 'coup-1', code: 'WELCOME10', type: 'percentage', value: 10, minOrder: 25, maxUses: 1000, usedCount: 234, expiresAt: null, active: true },
  { id: 'coup-2', code: 'SAVE20', type: 'percentage', value: 20, minOrder: 50, maxUses: 500, usedCount: 89, expiresAt: new Date('2026-03-31'), active: true },
  { id: 'coup-3', code: 'FLAT5', type: 'fixed', value: 5, minOrder: 30, maxUses: 2000, usedCount: 1204, expiresAt: null, active: true },
];

const generateInsights = (): AIInsight[] => [
  { id: 'ins-1', type: 'trend', title: 'Heatless Curlers demand +420%', description: 'TikTok virality driving demand.', impact: 'high', timestamp: new Date(), action: 'Increased inventory 3x', automated: true },
  { id: 'ins-2', type: 'price', title: 'Competitive price drop detected', description: 'Adjusted prices to maintain value.', impact: 'medium', timestamp: new Date(Date.now() - 3600000), action: 'Avg -6% price', automated: true },
  { id: 'ins-3', type: 'profit', title: 'Pet GPS margins optimized', description: 'Switched to secondary supplier.', impact: 'high', timestamp: new Date(Date.now() - 7200000), action: 'Saved $4,200/month', automated: true },
];

const reviveCouponDates = (coupons: unknown): Coupon[] => {
  if (!Array.isArray(coupons)) return [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return coupons.map((c: any) => ({ ...c, code: String(c.code ?? '').toUpperCase(), expiresAt: c.expiresAt ? new Date(c.expiresAt) : null })).filter((c) => !!c.code);
};

const loadPersistedState = () => {  
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Partial<Pick<ShopState, 'products' | 'suppliers' | 'settings' | 'affiliateNetworks' | 'integrations' | 'userAddresses' | 'userOrders' | 'coupons' | 'campaigns' | 'influencers'>>;
  } catch { return null; }
};

const persistState = (state: ShopState) => {
  if (typeof window === 'undefined') return;
  const snapshot = {
    products: state.products,
    suppliers: state.suppliers,
    settings: state.settings,
    affiliateNetworks: state.affiliateNetworks,
    integrations: state.integrations,
    userAddresses: state.userAddresses,
    userOrders: state.userOrders,
    coupons: state.coupons,
    campaigns: state.campaigns,
    influencers: state.influencers,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
};

const loadList = (key: string) => {
  if (typeof window === 'undefined') return [] as string[];
  try { return JSON.parse(localStorage.getItem(key) || '[]') || []; } catch { return []; }
};

const saveList = (key: string, list: string[]) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(list));
};

const loadCart = () => {
  if (typeof window === 'undefined') return [] as CartItem[];
  try { return JSON.parse(localStorage.getItem(CART_KEY) || '[]') || []; } catch { return []; }
};

const saveCart = (cart: CartItem[]) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
};

const loadAdminProfile = (): AdminProfile => {
  const fallback = { username: 'demo', displayName: 'Demo Admin', email: 'admin@nexus.local', role: 'owner' as const, createdAt: new Date().toISOString(), lastLoginAt: new Date().toISOString() };
  if (typeof window === 'undefined') return fallback;
  try { return JSON.parse(localStorage.getItem(ADMIN_PROFILE_KEY) || JSON.stringify(fallback)); } catch { return fallback; }
};

const persistAdminProfile = (profile: AdminProfile) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ADMIN_PROFILE_KEY, JSON.stringify(profile));
};

const persisted = loadPersistedState();

export const useShopStore = create<ShopState>((set, get) => ({
  products: persisted?.products ?? defaultProducts,
  cart: loadCart(),
  aiInsights: generateInsights(),
  chatMessages: [{ id: 'msg-1', role: 'ai', content: "Hey! I'm your shopping assistant. How can I help?", timestamp: new Date() }],
  currentView: 'shop',
  shopMode: 'browse',
  searchQuery: '',
  selectedCategory: 'All',
  aiAutoPilot: true,
  totalRevenue: 284320,
  totalOrders: 12847,
  conversionRate: 6.2,
  customerSatisfaction: 97.1,
  darkMode: loadTheme(),
  chatOpen: false,
  cartOpen: false,
  purchaseModal: { open: false, product: null },
  suppliers: persisted?.suppliers ?? defaultSuppliers,

  toggleCart: () => set((state) => ({ cartOpen: !state.cartOpen })),
  setCartOpen: (open) => set({ cartOpen: open }),
  setPurchaseModal: (open, product) => set({ purchaseModal: { open, product } }),
  affiliateNetworks: persisted?.affiliateNetworks ?? defaultAffiliateNetworks,
  settings: { ...defaultSettings, ...(persisted?.settings ?? {}) },
  integrations: persisted?.integrations ?? defaultIntegrations,
  campaigns: persisted?.campaigns ?? defaultCampaigns,
  influencers: persisted?.influencers ?? defaultInfluencers,
  financeSnapshots: defaultFinanceSnapshots,
  wishlist: loadList(WISHLIST_KEY),
  compareList: loadList(COMPARE_KEY),
  recentlyViewed: loadList(RECENT_KEY),
  appliedCoupon: null,
  coupons: persisted?.coupons ? reviveCouponDates(persisted.coupons) : defaultCoupons,
  bundleDeals: [
    { id: 'b1', products: ['p1', 'p2'], discountPercent: 15, savings: 9.75 },
    { id: 'b2', products: ['p3', 'p7'], discountPercent: 20, savings: 16.60 }
  ],
  currency: (() => { const code = loadCurrencyCode(); return (code ? defaultCurrencies.find(c => c.code === code) : null) ?? defaultCurrencies[0]; })(),
  currencies: defaultCurrencies,
  cookieConsent: null,
  isLoading: false,
  toasts: [],
  userSession: (() => { try { return JSON.parse(localStorage.getItem(USER_KEY) || '{"loggedIn":false,"profile":null}'); } catch { return { loggedIn: false, profile: null }; } })(),
  userOrders: persisted?.userOrders ?? [],
  userAddresses: persisted?.userAddresses ?? [],
  adminProfile: loadAdminProfile(),
  automationRules: [
    { id: '1', trigger: 'on_order_paid', condition: 'true', action: 'buy_supplier', active: true },
    { id: '2', trigger: 'on_stock_low', condition: 'true', action: 'notify_admin', active: true },
  ],
  selectedProduct: null,
  language: (localStorage.getItem('nexus_lang') as any) || 'en',
  translations: {
    en: { welcome: 'Welcome', shop: 'Shop', cart: 'Cart', search: 'Search', trending: 'Trending Now.', essentials: 'The Art of Essential Living.', explore: 'Explore Collection' },
    de: { welcome: 'Willkommen', shop: 'Shop', cart: 'Warenkorb', search: 'Suche', trending: 'Aktuelle Trends.', essentials: 'Die Kunst des Wesentlichen.', explore: 'Kollektion entdecken' },
    es: { welcome: 'Bienvenido', shop: 'Tienda', cart: 'Carrito', search: 'Buscar', trending: 'Tendencias actuales.', essentials: 'El arte de vivir lo esencial.', explore: 'Explorar colección' },
    fr: { welcome: 'Bienvenue', shop: 'Boutique', cart: 'Panier', search: 'Chercher', trending: 'Tendances actuelles.', essentials: 'L’art de vivre l’essentiel.', explore: 'Explorer la collection' },
    zh: { welcome: '欢迎', shop: '商店', cart: '购物车', search: '搜索', trending: '当前趋势', essentials: '生活的艺术', explore: '探索系列' }
  },

  setLanguage: (lang) => {
    localStorage.setItem('nexus_lang', lang);
    set({ language: lang });
  },

  setSelectedProduct: (product) => set({ selectedProduct: product }),

  addToCart: (product) => {
    if ((product.sourceType ?? 'dropship') === 'affiliate') {
      if (typeof window !== 'undefined' && product.affiliateUrl) {
        trackEvent('affiliate_click', { productId: product.id, affiliateUrl: product.affiliateUrl });
        get().pushToast({ type: 'info', message: 'Opening partner offer…' });
        window.open(product.affiliateUrl, '_blank', 'noopener,noreferrer');
        return;
      }
      get().pushToast({ type: 'error', message: 'Affiliate link missing.' });
      return;
    }
    set((state) => {
      const existing = state.cart.find((item) => item.product.id === product.id);
      const nextCart = existing
        ? state.cart.map((item) => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)
        : [...state.cart, { product, quantity: 1 }];
      saveCart(nextCart);
      return { cart: nextCart };
    });
    get().setPurchaseModal(true, product);
    get().pushToast({ type: 'success', message: `${product.name} added to cart` });
  },

  removeFromCart: (productId) => {
    set((state) => {
      const nextCart = state.cart.filter((item) => item.product.id !== productId);
      saveCart(nextCart);
      return { cart: nextCart };
    });
    get().pushToast({ type: 'info', message: 'Item removed' });
  },

  updateQuantity: (productId, quantity) =>
    set((state) => {
      const nextCart = quantity <= 0
        ? state.cart.filter((item) => item.product.id !== productId)
        : state.cart.map((item) => item.product.id === productId ? { ...item, quantity } : item);
      saveCart(nextCart);
      return { cart: nextCart };
    }),

  setCurrentView: (view) => set({ currentView: view }),
  setShopMode: (mode) => set({ shopMode: mode }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedCategory: (category) => set({ selectedCategory: category }),
  toggleAiAutoPilot: () => set((state) => ({ aiAutoPilot: !state.aiAutoPilot })),
  addChatMessage: (message) => set((state) => ({ chatMessages: [...state.chatMessages, { ...message, id: `msg-${Date.now()}`, timestamp: new Date() }] })),
  setChatMessages: (messages) => set({ chatMessages: messages }),
  clearChatMessages: () => set({ chatMessages: [] }),
  addAiInsight: (insight) => set((state) => ({ aiInsights: [{ ...insight, id: `ins-${Date.now()}`, timestamp: new Date() }, ...state.aiInsights] })),
  toggleChat: () => set((state) => ({ chatOpen: !state.chatOpen })),
  clearCart: () => set(() => { saveCart([]); return { cart: [] }; }),

  addProduct: (product) => {
    set((state) => {
      const next = { products: [product, ...state.products] };
      persistState({ ...state, ...next } as ShopState);
      return next;
    });
    const st = get();
    if (isSupabaseConfigured(st.settings)) sbPushProduct(st.settings, product).catch(() => {});
  },

  updateProduct: (productId, updates) => {
    set((state) => {
      const next = { products: state.products.map((p) => p.id === productId ? { ...p, ...updates } : p) };
      persistState({ ...state, ...next } as ShopState);
      return next;
    });
    const st = get();
    const updated = st.products.find(p => p.id === productId);
    if (updated && isSupabaseConfigured(st.settings)) sbPushProduct(st.settings, updated).catch(() => {});
  },

  deleteProduct: (productId) => {
    set((state) => {
      const next = { products: state.products.filter((p) => p.id !== productId) };
      persistState({ ...state, ...next } as ShopState);
      return next;
    });
    const st = get();
    if (isSupabaseConfigured(st.settings)) sbRemoveProduct(st.settings, productId).catch(() => {});
  },

  addSupplier: (supplier) => {
    set((state) => {
      const next = { suppliers: [supplier, ...state.suppliers] };
      persistState({ ...state, ...next } as ShopState);
      return next;
    });
    const st = get();
    if (isSupabaseConfigured(st.settings)) sbPushSupplier(st.settings, supplier).catch(() => {});
  },

  updateSupplier: (supplierId, updates) => {
    set((state) => {
      const next = { suppliers: state.suppliers.map((s) => s.id === supplierId ? { ...s, ...updates } : s) };
      persistState({ ...state, ...next } as ShopState);
      return next;
    });
    const st = get();
    const updated = st.suppliers.find(s => s.id === supplierId);
    if (updated && isSupabaseConfigured(st.settings)) sbPushSupplier(st.settings, updated).catch(() => {});
  },

  deleteSupplier: (supplierId) => {
    set((state) => {
      const next = { suppliers: state.suppliers.filter((s) => s.id !== supplierId) };
      persistState({ ...state, ...next } as ShopState);
      return next;
    });
    const st = get();
    if (isSupabaseConfigured(st.settings)) sbRemoveSupplier(st.settings, supplierId).catch(() => {});
  },

  addAffiliateNetwork: (network) => set((state) => {
    const next = { affiliateNetworks: [network, ...state.affiliateNetworks] };
    persistState({ ...state, ...next } as ShopState);
    return next;
  }),

  updateAffiliateNetwork: (id, updates) => set((state) => {
    const next = { affiliateNetworks: state.affiliateNetworks.map((n) => n.id === id ? { ...n, ...updates } : n) };
    persistState({ ...state, ...next } as ShopState);
    return next;
  }),

  deleteAffiliateNetwork: (id) => set((state) => {
    const next = { affiliateNetworks: state.affiliateNetworks.filter((n) => n.id !== id) };
    persistState({ ...state, ...next } as ShopState);
    return next;
  }),

  addCampaign: (campaign) => set((state) => {
    const next = { campaigns: [campaign, ...state.campaigns] };
    persistState({ ...state, ...next } as ShopState);
    return next;
  }),

  updateCampaign: (id, updates) => set((state) => {
    const next = { campaigns: state.campaigns.map((c) => c.id === id ? { ...c, ...updates } : c) };
    persistState({ ...state, ...next } as ShopState);
    return next;
  }),

  deleteCampaign: (id) => set((state) => {
    const next = { campaigns: state.campaigns.filter((c) => c.id !== id) };
    persistState({ ...state, ...next } as ShopState);
    return next;
  }),

  addInfluencer: (influencer) => set((state) => {
    const next = { influencers: [influencer, ...state.influencers] };
    persistState({ ...state, ...next } as ShopState);
    return next;
  }),

  updateInfluencer: (id, updates) => set((state) => {
    const next = { influencers: state.influencers.map((i) => i.id === id ? { ...i, ...updates } : i) };
    persistState({ ...state, ...next } as ShopState);
    return next;
  }),

  deleteInfluencer: (id) => set((state) => {
    const next = { influencers: state.influencers.filter((i) => i.id !== id) };
    persistState({ ...state, ...next } as ShopState);
    return next;
  }),

  updateSettings: (updates) => set((state) => {
    const nextSettings = { ...state.settings, ...updates };

    // Persist critical backend config under stable keys used by defaults.
    const persistStr = (k: string, v?: string) => {
      if (typeof window === 'undefined') return;
      if (typeof v !== 'string') return;
      try { localStorage.setItem(k, v); } catch { /* ignore */ }
    };

    if (typeof (updates as Partial<ShopSettings>).supabaseUrl === 'string') {
      persistStr('nexus_supabase_url', nextSettings.supabaseUrl);
    }
    if (typeof (updates as Partial<ShopSettings>).supabaseAnonKey === 'string') {
      persistStr('nexus_supabase_key', nextSettings.supabaseAnonKey);
    }
    if (typeof (updates as Partial<ShopSettings>).supabaseFnCreateOrder === 'string') {
      persistStr('nexus_supabase_fn_create', nextSettings.supabaseFnCreateOrder);
    }
    if (typeof (updates as Partial<ShopSettings>).supabaseFnFulfillOrder === 'string') {
      persistStr('nexus_supabase_fn_fulfill', nextSettings.supabaseFnFulfillOrder);
    }
    if (typeof (updates as Partial<ShopSettings>).supabaseFnSendEmail === 'string') {
      persistStr('nexus_supabase_fn_email', nextSettings.supabaseFnSendEmail);
    }
    if (typeof (updates as Partial<ShopSettings>).supabaseFnTrackingUpdate === 'string') {
      persistStr('nexus_supabase_fn_tracking', nextSettings.supabaseFnTrackingUpdate);
    }

    if (typeof (updates as Partial<ShopSettings>).supabaseTableProducts === 'string') {
      persistStr('nexus_supabase_tbl_products', nextSettings.supabaseTableProducts ?? '');
    }
    if (typeof (updates as Partial<ShopSettings>).supabaseTableSuppliers === 'string') {
      persistStr('nexus_supabase_tbl_suppliers', nextSettings.supabaseTableSuppliers ?? '');
    }
    if (typeof (updates as Partial<ShopSettings>).supabaseTableCoupons === 'string') {
      persistStr('nexus_supabase_tbl_coupons', nextSettings.supabaseTableCoupons ?? '');
    }
    if (typeof (updates as Partial<ShopSettings>).supabaseTableOrders === 'string') {
      persistStr('nexus_supabase_tbl_orders', nextSettings.supabaseTableOrders ?? '');
    }
    if (typeof (updates as Partial<ShopSettings>).supabaseTableCustomers === 'string') {
      persistStr('nexus_supabase_tbl_customers', nextSettings.supabaseTableCustomers ?? '');
    }
    if (typeof (updates as Partial<ShopSettings>).supabaseTableAnalytics === 'string') {
      persistStr('nexus_supabase_tbl_analytics', nextSettings.supabaseTableAnalytics ?? '');
    }
    if (typeof (updates as Partial<ShopSettings>).supabaseTableAdminProfile === 'string') {
      persistStr('nexus_supabase_tbl_admin', nextSettings.supabaseTableAdminProfile ?? '');
    }

    const next = { settings: nextSettings };
    persistState({ ...state, ...next } as ShopState);
    return next;
  }),

  updateIntegrations: (updates) => set((state) => {
    const next = { integrations: { ...state.integrations, ...updates } };
    persistState({ ...state, ...next } as ShopState);
    return next;
  }),

  toggleWishlist: (productId) => {
    set((state) => {
      const isIn = state.wishlist.includes(productId);
      const next = isIn ? state.wishlist.filter(id => id !== productId) : [...state.wishlist, productId];
      saveList(WISHLIST_KEY, next);
      get().pushToast({ type: 'success', message: isIn ? 'Removed from wishlist' : 'Saved to wishlist' });
      return { wishlist: next };
    });
  },

  toggleCompare: (productId) => set((state) => {
    const exists = state.compareList.includes(productId);
    const next = exists ? state.compareList.filter(id => id !== productId) : [...state.compareList, productId].slice(0, 4);
    saveList(COMPARE_KEY, next);
    return { compareList: next };
  }),

  addToRecentlyViewed: (productId) => set((state) => {
    const next = [productId, ...state.recentlyViewed.filter(id => id !== productId)].slice(0, 10);
    saveList(RECENT_KEY, next);
    return { recentlyViewed: next };
  }),

  applyCoupon: (code) => {
    const state = get();
    const c = state.coupons.find(c => c.code === code && c.active && c.usedCount < c.maxUses);
    if (!c) return false;
    const total = state.cart.reduce((s, i) => s + i.product.price * i.quantity, 0);
    if (total < c.minOrder) return false;
    set({ appliedCoupon: c });
    return true;
  },

  removeCoupon: () => set({ appliedCoupon: null }),

  addCoupon: (coupon) => {
    set((state) => {
      const next = { coupons: [coupon, ...state.coupons] };
      persistState({ ...state, ...next } as ShopState);
      return next;
    });
    const st = get();
    if (isSupabaseConfigured(st.settings)) sbPushCoupon(st.settings, coupon).catch(() => {});
  },

  updateCoupon: (id, updates) => {
    set((state) => {
      const next = { coupons: state.coupons.map((c) => c.id === id ? { ...c, ...updates } : c) };
      persistState({ ...state, ...next } as ShopState);
      return next;
    });
    const st = get();
    const updated = st.coupons.find(c => c.id === id);
    if (updated && isSupabaseConfigured(st.settings)) sbPushCoupon(st.settings, updated).catch(() => {});
  },

  deleteCoupon: (id) => {
    set((state) => {
      const next = { coupons: state.coupons.filter((c) => c.id !== id) };
      persistState({ ...state, ...next } as ShopState);
      return next;
    });
    const st = get();
    if (isSupabaseConfigured(st.settings)) sbRemoveCoupon(st.settings, id).catch(() => {});
  },

  setCurrency: (code) => set((state) => {
    const c = state.currencies.find(x => x.code === code);
    if (!c) return {};
    saveCurrencyCode(c.code);
    return { currency: c };
  }),

  setCookieConsent: (consent) => { saveCookieConsent(consent); set({ cookieConsent: consent }); },
  toggleDarkMode: () => set((state) => { saveTheme(!state.darkMode); return { darkMode: !state.darkMode }; }),
  setLoading: (l) => set({ isLoading: l }),
  pushToast: (t) => {
    const id = `t-${Date.now()}`;
    set(s => ({ toasts: [...s.toasts, { ...t, id }] }));
    setTimeout(() => get().clearToast(id), 3500);
  },
  clearToast: (id) => set(s => ({ toasts: s.toasts.filter(t => t.id !== id) })),
  clearToasts: () => set({ toasts: [] }),

  loginUser: (email, password) => {
    if (email === 'user@test.com' && password === 'password') {
      const profile: UserProfile = { id: 'user-1', email, firstName: 'Alex', lastName: 'Taylor', loyaltyTier: 'plus', loyaltyPoints: 1250, createdAt: new Date().toISOString() };
      const session = { loggedIn: true, profile };
      set({ userSession: session });
      localStorage.setItem(USER_KEY, JSON.stringify(session));
      return true;
    }
    return false;
  },

  registerUser: (data) => {
    const profile: UserProfile = { id: `u-${Date.now()}`, ...data, loyaltyTier: 'starter', loyaltyPoints: 0, createdAt: new Date().toISOString() };
    const session = { loggedIn: true, profile };
    set({ userSession: session });
    localStorage.setItem(USER_KEY, JSON.stringify(session));
    return true;
  },

  logoutUser: () => {
    set({ userSession: { loggedIn: false, profile: null } });
    localStorage.removeItem(USER_KEY);
  },

  updateProfile: (upd) => set((state) => {
    if (!state.userSession.profile) return {};
    const next = { userSession: { ...state.userSession, profile: { ...state.userSession.profile, ...upd } } };
    localStorage.setItem(USER_KEY, JSON.stringify(next.userSession));
    return next;
  }),

  addAddress: (addr) => set((state) => {
    const next = { userAddresses: [addr, ...state.userAddresses] };
    persistState({ ...state, ...next } as ShopState);
    return next;
  }),

  updateAddress: (id, upd) => set((state) => {
    const next = { userAddresses: state.userAddresses.map(a => a.id === id ? { ...a, ...upd } : a) };
    persistState({ ...state, ...next } as ShopState);
    return next;
  }),

  deleteAddress: (id) => set((state) => {
    const next = { userAddresses: state.userAddresses.filter(a => a.id !== id) };
    persistState({ ...state, ...next } as ShopState);
    return next;
  }),

  addUserOrder: (order) => set((state) => {
    const next = { userOrders: [order, ...state.userOrders] };
    persistState({ ...state, ...next } as ShopState);
    const st = get();
    if (isSupabaseConfigured(st.settings)) sbPushOrder(st.settings, order).catch(() => {});
    return next;
  }),

  updateUserOrder: (orderId, updates) => set((state) => {
    const nextOrders = state.userOrders.map((o) => (o.id === orderId ? { ...o, ...updates } : o));
    const next = { userOrders: nextOrders };
    persistState({ ...state, ...next } as ShopState);
    const st = get();
    const updated = nextOrders.find((o) => o.id === orderId);
    if (updated && isSupabaseConfigured(st.settings)) sbPushOrder(st.settings, updated).catch(() => {});
    return next;
  }),

  bulkUpsertProducts: (incoming, opts) => {
    const prepend = opts?.prepend ?? true;
    set((state) => {
      const byId = new Map(state.products.map((p) => [p.id, p] as const));
      incoming.forEach((p) => {
        const prev = byId.get(p.id);
        byId.set(p.id, prev ? { ...prev, ...p } : p);
      });
      const merged = Array.from(byId.values());
      // keep order stable-ish: optionally move imported to front
      const incomingIds = new Set(incoming.map((p) => p.id));
      const front = merged.filter((p) => incomingIds.has(p.id));
      const rest = merged.filter((p) => !incomingIds.has(p.id));
      const nextProducts = prepend ? [...front, ...rest] : [...rest, ...front];
      const next = { products: nextProducts };
      persistState({ ...state, ...next } as ShopState);
      return next;
    });
    const st = get();
    if (isSupabaseConfigured(st.settings)) {
      incoming.forEach((p) => sbPushProduct(st.settings, p).catch(() => {}));
    }
  },

  updateAdminProfile: (upd) => set((state) => {
    const next = { adminProfile: { ...state.adminProfile, ...upd } };
    persistAdminProfile(next.adminProfile);
    if (isSupabaseConfigured(state.settings)) sbPushAdminProfile(state.settings, next.adminProfile).catch(() => {});
    return next;
  }),

  checkoutAndFulfill: async (req) => {
    const state = get();
    const id = `NX-${Math.floor(Math.random() * 900000 + 100000)}`;
    const local: UserOrder = {
      id,
      email: req.address.email,
      date: new Date().toISOString().slice(0, 10),
      status: 'processing',
      total: req.totals.total,
      items: req.items.map(i => ({ id: i.productId, name: i.name, qty: i.qty, price: i.price })),
    };

    // Persist order immediately (offline-first) & Decrement Stock
    set(s => {
      // Decrement stock for ordered items
      const nextProducts = s.products.map(p => {
        const item = req.items.find(i => i.productId === p.id);
        if (item) {
          return { ...p, stock: Math.max(0, p.stock - item.qty), sold: p.sold + item.qty };
        }
        return p;
      });

      const next = { 
        userOrders: [local, ...s.userOrders],
        products: nextProducts
      };
      persistState({ ...s, ...next } as ShopState);
      return next;
    });

    // Best-effort push to Supabase table
    if (isSupabaseConfigured(state.settings)) {
      sbPushOrder(state.settings, local).catch(() => {});
    }

    const supabase = getSupabaseClient({ url: state.settings.supabaseUrl, anonKey: state.settings.supabaseAnonKey });
    if (!supabase) return { orderId: id, status: 'processing', message: 'Local order created (No Backend).' };

    try {
      const createFn = state.settings.supabaseFnCreateOrder || 'create_order';
      const { data: created, error: ce } = await supabase.functions.invoke(createFn, { body: { order_id: id, request: req } });
      if (ce) throw ce;

      const fulfillFn = state.settings.supabaseFnFulfillOrder || 'fulfill_order';
      const { data: fulfilled, error: fe } = await supabase.functions.invoke(fulfillFn, { body: { order_id: id, request: req, created } });
      if (fe) throw fe;

      const emailFn = state.settings.supabaseFnSendEmail || 'send_email';
      await supabase.functions.invoke(emailFn, { body: { type: 'order_confirmation', to: req.address.email, order_id: id, payload: { request: req, fulfillment: fulfilled } } });

      const tracking = (fulfilled as any)?.tracking_number;
      const carrier = (fulfilled as any)?.carrier;
      
      if (tracking) {
        set(s => {
          const nextOrders = s.userOrders.map(o => o.id === id ? { ...o, status: 'shipped' as const, tracking } : o);
          const next = { userOrders: nextOrders };
          persistState({ ...s, ...next } as ShopState);
          return next;
        });
      }

      return { orderId: id, trackingNumber: tracking, carrier, status: tracking ? 'shipped' : 'processing', message: 'Fulfillment successful.' };
    } catch (e) {
      return { orderId: id, status: 'processing', message: 'Order created locally. Fulfillment pending.' };
    }
  },

  syncFromSupabase: async () => {
    const st = get();
    if (!isSupabaseConfigured(st.settings)) return { ok: false, message: 'Not configured.' };
    try {
      const pulled = await pullAllFromSupabase(st.settings);
      set(state => {
        const next: Partial<ShopState> = {};
        if (pulled.products?.length) next.products = pulled.products;
        if (pulled.suppliers?.length) next.suppliers = pulled.suppliers;
        if (pulled.coupons?.length) next.coupons = reviveCouponDates(pulled.coupons);
        if (pulled.orders?.length) next.userOrders = pulled.orders;
        if (pulled.adminProfile) { next.adminProfile = { ...state.adminProfile, ...pulled.adminProfile }; persistAdminProfile(next.adminProfile); }
        const merged = { ...state, ...next } as ShopState;
        persistState(merged);
        return next;
      });
      return { ok: true, message: 'Synced.' };
    } catch { return { ok: false, message: 'Sync failed.' }; }
  },

  syncToSupabase: async () => {
    const st = get();
    if (!isSupabaseConfigured(st.settings)) return { ok: false, message: 'Not configured.' };
    try {
      await Promise.all([
        ...st.products.map(p => sbPushProduct(st.settings, p)),
        ...st.suppliers.map(s => sbPushSupplier(st.settings, s)),
        ...st.coupons.map(c => sbPushCoupon(st.settings, c)),
        ...st.userOrders.map(o => sbPushOrder(st.settings, o)),
        sbPushAdminProfile(st.settings, st.adminProfile),
      ]);
      return { ok: true, message: 'Synced.' };
    } catch { return { ok: false, message: 'Sync failed.' }; }
  },

  addBundleToCart: (bundleId) => {
    const state = get();
    const bundle = state.bundleDeals.find(b => b.id === bundleId);
    if (!bundle) return;

    bundle.products.forEach(pid => {
      const product = state.products.find(p => p.id === pid);
      if (product) {
        state.addToCart(product);
      }
    });

    state.pushToast({ type: 'success', message: 'Dynamic bundle added to your bag' });
  },

  addAutomationRule: (rule) => set(s => ({ automationRules: [...s.automationRules, rule] })),
  updateAutomationRule: (id, updates) => set(s => ({
    automationRules: s.automationRules.map(r => r.id === id ? { ...r, ...updates } : r)
  })),
  deleteAutomationRule: (id) => set(s => ({
    automationRules: s.automationRules.filter(r => r.id !== id)
  })),
}));
