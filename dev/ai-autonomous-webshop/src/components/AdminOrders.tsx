import { useState } from 'react';
import { useShopStore } from '../store/shopStore';
import { 
  History, 
  Package, 
  Search, 
  CheckCircle, 
  Clock, 
  Truck, 
  Filter,
  ArrowUpDown,
  Download,
  MoreVertical,
  Eye,
  AlertCircle
} from 'lucide-react';

export function AdminOrders() {
  const { userOrders } = useShopStore();
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'processing' | 'shipped' | 'delivered'>('all');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'total-desc' | 'total-asc'>('newest');

  const filteredOrders = userOrders.filter(order => {
    const matchesQuery = order.id.toLowerCase().includes(query.toLowerCase()) || 
                         order.items.some(it => it.name.toLowerCase().includes(query.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesQuery && matchesStatus;
  }).sort((a, b) => {
    if (sortOrder === 'newest') return b.date.localeCompare(a.date);
    if (sortOrder === 'oldest') return a.date.localeCompare(b.date);
    if (sortOrder === 'total-desc') return b.total - a.total;
    if (sortOrder === 'total-asc') return a.total - b.total;
    return 0;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <History className="w-7 h-7 text-primary-400" />
            Order Management
          </h2>
          <p className="text-sm text-gray-500 mt-1">Monitor fulfillment status and order history.</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 transition-all text-sm">
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Orders" value={userOrders.length} icon={<Package className="w-4 h-4" />} />
        <StatCard label="Processing" value={userOrders.filter(o => o.status === 'processing').length} icon={<Clock className="w-4 h-4 text-blue-400" />} />
        <StatCard label="Shipped" value={userOrders.filter(o => o.status === 'shipped').length} icon={<Truck className="w-4 h-4 text-amber-400" />} />
        <StatCard label="Delivered" value={userOrders.filter(o => o.status === 'delivered').length} icon={<CheckCircle className="w-4 h-4 text-emerald-400" />} />
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input 
            type="text" 
            placeholder="Search by ID or product..." 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-primary-500/50 transition-colors"
          />
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="appearance-none pl-9 pr-8 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
            </select>
          </div>
          <div className="relative">
            <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
            <select 
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as any)}
              className="appearance-none pl-9 pr-8 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none cursor-pointer"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="total-desc">Total (High-Low)</option>
              <option value="total-asc">Total (Low-High)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="glass rounded-2xl border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/[0.02] border-b border-white/5">
                <th className="px-6 py-4 text-[10px] uppercase tracking-wider font-bold text-gray-500">Order ID</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-wider font-bold text-gray-500">Date</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-wider font-bold text-gray-500">Status</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-wider font-bold text-gray-500">Items</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-wider font-bold text-gray-500 text-right">Total</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-wider font-bold text-gray-500"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-white/[0.01] transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-white font-mono">{order.id}</span>
                      {order.tracking && (
                        <span className="text-[10px] text-gray-500 mt-0.5 flex items-center gap-1">
                          <Truck className="w-2.5 h-2.5" /> {order.tracking}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-400">{order.date}</td>
                  <td className="px-6 py-4">
                    <StatusPill status={order.status} />
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      {order.items.slice(0, 2).map((item, idx) => (
                        <div key={idx} className="text-xs text-gray-400 truncate max-w-[180px]">
                          {item.name} <span className="text-gray-600">× {item.qty}</span>
                        </div>
                      ))}
                      {order.items.length > 2 && (
                        <span className="text-[10px] text-gray-600">+{order.items.length - 2} more items</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-white text-right">
                    ${order.total.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 rounded-lg bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-all opacity-0 group-hover:opacity-100">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-2 rounded-lg bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-all opacity-0 group-hover:opacity-100">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredOrders.length === 0 && (
          <div className="p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4 text-gray-600">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h3 className="text-sm font-medium text-white">No orders found</h3>
            <p className="text-xs text-gray-500 mt-1">Try adjusting your filters or search query.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: number | string; icon: React.ReactNode }) {
  return (
    <div className="glass p-4 rounded-2xl border border-white/5">
      <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider font-bold text-gray-500 mb-2">
        {icon}
        {label}
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
  );
}

function StatusPill({ status }: { status: 'processing' | 'shipped' | 'delivered' }) {
  const base = 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border';
  if (status === 'processing') {
    return (
      <span className={`${base} bg-blue-500/10 text-blue-400 border-blue-500/20`}>
        <Clock className="w-3 h-3" /> PROCESSING
      </span>
    );
  }
  if (status === 'shipped') {
    return (
      <span className={`${base} bg-amber-500/10 text-amber-400 border-amber-500/20`}>
        <Truck className="w-3 h-3" /> SHIPPED
      </span>
    );
  }
  return (
    <span className={`${base} bg-emerald-500/10 text-emerald-400 border-emerald-500/20`}>
      <CheckCircle className="w-3 h-3" /> DELIVERED
    </span>
  );
}
