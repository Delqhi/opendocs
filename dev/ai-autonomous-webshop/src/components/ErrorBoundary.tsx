import type { ReactNode } from 'react';
import { Component } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { useShopStore } from '../store/shopStore';

type Props = {
  children: ReactNode;
};

type State = {
  hasError: boolean;
  errorMessage?: string;
};

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: unknown): State {
    return {
      hasError: true,
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
    };
  }

  componentDidCatch() {
    // In production you would report errors to Sentry/Datadog etc.
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback message={this.state.errorMessage} />;
    }

    return this.props.children;
  }
}

function ErrorFallback({ message }: { message?: string }) {
  const { setCurrentView } = useShopStore();
  const reload = () => window.location.reload();

  return (
    <div className="min-h-screen bg-app text-foreground flex items-center justify-center px-4">
      <div className="w-full max-w-lg surface border border-subtle rounded-3xl p-6 sm:p-10 text-center">
        <div className="w-14 h-14 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-7 h-7" />
        </div>
        <h1 className="mt-4 text-xl font-bold">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted">
          The app hit an unexpected error. You can reload, or go back to the shop.
        </p>
        {message && (
          <div className="mt-4 text-left text-xs text-muted bg-black/5 dark:bg-white/[0.04] border border-subtle rounded-2xl p-3">
            <div className="font-semibold text-foreground mb-1">Error</div>
            <div className="font-mono break-words">{message}</div>
          </div>
        )}

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={reload}
            className="px-4 py-3 rounded-2xl bg-foreground text-white text-sm font-semibold inline-flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" /> Reload
          </button>
          <button
            onClick={() => setCurrentView('shop')}
            className="px-4 py-3 rounded-2xl border border-subtle text-sm font-semibold inline-flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" /> Back to shop
          </button>
        </div>
      </div>
    </div>
  );
}
