import { useState, useEffect, useMemo, useCallback } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  blurHash?: string | null;
  className?: string;
  imgClassName?: string;
  loading?: 'lazy' | 'eager';
  decoding?: 'async' | 'sync' | 'auto';
  onClick?: () => void;
  aspectRatio?: string;
  sizes?: string;
  priority?: boolean;
  widths?: number[];
}

export function OptimizedImage({
  src,
  alt,
  blurHash: initialBlurHash,
  className = '',
  imgClassName = '',
  loading = 'lazy',
  decoding = 'async',
  onClick,
  aspectRatio = 'aspect-[4/5]',
  sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
  priority = false,
  widths = [400, 800, 1200],
}: OptimizedImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const [blurHash, setBlurHash] = useState<string | null>(initialBlurHash ?? null);
  const [isFetchingBlurHash, setIsFetchingBlurHash] = useState(false);

  const isRemote = useMemo(() => {
    return src.startsWith('http://') || src.startsWith('https://') || src.startsWith('//');
  }, [src]);

  const isBase64 = useMemo(() => {
    return src.startsWith('data:');
  }, [src]);

  const isOptimized = useMemo(() => {
    return src.includes('/api/v1/images/');
  }, [src]);

  const loadingStrategy = priority ? 'eager' : loading;
  const decodingStrategy = priority ? 'sync' : decoding;

  const srcSet = useMemo(() => {
    if (isRemote || isBase64) return '';
    
    if (isOptimized) {
      return widths.map(w => {
        const separator = src.includes('?') ? '&' : '?';
        return `${src}${separator}w=${w}&fmt=avif ${w}w`;
      }).join(', ');
    }
    
    return widths.map(w => {
      const separator = src.includes('?') ? '&' : '?';
      return `${src}${separator}w=${w}&fmt=avif ${w}w`;
    }).join(', ');
  }, [src, isRemote, isBase64, isOptimized, widths]);

  const fallbackSrcSet = useMemo(() => {
    if (isRemote || isBase64) return '';
    
    if (isOptimized) {
      return widths.map(w => {
        const separator = src.includes('?') ? '&' : '?';
        return `${src}${separator}w=${w}&fmt=webp ${w}w`;
      }).join(', ');
    }
    
    return widths.map(w => {
      const separator = src.includes('?') ? '&' : '?';
      return `${src}${separator}w=${w}&fmt=webp ${w}w`;
    }).join(', ');
  }, [src, isRemote, isBase64, isOptimized, widths]);

  const originalSrcSet = useMemo(() => {
    if (isRemote || isBase64) return '';
    
    return widths.map(w => {
      const separator = src.includes('?') ? '&' : '?';
      return `${src}${separator}w=${w} ${w}w`;
    }).join(', ');
  }, [src, isRemote, isBase64, widths]);

  const fetchBlurHash = useCallback(async () => {
    if (!isOptimized || blurHash) return;
    
    setIsFetchingBlurHash(true);
    try {
      const filename = src.split('/').pop()?.split('?')[0] || '';
      const response = await fetch(`/api/v1/images/${filename}/blurhash`);
      if (response.ok) {
        const data = await response.json();
        if (data.blur_hash) {
          setBlurHash(data.blur_hash);
        }
      }
    } catch {
      console.warn('Failed to fetch blurhash');
    } finally {
      setIsFetchingBlurHash(false);
    }
  }, [src, isOptimized, blurHash]);

  useEffect(() => {
    if (initialBlurHash) {
      setBlurHash(initialBlurHash);
    } else if (!blurHash && !isFetchingBlurHash && isOptimized) {
      fetchBlurHash();
    }
  }, [initialBlurHash, blurHash, isFetchingBlurHash, isOptimized, fetchBlurHash]);

  const placeholderStyle = useMemo(() => {
    if (!blurHash) return {};
    try {
      return {
        backgroundImage: blurHash.startsWith('data:') ? blurHash : `url(${blurHash})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      };
    } catch {
      return {};
    }
  }, [blurHash]);

  const handleLoad = () => {
    setLoaded(true);
  };

  const handleError = () => {
    setFailed(true);
  };

  const renderImage = () => {
    if (isRemote || isBase64) {
      return (
        <img
          src={src}
          alt={alt}
          loading={loadingStrategy}
          decoding={decodingStrategy}
          onLoad={handleLoad}
          onError={handleError}
          className={`h-full w-full object-cover transition-all duration-500 ${
            loaded ? 'opacity-100 blur-0 scale-100' : 'opacity-0 blur-xl scale-[1.02]'
          } ${imgClassName}`}
          sizes={sizes}
        />
      );
    }

    return (
      <picture>
        {srcSet && (
          <source srcSet={srcSet} type="image/avif" />
        )}
        {fallbackSrcSet && (
          <source srcSet={fallbackSrcSet} type="image/webp" />
        )}
        <img
          src={src}
          alt={alt}
          loading={loadingStrategy}
          decoding={decodingStrategy}
          onLoad={handleLoad}
          onError={handleError}
          className={`h-full w-full object-cover transition-all duration-500 ${
            loaded ? 'opacity-100 blur-0 scale-100' : 'opacity-0 blur-xl scale-[1.02]'
          } ${imgClassName}`}
          sizes={sizes}
          srcSet={originalSrcSet || undefined}
        />
      </picture>
    );
  };

  return (
    <div
      className={`relative overflow-hidden bg-black/5 dark:bg-white/[0.06] ${aspectRatio} ${className}`}
      style={placeholderStyle}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
    >
      {!failed ? renderImage() : (
        <div className="h-full w-full flex items-center justify-center text-xs text-muted">
          Image unavailable
        </div>
      )}

      {!loaded && !failed && (
        <div className="absolute inset-0 animate-shimmer" />
      )}

      {loaded && !failed && (
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent dark:from-black/20" />
      )}

      {blurHash && !loaded && !failed && (
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: blurHash.startsWith('data:') ? blurHash : `url(${blurHash})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
      )}
    </div>
  );
}
