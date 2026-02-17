import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Truck, 
  RotateCcw, 
  ShieldCheck, 
  CreditCard, 
  Copy, 
  Leaf, 
  Users, 
  Award,
  Check
} from 'lucide-react';

interface TrustSignalsProps {
  onShare?: () => void;
  socialProof?: {
    purchases: number;
    reviews: number;
    rating: number;
  };
  ecoFriendly?: boolean;
}

interface SocialProofBadge {
  purchases: number;
  reviews: number;
  rating: number;
}

export function TrustSignals({ onShare, socialProof, ecoFriendly = false }: TrustSignalsProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      onShare?.();
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const signals = [
    { icon: <Truck size={20} />, title: 'Free Shipping', desc: '2-4 days' },
    { icon: <RotateCcw size={20} />, title: '30-Day Returns', desc: 'No questions' },
    { icon: <ShieldCheck size={20} />, title: '2-Year Warranty', desc: 'Full coverage' },
  ];

  const badges = [
    {
      icon: <Users size={16} />,
      label: 'Social Proof',
      color: 'from-blue-500 to-cyan-500',
      visible: !!socialProof,
      content: socialProof && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="pt-3 border-t border-white/10"
        >
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 border-2 border-black"
                  />
                ))}
              </div>
              <span className="text-gray-300">{socialProof.purchases.toLocaleString()} bought this</span>
            </div>
          </div>
          <div className="flex items-center gap-1 mt-2 text-yellow-400">
            {[...Array(5)].map((_, i) => (
              <Award
                key={i}
                size={14}
                strokeWidth={0}
                className={i < Math.floor(socialProof.rating) ? 'fill-yellow-400' : 'fill-gray-600'}
              />
            ))}
            <span className="text-gray-400 ml-1 text-xs">({socialProof.reviews.toLocaleString()} reviews)</span>
          </div>
        </motion.div>
      ),
    },
    {
      icon: <Leaf size={16} />,
      label: 'Eco-Friendly',
      color: 'from-green-500 to-emerald-500',
      visible: ecoFriendly,
      content: ecoFriendly && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="pt-3 border-t border-white/10"
        >
          <div className="flex items-center gap-2 text-green-400 text-sm">
            <Check size={14} />
            <span>Sustainably sourced & Carbon neutral shipping</span>
          </div>
          <div className="flex items-center gap-2 mt-1 text-gray-500 text-xs">
            <Leaf size={12} />
            <span>Plastic-free packaging • Recyclable materials</span>
          </div>
        </motion.div>
      ),
    },
  ];

  const visibleBadges = badges.filter(b => b.visible);

  return (
    <div className="space-y-4">
      <div className="glass rounded-2xl p-4 sm:p-6">
        <div className="grid grid-cols-3 gap-4">
          {signals.map((item, i) => (
            <div key={i} className="text-center">
              <div className="mx-auto mb-2 text-blue-400">{item.icon}</div>
              <p className="text-sm font-semibold">{item.title}</p>
              <p className="text-xs text-gray-500">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3 mt-4">
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleShare}
            className="glass py-3 rounded-xl text-sm font-medium hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
          >
            {copied ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
            {copied ? 'Copied!' : 'Share'}
          </motion.button>
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="glass py-3 rounded-xl text-sm font-medium hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
          >
            <CreditCard size={16} /> Buy Now
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {visibleBadges.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-2"
          >
            {badges.filter(b => b.visible).map((badge, i) => (
              <motion.div
                key={badge.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`glass rounded-xl p-4 bg-gradient-to-r ${badge.color} bg-opacity-10`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-white">{badge.icon}</span>
                  <span className="font-semibold text-white">{badge.label}</span>
                </div>
                {badge.content}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
