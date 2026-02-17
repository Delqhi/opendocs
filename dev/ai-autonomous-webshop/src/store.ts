import { create } from 'zustand';

export interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  image: string;
  rating: number;
  reviews: number;
  trend: 'up' | 'down' | 'stable';
  aiScore: number;
  stock: number;
  description: string;
  features: string[];
  specs: Record<string, string>;
  isNew?: boolean;
  isBestseller?: boolean;
}

export interface Order {
  id: string;
  customer: string;
  date: string;
  total: number;
  status: 'Processing' | 'Shipped' | 'Delivered' | 'In Transit';
  items: { id: number; name: string; quantity: number; price: number }[];
  tracking: {
    number: string;
    carrier: string;
    estimatedDelivery: string;
    checkpoints: { time: string; location: string; status: string }[];
  };
}

export interface Supplier {
  id: string;
  name: string;
  location: string;
  rating: number;
  leadTime: string;
  reliability: number;
  pricingScore: number;
  aiNegotiationStatus: 'idle' | 'negotiating' | 'completed';
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

export interface Trend {
  id: string;
  keyword: string;
  platform: string;
  growth: number;
  relevance: number;
  status: 'Emerging' | 'Hot' | 'Saturating';
}

interface ShopState {
  view: 'shop' | 'dashboard' | 'ai-center' | 'orders' | 'suppliers' | 'marketing' | 'research' | 'finances' | 'landing-pages';
  setView: (view: ShopState['view']) => void;
  cart: { id: number; quantity: number }[];
  addToCart: (productId: number) => void;
  removeFromCart: (productId: number) => void;
  clearCart: () => void;
  isAiActive: boolean;
  toggleAi: () => void;
  products: Product[];
  orders: Order[];
  suppliers: Supplier[];
  influencers: Influencer[];
  trends: Trend[];
}

export const useStore = create<ShopState>((set) => ({
  view: 'shop',
  setView: (view) => set({ view }),
  cart: [],
  addToCart: (productId) =>
    set((state) => {
      const existingItem = state.cart.find((item) => item.id === productId);
      if (existingItem) {
        return {
          cart: state.cart.map((item) =>
            item.id === productId ? { ...item, quantity: item.quantity + 1 } : item
          ),
        };
      }
      return { cart: [...state.cart, { id: productId, quantity: 1 }] };
    }),
  removeFromCart: (productId) =>
    set((state) => ({
      cart: state.cart.filter((item) => item.id !== productId),
    })),
  clearCart: () => set({ cart: [] }),
  isAiActive: true,
  toggleAi: () => set((state) => ({ isAiActive: !state.isAiActive })),
  products: [
    {
      id: 1,
      name: 'NeuralLink Headset Gen 2',
      price: 299.99,
      category: 'Wearables',
      image: 'https://images.unsplash.com/photo-1544650039-22886fbb4323?w=800&q=80',
      rating: 4.8,
      reviews: 1240,
      trend: 'up',
      aiScore: 98,
      stock: 45,
      description: 'The next generation of brain-computer interface headsets.',
      features: ['Neural Feedback', '8K Audio', '24h Battery'],
      specs: { 'Bluetooth': '5.3', 'Sensors': '12-channel EEG', 'Weight': '180g' } as Record<string, string>,
      isBestseller: true,
    },
    {
      id: 2,
      name: 'CyberWatch Ultra',
      price: 499.00,
      category: 'Wearables',
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80',
      rating: 4.9,
      reviews: 890,
      trend: 'up',
      aiScore: 95,
      stock: 12,
      description: 'Rugged titanium smartwatch with AI health diagnostic.',
      features: ['Blood Oxygen', 'GPS L5', 'Solar Charging'],
      specs: { 'Material': 'Grade 5 Titanium', 'Battery': 'Up to 60 days', 'Waterproof': '100m' } as Record<string, string>,
      isNew: true,
    },
    {
      id: 3,
      name: 'Quantum Sound Pods',
      price: 189.50,
      category: 'Audio',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
      rating: 4.7,
      reviews: 2100,
      trend: 'stable',
      aiScore: 92,
      stock: 156,
      description: 'Audio quality that defies physics using quantum drivers.',
      features: ['Active Noise Cancellation', 'Lossless Audio', '360 Audio'],
      specs: { 'Driver': '12mm Quantum Nano', 'Latency': '< 10ms', 'Codecs': 'LDAC, aptX Adaptive' } as Record<string, string>,
    },
    {
      id: 4,
      name: 'HoloLens Desktop Gen Z',
      price: 1249.00,
      category: 'Electronics',
      image: 'https://images.unsplash.com/photo-1478416272538-5f7e51dc5400?w=800&q=80',
      rating: 4.6,
      reviews: 430,
      trend: 'up',
      aiScore: 96,
      stock: 8,
      description: 'Transparent holographic display for the ultimate workspace.',
      features: ['4K Holograms', 'Gesture Control', 'OLED Base'],
      specs: { 'Resolution': '3840 x 2160', 'Refresh Rate': '144Hz', 'IO': 'USB4, HDMI 2.1' } as Record<string, string>,
    }
  ],
  orders: [
    {
      id: 'ORD-8821',
      customer: 'Max Power',
      date: '2023-11-20',
      total: 799.98,
      status: 'In Transit',
      items: [{ id: 1, name: 'NeuralLink Headset Gen 2', quantity: 1, price: 299.99 }],
      tracking: {
        number: 'NX-4492-991',
        carrier: 'DroneEx Global',
        estimatedDelivery: '2023-11-22',
        checkpoints: [
          { time: '08:00', location: 'AI Warehouse Alpha', status: 'Dispatched' },
          { time: '11:30', location: 'Regional Hub East', status: 'Processed' },
        ],
      },
    }
  ],
  suppliers: [
    { id: 'S1', name: 'Shenzhen Tech Corp', location: 'China', rating: 4.9, leadTime: '5-7 days', reliability: 98, pricingScore: 95, aiNegotiationStatus: 'completed' },
    { id: 'S2', name: 'Global Components Gmbh', location: 'Germany', rating: 4.7, leadTime: '2-3 days', reliability: 99, pricingScore: 82, aiNegotiationStatus: 'idle' },
  ],
  influencers: [
    { id: 'I1', name: 'Virtual Val', platform: 'TikTok', followers: 1200000, engagement: '8.4%', status: 'Active', roi: 450, avatar: 'https://i.pravatar.cc/150?u=val' },
    { id: 'I2', name: 'Neon Nate', platform: 'Instagram', followers: 850000, engagement: '5.2%', status: 'Scheduled', roi: 320, avatar: 'https://i.pravatar.cc/150?u=nate' },
  ],
  trends: [
    { id: 'T1', keyword: 'Neural Computing', platform: 'Twitter', growth: 145, relevance: 98, status: 'Hot' },
    { id: 'T2', keyword: 'Bio-Hacking Wearables', platform: 'TikTok', growth: 88, relevance: 92, status: 'Emerging' },
  ]
}));
