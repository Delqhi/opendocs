import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ZoomIn, X } from 'lucide-react';

interface ImageGalleryProps {
  images: string[];
  productName: string;
  discount?: number;
  badge?: string;
}

export function ImageGallery({ images, productName, discount, badge }: ImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

  const allImages = images.length > 0 ? images : ['https://via.placeholder.com/800'];
  const discountPercent = discount ?? 0;

  const handlePrev = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  }, [allImages.length]);

  const handleNext = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % allImages.length);
  }, [allImages.length]);

  return (
    <div className="relative bg-gradient-to-br from-zinc-900 to-black lg:sticky lg:top-16 lg:h-[calc(100vh-4rem)] overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/5 via-transparent to-purple-500/5 pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      <button
        type="button"
        onClick={() => setIsZoomed(true)}
        className="relative h-[50vh] sm:h-[60vh] lg:h-full w-full cursor-zoom-in overflow-hidden focus:outline-none focus:ring-2 focus:ring-white/50"
        aria-label={`${productName} - Click to zoom`}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={activeIndex}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="h-full w-full"
          >
            <img
              src={allImages[activeIndex]}
              alt={`${productName} view ${activeIndex + 1}`}
              className="w-full h-full object-cover"
              loading={activeIndex === 0 ? 'eager' : 'lazy'}
            />
          </motion.div>
        </AnimatePresence>

        {badge && (
          <div className="absolute top-4 left-4 z-10 glass px-4 py-2 rounded-full">
            <span className="text-xs font-semibold tracking-wide">{badge}</span>
          </div>
        )}

        {discountPercent > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-4 right-4 z-10 bg-red-500/90 backdrop-blur-md px-4 py-2 rounded-full shadow-lg"
          >
            <span className="text-sm font-bold">-{discountPercent}%</span>
          </motion.div>
        )}

        <div className="absolute bottom-4 right-4 z-10 glass px-3 py-2 rounded-full flex items-center gap-2">
          <ZoomIn size={14} />
          <span className="text-xs">Click to zoom</span>
        </div>
      </button>

      {allImages.length > 1 && (
        <div className="absolute bottom-4 left-4 right-4 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {allImages.map((img, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setActiveIndex(idx)}
              className={`shrink-0 w-16 h-20 rounded-lg overflow-hidden transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white/50 ${
                idx === activeIndex
                  ? 'ring-2 ring-white scale-105 shadow-lg shadow-white/20'
                  : 'opacity-50 hover:opacity-80 hover:scale-102'
              }`}
              aria-label={`View ${idx + 1}`}
              aria-current={idx === activeIndex ? 'true' : undefined}
            >
              <img src={img} className="w-full h-full object-cover" alt="" />
            </button>
          ))}
        </div>
      )}

      {allImages.length > 1 && (
        <>
          <button
            type="button"
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 glass p-3 rounded-full hover:bg-white/20 transition-all focus:outline-none focus:ring-2 focus:ring-white/50"
            aria-label="Previous image"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 glass p-3 rounded-full hover:bg-white/20 transition-all focus:outline-none focus:ring-2 focus:ring-white/50"
            aria-label="Next image"
          >
            <ChevronRight size={20} />
          </button>
        </>
      )}

      <AnimatePresence>
        {isZoomed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-label="Zoomed view"
          >
            <button
              type="button"
              onClick={() => setIsZoomed(false)}
              className="absolute top-4 right-4 p-2 glass rounded-full hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/50"
              aria-label="Close zoom view"
            >
              <X size={24} />
            </button>
            <img
              src={allImages[activeIndex]}
              alt={`${productName} zoomed`}
              className="max-w-full max-h-full object-contain rounded-lg"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
