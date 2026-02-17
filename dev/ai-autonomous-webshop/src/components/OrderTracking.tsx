import { Package, Truck, Clock, Brain, Zap, RefreshCw, Phone, Mail, ChevronRight, Box, Home } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { useShopStore, type UserOrder } from '../store/shopStore';

interface Order {
  id: string;
  date: string;
  status: 'processing' | 'shipped' | 'transit' | 'delivered';
  items: { name: string; image: string; price: number; quantity: number }[];
  total: number;
  tracking: string;
  eta: string;
  carrier: string;
  aiOptimized: boolean;
}

const mapUserOrderToTracking = (order: UserOrder): Order => ({
  id: order.id,
  date: order.date,
  status: order.status === 'shipped' ? 'transit' : order.status,
  items: order.items.map((i) => ({ name: i.name, image: '📦', price: i.price, quantity: i.qty })),
  total: order.total,
  tracking: order.tracking ?? 'Tracking pending',
  eta: order.status === 'delivered' ? 'Delivered' : 'Estimated 3-7 days',
  carrier: order.tracking ? 'AutoCarrier' : 'Pending',
  aiOptimized: true,
});

const trackingSteps = [
  { status: 'processing', label: 'Bestellung aufgegeben', icon: Box },
  { status: 'shipped', label: 'Versendet', icon: Package },
  { status: 'transit', label: 'Unterwegs', icon: Truck },
  { status: 'delivered', label: 'Zugestellt', icon: Home },
];

