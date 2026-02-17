import { useState } from 'react';
import { Tag, X, Check, AlertCircle } from 'lucide-react';
import { useShopStore } from '../store/shopStore';

export function CouponInput() {
  const { appliedCoupon, applyCoupon, removeCoupon } = useShopStore();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleApply = () => {
    if (!code.trim()) {
      setError('Please enter a coupon code');
      return;
    }
    
    const applied = applyCoupon(code.trim());
    if (applied) {
      setSuccess(true);
      setError('');
      setCode('');
      setTimeout(() => setSuccess(false), 2000);
    } else {
      setError('Invalid or expired coupon code');
      setSuccess(false);
    }
  };

  if (appliedCoupon) {
    return (
      <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
        <div className="flex items-center gap-2">
          <Tag className="w-4 h-4 text-green-600 dark:text-green-400" />
          <span className="text-sm font-medium text-green-700 dark:text-green-400">
            {appliedCoupon.code}
          </span>
          <span className="text-xs text-green-600 dark:text-green-500">
            ({appliedCoupon.type === 'percentage' ? `${appliedCoupon.value}% off` : `$${appliedCoupon.value} off`})
          </span>
        </div>
        <button
          onClick={removeCoupon}
          className="p-1 text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={code}
            onChange={(e) => {
              setCode(e.target.value.toUpperCase());
              setError('');
            }}
            placeholder="Coupon code"
            className="w-full pl-10 pr-4 py-3 bg-gray-100 dark:bg-dark-700 border border-transparent focus:border-black dark:focus:border-white rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-500 outline-none transition-colors"
            onKeyDown={(e) => e.key === 'Enter' && handleApply()}
          />
        </div>
        <button
          onClick={handleApply}
          disabled={!code.trim()}
          className="px-5 py-3 bg-black dark:bg-white text-white dark:text-black rounded-xl text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Apply
        </button>
      </div>
      
      {error && (
        <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-xs">
          <AlertCircle className="w-3 h-3" />
          {error}
        </div>
      )}
      
      {success && (
        <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-xs">
          <Check className="w-3 h-3" />
          Coupon applied successfully!
        </div>
      )}
      
      <p className="text-xs text-gray-500 dark:text-gray-400">
        Try: WELCOME10, SAVE20, FLAT5
      </p>
    </div>
  );
}
