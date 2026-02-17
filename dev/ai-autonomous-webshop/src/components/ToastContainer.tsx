import { CheckCircle, AlertTriangle, Info, X } from 'lucide-react';
import { useShopStore } from '../store/shopStore';

export function ToastContainer() {
  const { toasts, clearToast } = useShopStore();

  if (toasts.length === 0) return null;

  const iconFor = (type: 'success' | 'error' | 'info') => {
    if (type === 'success') return <CheckCircle className="w-4 h-4" />;
    if (type === 'error') return <AlertTriangle className="w-4 h-4" />;
    return <Info className="w-4 h-4" />;
  };

  const colorFor = (type: 'success' | 'error' | 'info') => {
    if (type === 'success') return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
    if (type === 'error') return 'bg-red-500/10 text-red-500 border-red-500/20';
    return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
  };

  return (
    <div className="fixed top-4 right-4 z-[120] space-y-2">
      {toasts.map((toast) => (
        <div key={toast.id} className={`min-w-[220px] max-w-xs border rounded-xl px-3 py-2 text-xs flex items-center gap-2 shadow-elev ${colorFor(toast.type)}`}>
          {iconFor(toast.type)}
          <span className="flex-1">{toast.message}</span>
          <button onClick={() => clearToast(toast.id)} className="text-inherit/60 hover:text-inherit">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
