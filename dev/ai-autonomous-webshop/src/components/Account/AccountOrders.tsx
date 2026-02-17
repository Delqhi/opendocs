import { useShopStore } from '../../store/shopStore';
import { Package, Truck, CheckCircle } from 'lucide-react';

export function AccountOrders() {
  const { userOrders, userSession } = useShopStore();
  const userEmail = userSession.profile?.email;

  const myOrders = userOrders.filter(o => !o.email || (userEmail && o.email.toLowerCase() === userEmail.toLowerCase()));

  if (myOrders.length === 0) {
    return (
      <div className="surface border border-subtle rounded-2xl p-6 text-center">
        <Package className="w-8 h-8 text-muted mx-auto mb-3" />
        <p className="text-sm text-muted">No orders yet. Start shopping to see your orders here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {myOrders.map((order) => (
        <div key={order.id} className="surface border border-subtle rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted">Order</p>
              <p className="text-sm text-foreground font-semibold">{order.id}</p>
            </div>
            <span className="text-xs text-muted">{order.date}</span>
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs text-muted">
            {order.status === 'processing' && <Package className="w-3 h-3" />}
            {order.status === 'shipped' && <Truck className="w-3 h-3" />}
            {order.status === 'delivered' && <CheckCircle className="w-3 h-3" />}
            <span className="capitalize">{order.status}</span>
            {order.tracking && <span>• Tracking {order.tracking}</span>}
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-muted">
            {order.items.map((item) => (
              <div key={item.id} className="bg-black/5 dark:bg-white/[0.03] rounded-lg px-2 py-1">
                {item.name} × {item.qty}
              </div>
            ))}
          </div>
          <div className="mt-3 text-sm font-semibold text-foreground">Total: ${order.total.toFixed(2)}</div>
        </div>
      ))}
    </div>
  );
}