export function OrderTracking() {
  const { userOrders } = useShopStore();
  const orders = useMemo(() => userOrders.map(mapUserOrderToTracking), [userOrders]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(orders[0] ?? null);
  const [liveUpdates, setLiveUpdates] = useState<string[]>([]);

  useEffect(() => {
    if (orders.length && !selectedOrder) {
      setSelectedOrder(orders[0]);
    }
  }, [orders, selectedOrder]);

  useEffect(() => {
    const updates = [
      'KI hat optimale Lieferroute berechnet → 2h schneller',
      'Paket hat Verteilzentrum Frankfurt passiert',
      'Zustellung heute zwischen 14:00-16:00 Uhr',
      'Fahrer ist 3 Stops entfernt',
    ];
    
    let index = 0;
    const interval = setInterval(() => {
      setLiveUpdates(prev => [...prev.slice(-3), updates[index % updates.length]]);
      index++;
    }, 4000);
    
    return () => clearInterval(interval);
  }, []);

  const getStatusIndex = (status: Order['status']) => {
    return trackingSteps.findIndex(s => s.status === status);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <Package className="w-7 h-7 text-primary-400" />
            Bestellungen & Tracking
          </h2>
          <p className="text-sm text-gray-500 mt-1">KI-optimierte Lieferverfolgung in Echtzeit</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 glass rounded-xl">
          <div className="w-2 h-2 bg-accent-400 rounded-full animate-pulse" />
          <span className="text-xs text-accent-300">Live-Tracking aktiv</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Orders List */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Meine Bestellungen</h3>
          {orders.map((order: Order) => (
            <div
              key={order.id}
              onClick={() => setSelectedOrder(order)}
              className={`glass rounded-2xl p-4 cursor-pointer transition-all ${
                selectedOrder?.id === order.id ? 'border-primary-500/30 bg-primary-500/5' : 'hover:border-white/10'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-primary-400 font-mono">{order.id}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                  order.status === 'delivered' ? 'bg-accent-500/20 text-accent-400' :
                  order.status === 'transit' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-blue-500/20 text-blue-400'
                }`}>
                  {order.status === 'delivered' ? 'Geliefert' : 
                   order.status === 'transit' ? 'Unterwegs' : 
                   order.status === 'shipped' ? 'Versendet' : 'In Bearbeitung'}
                </span>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <div className="flex -space-x-2">
                  {order.items.slice(0, 3).map((item: Order['items'][number], i: number) => (
                    <div key={i} className="w-8 h-8 rounded-lg bg-dark-700 flex items-center justify-center text-lg border border-dark-600">
                      {item.image}
                    </div>
                  ))}
                  {order.items.length > 3 && (
                    <div className="w-8 h-8 rounded-lg bg-dark-700 flex items-center justify-center text-xs text-gray-400 border border-dark-600">
                      +{order.items.length - 3}
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-white font-medium">{order.items.length} Artikel</p>
                  <p className="text-xs text-gray-500">{order.date}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-600" />
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">Gesamt: <span className="text-white font-medium">€{order.total.toFixed(2)}</span></span>
                {order.aiOptimized && (
                  <span className="flex items-center gap-1 text-primary-400">
                    <Zap className="w-3 h-3" />
                    KI-optimiert
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Order Details */}
        {selectedOrder && (
          <div className="lg:col-span-2 space-y-6">
            {/* Tracking Progress */}
            <div className="glass rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-white">{selectedOrder.id}</h3>
                  <p className="text-sm text-gray-500">Bestellt am {selectedOrder.date}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-white font-medium">{selectedOrder.carrier}</p>
                  <p className="text-xs text-gray-500 font-mono">{selectedOrder.tracking}</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="relative mb-8">
                <div className="absolute top-5 left-0 right-0 h-1 bg-dark-600 rounded-full">
                  <div 
                    className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full transition-all duration-1000"
                    style={{ width: `${((getStatusIndex(selectedOrder.status) + 1) / trackingSteps.length) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between relative z-10">
                  {trackingSteps.map((step, i) => {
                    const isCompleted = i <= getStatusIndex(selectedOrder.status);
                    const isCurrent = i === getStatusIndex(selectedOrder.status);
                    const Icon = step.icon;
                    return (
                      <div key={step.status} className="flex flex-col items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                          isCompleted ? 'bg-gradient-to-br from-primary-500 to-accent-500' : 'bg-dark-600'
                        } ${isCurrent ? 'ring-4 ring-primary-500/30 animate-pulse' : ''}`}>
                          <Icon className={`w-5 h-5 ${isCompleted ? 'text-white' : 'text-gray-500'}`} />
                        </div>
                        <p className={`text-xs mt-2 ${isCompleted ? 'text-white' : 'text-gray-500'}`}>{step.label}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ETA */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-accent-500/10 border border-accent-500/20">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-accent-400" />
                  <div>
                    <p className="text-sm text-white font-medium">Erwartete Lieferung</p>
                    <p className="text-xs text-accent-400">{selectedOrder.eta}</p>
                  </div>
                </div>
                {selectedOrder.status !== 'delivered' && (
                  <button className="px-4 py-2 rounded-xl bg-accent-500 text-white text-sm font-medium hover:bg-accent-600 transition-colors">
                    Live verfolgen
                  </button>
                )}
              </div>
            </div>

            {/* AI Optimization Info */}
            {selectedOrder.aiOptimized && selectedOrder.status !== 'delivered' && (
              <div className="glass rounded-2xl p-6 border border-primary-500/20 bg-gradient-to-r from-primary-500/5 to-transparent">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-primary-500/20">
                    <Brain className="w-6 h-6 text-primary-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-white mb-2">KI-Versandoptimierung aktiv</h4>
                    <div className="space-y-2">
                      {liveUpdates.map((update, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-gray-400 animate-slide-up">
                          <RefreshCw className="w-3 h-3 text-primary-400" />
                          {update}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Order Items */}
            <div className="glass rounded-2xl p-6">
              <h4 className="text-sm font-semibold text-white mb-4">Bestellte Artikel</h4>
              <div className="space-y-3">
                {selectedOrder.items.map((item: Order['items'][number], i: number) => (
                  <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-white/5">
                    <span className="text-3xl">{item.image}</span>
                    <div className="flex-1">
                      <p className="text-sm text-white font-medium">{item.name}</p>
                      <p className="text-xs text-gray-500">Menge: {item.quantity}</p>
                    </div>
                    <p className="text-sm text-primary-400 font-bold">€{(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-white/5 flex justify-between">
                <span className="text-sm text-gray-400">Gesamtsumme</span>
                <span className="text-lg text-white font-bold">€{selectedOrder.total.toFixed(2)}</span>
              </div>
            </div>

            {/* Help Section */}
            <div className="grid grid-cols-2 gap-4">
              <button className="glass rounded-xl p-4 flex items-center gap-3 hover:border-primary-500/30 transition-all">
                <Phone className="w-5 h-5 text-primary-400" />
                <div className="text-left">
                  <p className="text-sm text-white font-medium">Hilfe anrufen</p>
                  <p className="text-xs text-gray-500">24/7 Support</p>
                </div>
              </button>
              <button className="glass rounded-xl p-4 flex items-center gap-3 hover:border-primary-500/30 transition-all">
                <Mail className="w-5 h-5 text-accent-400" />
                <div className="text-left">
                  <p className="text-sm text-white font-medium">Kontakt per Mail</p>
                  <p className="text-xs text-gray-500">Antwort in 2h</p>
                </div>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
