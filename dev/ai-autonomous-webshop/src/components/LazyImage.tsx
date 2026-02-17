import { useState } from 'react';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  loading?: 'lazy' | 'eager';
  decoding?: 'async' | 'sync' | 'auto';
  onClick?: () => void;
}

export function LazyImage({
  src,
  alt,
  className = '',
  imgClassName = '',
  loading = 'lazy',
  decoding = 'async',
  onClick,
}: LazyImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  return (
    <div
      className={`relative overflow-hidden bg-black/5 dark:bg-white/[0.06] ${className}`}
      onClick={onClick}
    >
      {!failed ? (
        <img
          src={src}
          alt={alt}
          loading={loading}
          decoding={decoding}
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          className={`h-full w-full object-cover transition-all duration-500 ${
            loaded ? 'opacity-100 blur-0 scale-100' : 'opacity-0 blur-2xl scale-[1.02]'
          } ${imgClassName}`}
        />
      ) : (
        <div className="h-full w-full flex items-center justify-center text-xs text-muted">
          Image unavailable
        </div>
      )}

      {/* subtle shimmer overlay until loaded */}
      {!loaded && !failed && <div className="absolute inset-0 animate-shimmer" />}

      {/* subtle vignette for premium feel (only after load) */}
      {loaded && !failed && <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent dark:from-black/20" />}
    </div>
  );
}
