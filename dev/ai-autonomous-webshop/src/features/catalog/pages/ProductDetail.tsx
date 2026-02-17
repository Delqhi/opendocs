import { use } from 'react';
import { Suspense } from 'react';
import { Await, Link, useParams } from 'react-router';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, ChevronRight, Home } from 'lucide-react';
import { useShopStore } from '../../../store/shopStore';
import { updateMetadata } from '../../../utils/seo';
import { catalogService, type CatalogProduct } from '../services/catalogService';
import { ImageGallery } from '../components/ImageGallery';
import { ProductInfo } from '../components/ProductInfo';
import { PricingSection } from '../components/PricingSection';
import { ActionButtons } from '../components/ActionButtons';
import { TrustSignals } from '../components/TrustSignals';
import { SocialProof } from '../components/SocialProof';
import { AIScarcity } from '../components/AIScarcity';
import { SmartRecommendations } from '../components/SmartRecommendations';

function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);
}

function Breadcrumbs({ category, productName }: { category: string; productName: string }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className="flex items-center gap-1 text-sm text-gray-400">
        <li>
          <Link
            to="/"
            className="flex items-center gap-1 hover:text-white transition-colors"
          >
            <Home size={14} />
            <span>Home</span>
          </Link>
        </li>
        <li>
          <ChevronRight size={14} />
        </li>
        <li>
          <Link
            to={`/category/${category.toLowerCase()}`}
            className="hover:text-white transition-colors capitalize"
          >
            {category}
          </Link>
        </li>
        <li>
          <ChevronRight size={14} />
        </li>
        <li className="text-white truncate max-w-[200px]" aria-current="page">
          {productName}
        </li>
      </ol>
    </nav>
  );
}

function ProductDetailContent({ product }: { product: CatalogProduct }) {
  const { addToRecentlyViewed, wishlist, toggleWishlist } = useShopStore();

  const isWishlisted = wishlist.includes(String(product.id));

  const discount = Math.round(
    product.original_price
      ? (1 - product.price / product.original_price) * 100
      : 0
  );

  useEffect(() => {
    addToRecentlyViewed(String(product.id));
    window.scrollTo(0, 0);
    updateMetadata({
      title: product.name,
      description: product.description,
      image: product.image_url,
    });
  }, [addToRecentlyViewed, product]);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
    } catch {
      console.error('Failed to copy link');
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <motion.div
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/10"
      >
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-12">
          <div className="h-16 flex items-center justify-between">
            <Link
              to="/"
              className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-all group"
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              <span className="hidden sm:inline">Back</span>
            </Link>

            <h1 className="text-lg sm:text-xl font-bold tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              NEXUS
            </h1>

            <button
              type="button"
              onClick={() => toggleWishlist(String(product.id))}
              className={`flex items-center gap-2 text-sm transition-all ${
                isWishlisted ? 'text-red-500' : 'text-gray-400 hover:text-white'
              }`}
              aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              <Heart size={18} className={isWishlisted ? 'fill-current' : ''} />
            </button>
          </div>
        </div>
      </motion.div>

      <div className="pt-16">
        <div className="lg:grid lg:grid-cols-2 min-h-[calc(100vh-4rem)]">
          <ImageGallery
            images={[product.image_url]}
            productName={product.name}
            discount={discount}
            badge={product.badge}
          />

          <div className="relative bg-[#0a0a0a]">
            <div className="absolute inset-0 bg-gradient-to-bl from-white/5 via-transparent to-transparent pointer-events-none" />

            <div className="relative p-4 sm:p-6 lg:p-8 xl:p-12 space-y-6 sm:space-y-8">
              <Breadcrumbs category={product.category} productName={product.name} />

              <ProductInfo product={product} />

              <PricingSection
                price={product.price}
                originalPrice={product.original_price}
                formatPrice={formatPrice}
              />

              <ActionButtons
                productId={product.id}
                productName={product.name}
                price={product.price}
                formatPrice={formatPrice}
                onBuyNow={() => {
                  console.log('Buy now clicked');
                }}
              />

              <SocialProof
                liveActivity={{
                  viewers: Math.floor(Math.random() * 50) + 10,
                  purchasesLastHour: Math.floor(Math.random() * 10) + 1,
                  stockLevel:
                    product.stock < 10
                      ? 'critical'
                      : product.stock < 25
                        ? 'low'
                        : 'medium',
                }}
              />

              <AIScarcity
                product={{
                  ...product,
                  aiInsights:
                    product.aiInsights ?? {
                      fitScore: 94,
                      valueIntegrity: 88,
                      demandVelocity: 75,
                      reasoning: `This ${product.name} is highly demanded in the ${product.category} category.`,
                    },
                }}
              />

              <TrustSignals onShare={handleShare} />
            </div>
          </div>
        </div>
      </div>

      <SmartRecommendations />
    </div>
  );
}

export default ProductDetailPage;
