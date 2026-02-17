import { ArrowLeft } from 'lucide-react';
import { useShopStore } from '../../store/shopStore';

export function SupportPageShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  const { setCurrentView } = useShopStore();

  return (
    <div className="surface border border-subtle rounded-3xl p-6 sm:p-10">
      <button
        onClick={() => setCurrentView('shop')}
        className="text-xs text-muted hover:text-foreground flex items-center gap-1"
      >
        <ArrowLeft className="w-4 h-4" /> Back to shop
      </button>

      <div className="mt-5">
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">{title}</h1>
        {subtitle && <p className="text-xs sm:text-sm text-muted mt-1">{subtitle}</p>}
      </div>

      <div className="mt-6">{children}</div>
    </div>
  );
}
