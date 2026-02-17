import { ShoppingBag, Trash2, Plus, Minus, Truck, Shield, CreditCard, Lock, Heart, Clock, ChevronDown, Sparkles, Gift, ArrowRight, Check, Package, RotateCcw, X, MapPin, Mail, User, Phone, MessageSquare, Undo2, AlertCircle, Tag, Star, ChevronRight, Copy, Smartphone } from 'lucide-react';
import { useShopStore, type Product } from '../store/shopStore';
import { useFormatPrice } from './CurrencySelector';
import { useState, useEffect, useMemo, useCallback, useRef } from 'react';

const FREE_SHIPPING_THRESHOLD = 50;
const SHIPPING_OPTIONS = [
  { id: 'standard' as const, label: 'Standard', time: '7-14 days', days: 10, cost: 0, freeAbove: FREE_SHIPPING_THRESHOLD, baseCost: 4.99 },
  { id: 'express' as const, label: 'Express', time: '3-5 days', days: 4, cost: 9.99, freeAbove: null, baseCost: 9.99 },
  { id: 'priority' as const, label: 'Priority', time: '1-3 days', days: 2, cost: 19.99, freeAbove: null, baseCost: 19.99 },
];

type CheckoutStep = 'cart' | 'information' | 'shipping' | 'payment' | 'review' | 'confirmed';
const STEPS: CheckoutStep[] = ['cart', 'information', 'shipping', 'payment', 'review', 'confirmed'];
const STEP_LABELS: Record<CheckoutStep, string> = { cart: 'Cart', information: 'Information', shipping: 'Shipping', payment: 'Payment', review: 'Review', confirmed: 'Done' };

interface AddressForm { email: string; firstName: string; lastName: string; phone: string; address: string; city: string; state: string; zip: string; country: string; }
interface PaymentForm { method: 'card' | 'paypal' | 'klarna' | 'applepay'; cardNumber: string; cardName: string; cardExpiry: string; cardCvc: string; }

const INITIAL_ADDRESS: AddressForm = { email: '', firstName: '', lastName: '', phone: '', address: '', city: '', state: '', zip: '', country: 'US' };
const INITIAL_PAYMENT: PaymentForm = { method: 'card', cardNumber: '', cardName: '', cardExpiry: '', cardCvc: '' };

const COUNTRIES = [
  { code: 'US', name: 'United States' }, { code: 'CA', name: 'Canada' }, { code: 'GB', name: 'United Kingdom' },
  { code: 'DE', name: 'Germany' }, { code: 'FR', name: 'France' }, { code: 'AU', name: 'Australia' },
  { code: 'JP', name: 'Japan' }, { code: 'KR', name: 'South Korea' }, { code: 'BR', name: 'Brazil' },
  { code: 'IN', name: 'India' }, { code: 'MX', name: 'Mexico' }, { code: 'ES', name: 'Spain' },
  { code: 'IT', name: 'Italy' }, { code: 'NL', name: 'Netherlands' }, { code: 'SE', name: 'Sweden' },
  { code: 'CH', name: 'Switzerland' }, { code: 'AT', name: 'Austria' }, { code: 'NO', name: 'Norway' },
];

// Helper: returns dark/light class
function cl(dm: boolean, dark: string, light: string) { return dm ? dark : light; }

function EstimatedDelivery({ days }: { days: number }) {
  const now = new Date();
  const min = new Date(now.getTime() + (days - 1) * 86400000);
  const max = new Date(now.getTime() + (days + 2) * 86400000);
  const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return <span>{fmt(min)} – {fmt(max)}</span>;
}

function ProgressBar({ step, dm }: { step: CheckoutStep; dm: boolean }) {
  const idx = STEPS.indexOf(step);
  const visibleSteps = STEPS.filter(s => s !== 'confirmed');
  return (
    <div className={`flex items-center gap-1 px-4 py-3 border-b ${cl(dm, 'border-gray-800', 'border-gray-200')}`}>
      {visibleSteps.map((s, i) => {
        const sIdx = STEPS.indexOf(s);
        const done = idx > sIdx;
        const active = idx === sIdx;
        return (
          <div key={s} className="flex items-center flex-1 last:flex-initial">
            <div className={`flex items-center justify-center w-5 h-5 rounded-full text-[9px] font-bold shrink-0 transition-all ${
              done ? 'bg-emerald-500 text-white' : active ? cl(dm, 'bg-white text-black', 'bg-gray-900 text-white') : cl(dm, 'bg-gray-800 text-gray-500', 'bg-gray-200 text-gray-500')
            }`}>
              {done ? <Check className="w-3 h-3" /> : i + 1}
            </div>
            <span className={`text-[9px] ml-1 hidden sm:inline ${active ? cl(dm, 'text-white font-medium', 'text-gray-900 font-medium') : done ? 'text-emerald-500' : cl(dm, 'text-gray-600', 'text-gray-400')}`}>
              {STEP_LABELS[s]}
            </span>
            {i < visibleSteps.length - 1 && (
              <div className={`flex-1 h-px mx-2 ${done ? 'bg-emerald-500' : cl(dm, 'bg-gray-800', 'bg-gray-200')}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function CrossSellItem({ product, onAdd, dm }: { product: Product; onAdd: () => void; dm: boolean }) {
  const [added, setAdded] = useState(false);
  const discount = Math.round((1 - product.price / product.originalPrice) * 100);
  const handleAdd = () => { onAdd(); setAdded(true); setTimeout(() => setAdded(false), 1500); };
  return (
    <div className={`flex items-center gap-2.5 p-2 rounded-xl border transition-all ${cl(dm, 'bg-gray-800/50 border-gray-700 hover:border-gray-600', 'bg-gray-50 border-gray-200 hover:border-gray-300')}`}>
      <img src={product.image} alt={product.name} className="w-12 h-12 rounded-lg object-cover shrink-0" />
      <div className="flex-1 min-w-0">
        <p className={`text-[11px] font-medium truncate ${cl(dm, 'text-white', 'text-gray-900')}`}>{product.name}</p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className={`text-xs font-semibold ${cl(dm, 'text-white', 'text-gray-900')}`}>{formatPrice(product.price)}</span>
          {discount > 0 && <span className="text-[9px] text-red-500">-{discount}%</span>}
        </div>
      </div>
      <button onClick={handleAdd} className={`px-2.5 py-1.5 rounded-lg text-[10px] font-semibold transition-all shrink-0 ${
        added ? 'bg-emerald-500 text-white' : cl(dm, 'bg-gray-700 text-gray-300 hover:bg-gray-600', 'bg-gray-200 text-gray-700 hover:bg-gray-300')
      }`}>
        {added ? <Check className="w-3 h-3" /> : '+ Add'}
      </button>
    </div>
  );
}

function InputField({ label, icon: Icon, error, dm, ...props }: { label: string; icon?: React.ElementType; error?: string; dm: boolean } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="space-y-1">
      <label className={`text-[10px] font-medium uppercase tracking-wider ${cl(dm, 'text-gray-400', 'text-gray-500')}`}>{label}</label>
      <div className="relative">
        {Icon && <Icon className={`absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 ${cl(dm, 'text-gray-500', 'text-gray-400')}`} />}
        <input
          {...props}
          className={`w-full px-3 ${Icon ? 'pl-8' : ''} py-2.5 border rounded-lg text-xs focus:outline-none transition-colors ${
            cl(dm, 'bg-gray-800 text-white placeholder-gray-500 focus:border-gray-600', 'bg-white text-gray-900 placeholder-gray-400 focus:border-gray-400')
          } ${error ? 'border-red-500/50' : cl(dm, 'border-gray-700', 'border-gray-300')}`}
        />
      </div>
      {error && <p className="text-[10px] text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{error}</p>}
    </div>
  );
}

export function CartSidebar() {
  const s = useShopStore();
  const formatPrice = useFormatPrice();
  const dm = s.darkMode;
  const cartOpen = s.cartOpen;
  const setCartOpen = s.setCartOpen;

  if (!cartOpen) return null;
  const cart = s.cart;
  const removeFromCart = s.removeFromCart;
  const updateQuantity = s.updateQuantity;
  const addToCart = s.addToCart;
  const products = s.products;
  const toggleWishlist = s.toggleWishlist;
  const appliedCoupon = s.appliedCoupon;
  const checkoutAndFulfill = s.checkoutAndFulfill;
  const pushToast = s.pushToast;

  const doRemoveCoupon = useCallback(() => s.removeCoupon(), [s]);
  const clearCart = useCallback(() => s.clearCart(), [s]);
  const applyCoupon = useCallback((code: string) => s.applyCoupon(code), [s]);

  const [step, setStep] = useState<CheckoutStep>('cart');
  const [address, setAddress] = useState<AddressForm>(INITIAL_ADDRESS);
  const [payment, setPayment] = useState<PaymentForm>(INITIAL_PAYMENT);
  const [shippingMethod, setShippingMethod] = useState<'standard' | 'express' | 'priority'>('standard');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showCoupon, setShowCoupon] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [undoItem, setUndoItem] = useState<{ product: Product; quantity: number } | null>(null);
  const undoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isGift, setIsGift] = useState(false);
  const [giftMessage, setGiftMessage] = useState('');
  const [orderNote, setOrderNote] = useState('');
  const [showNote, setShowNote] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [trackingNumber, setTrackingNumber] = useState<string | null>(null);
  const [carrier, setCarrier] = useState<string | null>(null);
  const [fulfillmentMessage, setFulfillmentMessage] = useState<string | null>(null);
  const [confirmedCart, setConfirmedCart] = useState<Array<{ product: Product; quantity: number }> | null>(null);
  const [confirmedTotals, setConfirmedTotals] = useState<{ subtotal: number; discount: number; shipping: number; tax: number; total: number } | null>(null);
  const [processing, setProcessing] = useState(false);
  const [editingQty, setEditingQty] = useState<string | null>(null);
  const [qtyInput, setQtyInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('nexus_cart_step');
    if (saved) { try { const d = JSON.parse(saved); if (d.address) setAddress(d.address); if (d.shippingMethod) setShippingMethod(d.shippingMethod); } catch { /* */ } }
  }, []);

  useEffect(() => {
    if (step !== 'cart' && step !== 'confirmed') localStorage.setItem('nexus_cart_step', JSON.stringify({ address, shippingMethod }));
  }, [address, shippingMethod, step]);

  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const originalTotal = cart.reduce((sum, item) => sum + item.product.originalPrice * item.quantity, 0);
  const savings = originalTotal - subtotal;
  const totalItems = cart.reduce((a, i) => a + i.quantity, 0);

  const couponDiscount = useMemo(() => {
    if (!appliedCoupon) return 0;
    return appliedCoupon.type === 'percentage' ? subtotal * (appliedCoupon.value / 100) : Math.min(appliedCoupon.value, subtotal);
  }, [appliedCoupon, subtotal]);

  const selectedShipping = SHIPPING_OPTIONS.find(o => o.id === shippingMethod)!;
  const shippingCost = useMemo(() => {
    if (selectedShipping.freeAbove && subtotal >= selectedShipping.freeAbove) return 0;
    return selectedShipping.baseCost;
  }, [subtotal, selectedShipping]);

  const tax = (subtotal - couponDiscount) * 0.0;
  const total = Math.max(0, subtotal - couponDiscount + shippingCost + tax);
  const displayCart = confirmedCart ?? cart;
  const displayTotals = confirmedTotals ?? { subtotal, discount: couponDiscount, shipping: shippingCost, tax, total };
  const freeShipProgress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);
  const amountToFreeShip = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);

  const crossSellProducts = useMemo(() => {
    const cartCats = new Set(cart.map(i => i.product.category));
    const cartIds = new Set(cart.map(i => i.product.id));
    return products.filter(p => !cartIds.has(p.id)).sort((a, b) => {
      const am = cartCats.has(a.category) ? 1 : 0; const bm = cartCats.has(b.category) ? 1 : 0;
      return bm !== am ? bm - am : b.sold - a.sold;
    }).slice(0, 3);
  }, [cart, products]);

  const lowStockItems = cart.filter(i => i.product.stock < 30);

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) { setCouponError('Enter a code'); return; }
    const ok = applyCoupon(couponCode.trim());
    if (ok) { setCouponSuccess(true); setCouponError(''); setCouponCode(''); setTimeout(() => setCouponSuccess(false), 2000); }
    else { setCouponError('Invalid or expired code'); setCouponSuccess(false); }
  };

  useEffect(() => {
    if (cart.length === 0 && ['information', 'shipping', 'payment', 'review'].includes(step)) setStep('cart');
  }, [cart.length, step]);

  const handleRemove = useCallback((id: string) => {
    const item = cart.find(i => i.product.id === id); if (!item) return;
    setRemovingId(id);
    setTimeout(() => {
      removeFromCart(id); setRemovingId(null);
      setUndoItem({ product: item.product, quantity: item.quantity });
      if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
      undoTimerRef.current = setTimeout(() => setUndoItem(null), 6000);
    }, 300);
  }, [cart, removeFromCart]);

  const handleUndo = () => {
    if (!undoItem) return;
    addToCart(undoItem.product);
    if (undoItem.quantity > 1) updateQuantity(undoItem.product.id, undoItem.quantity);
    setUndoItem(null);
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
  };

  const handleMoveToWishlist = (id: string) => { toggleWishlist(id); handleRemove(id); };
  const handleQtyEdit = (id: string, current: number) => { setEditingQty(id); setQtyInput(String(current)); };
  const handleQtySubmit = (id: string, max: number) => { updateQuantity(id, Math.min(Math.max(1, parseInt(qtyInput) || 1), max)); setEditingQty(null); };

  const validateInformation = (): boolean => {
    const errs: Record<string, string> = {};
    if (!address.email || !/\S+@\S+\.\S+/.test(address.email)) errs.email = 'Valid email required';
    if (!address.firstName.trim()) errs.firstName = 'Required';
    if (!address.lastName.trim()) errs.lastName = 'Required';
    if (!address.address.trim()) errs.address = 'Required';
    if (!address.city.trim()) errs.city = 'Required';
    if (!address.zip.trim()) errs.zip = 'Required';
    setErrors(errs); return Object.keys(errs).length === 0;
  };

  const validatePayment = (): boolean => {
    const errs: Record<string, string> = {};
    if (payment.method === 'card') {
      if (!payment.cardNumber || payment.cardNumber.replace(/\s/g, '').length < 16) errs.cardNumber = 'Valid card number required';
      if (!payment.cardName.trim()) errs.cardName = 'Required';
      if (!payment.cardExpiry || !/^\d{2}\/\d{2}$/.test(payment.cardExpiry)) errs.cardExpiry = 'MM/YY format';
      if (!payment.cardCvc || payment.cardCvc.length < 3) errs.cardCvc = '3-4 digits';
    }
    setErrors(errs); return Object.keys(errs).length === 0;
  };

  const goToStep = (target: CheckoutStep) => {
    if (target === 'information' && cart.length === 0) return;
    if (target === 'shipping' && !validateInformation()) return;
    if (target === 'review' && !validatePayment()) return;
    setStep(target); scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePlaceOrder = async () => {
    if (processing) return;
    if (!validateInformation()) { setStep('information'); pushToast({ type: 'error', message: 'Please complete shipping info.' }); return; }
    if (!validatePayment()) { setStep('payment'); pushToast({ type: 'error', message: 'Please complete payment.' }); return; }
    setProcessing(true);
    const snapshotCart = cart.map(i => ({ product: i.product, quantity: i.quantity }));
    const snapshotTotals = { subtotal, discount: couponDiscount, shipping: shippingCost, tax, total };
    setConfirmedCart(snapshotCart); setConfirmedTotals(snapshotTotals);
    try {
      const result = await checkoutAndFulfill({
        items: cart.map(i => ({ productId: i.product.id, name: i.product.name, qty: i.quantity, price: i.product.price, sourceType: i.product.sourceType ?? 'dropship', affiliateUrl: i.product.affiliateUrl, supplierId: i.product.supplierId, supplier: i.product.supplier, sku: i.product.sku })),
        currency: 'USD', couponCode: appliedCoupon?.code ?? null, shippingMethod,
        totals: snapshotTotals,
        address: { email: address.email, firstName: address.firstName, lastName: address.lastName, phone: address.phone || undefined, address1: address.address, address2: undefined, city: address.city, state: address.state || undefined, zip: address.zip, country: address.country },
        notes: { gift: isGift, giftMessage: giftMessage || undefined, orderNote: orderNote || undefined },
      });
      setOrderNumber(result.orderId); setTrackingNumber(result.trackingNumber ?? null); setCarrier(result.carrier ?? null); setFulfillmentMessage(result.message ?? null);
      clearCart(); doRemoveCoupon(); try { localStorage.removeItem('nexus_cart_step'); } catch { /* */ }
      pushToast({ type: 'success', message: 'Order placed successfully!' }); setStep('confirmed');
    } catch { pushToast({ type: 'error', message: 'Checkout failed. Please try again.' }); } finally { setProcessing(false); }
  };

  const handleNewOrder = () => {
    clearCart();
    setTimeout(() => { setStep('cart'); setAddress(INITIAL_ADDRESS); setPayment(INITIAL_PAYMENT); setShippingMethod('standard'); setIsGift(false); setGiftMessage(''); setOrderNote(''); setConfirmedCart(null); setConfirmedTotals(null); localStorage.removeItem('nexus_cart_step'); }, 50);
  };

  const formatCard = (v: string) => v.replace(/\D/g, '').replace(/(\d{4})/g, '$1 ').trim().slice(0, 19);
  const formatExpiry = (v: string) => { const d = v.replace(/\D/g, ''); if (d.length >= 2) return d.slice(0, 2) + '/' + d.slice(2, 4); return d; };

  // Text color helpers
  const txt = cl(dm, 'text-white', 'text-gray-900');
  const txt2 = cl(dm, 'text-gray-400', 'text-gray-600');
  const txt3 = cl(dm, 'text-gray-500', 'text-gray-500');
  const bg = cl(dm, 'bg-gray-900', 'bg-white');
  const bgSub = cl(dm, 'bg-gray-800', 'bg-gray-50');
  const border = cl(dm, 'border-gray-800', 'border-gray-200');
  const borderLight = cl(dm, 'border-gray-700', 'border-gray-300');
  const inputBg = cl(dm, 'bg-gray-800 text-white placeholder-gray-500', 'bg-white text-gray-900 placeholder-gray-400');
      const btnPrimary = cl(dm, 'bg-white text-black hover:bg-blue-600 hover:text-white', 'bg-gray-900 text-white hover:bg-blue-600');

  // ==================== CONFIRMED ====================
  if (step === 'confirmed') {
    return (
      <div className={`xl:sticky xl:top-20 xl:rounded-2xl xl:border p-6 text-center space-y-5 ${bg} ${border} ${txt}`}>
        <div className="w-20 h-20 mx-auto rounded-full bg-emerald-500/20 flex items-center justify-center">
          <Check className="w-10 h-10 text-emerald-400" />
        </div>
        <div>
          <h3 className={`text-xl font-bold ${txt}`}>Order Confirmed!</h3>
          <p className={`text-sm mt-1 ${txt2}`}>Thank you for your purchase, {address.firstName}!</p>
        </div>
        <div className={`rounded-xl p-4 space-y-3 text-left ${bgSub} border ${border}`}>
          <div className="flex items-center justify-between">
            <span className={`text-[10px] uppercase tracking-wider ${txt3}`}>Order Number</span>
            <button onClick={() => navigator.clipboard.writeText(orderNumber)} className={`flex items-center gap-1 text-xs font-mono transition-colors ${txt} hover:text-emerald-500`}>
              {orderNumber} <Copy className="w-3 h-3" />
            </button>
          </div>
          {(trackingNumber || carrier) && (
            <div className={`flex items-center justify-between text-[11px] ${txt2}`}>
              <span>Tracking</span><span className={txt}>{carrier ? `${carrier} · ` : ''}{trackingNumber ?? 'pending'}</span>
            </div>
          )}
          {fulfillmentMessage && <div className={`text-[11px] ${txt2}`}>{fulfillmentMessage}</div>}
          <div className={`h-px ${cl(dm, 'bg-gray-700', 'bg-gray-200')}`} />
          <div className="space-y-2">
            {displayCart.map(item => (
              <div key={item.product.id} className="flex items-center gap-3">
                <img src={item.product.image} alt="" className="w-10 h-10 rounded-lg object-cover" />
                <div className="flex-1 min-w-0">
                  <p className={`text-[11px] truncate ${txt}`}>{item.product.name}</p>
                  <p className={`text-[10px] ${txt3}`}>Qty: {item.quantity}</p>
                </div>
                <span className={`text-xs font-medium ${txt}`}>{formatPrice(item.product.price * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className={`h-px ${cl(dm, 'bg-gray-700', 'bg-gray-200')}`} />
          <div className={`flex justify-between text-sm font-bold ${txt}`}><span>Total Paid</span><span>${displayTotals.total.toFixed(2)}</span></div>
        </div>
        <div className={`space-y-2 text-xs text-left rounded-xl p-4 ${bgSub} border ${border}`}>
          <p className={`text-[10px] uppercase tracking-wider font-medium mb-2 ${txt3}`}>What's Next</p>
          <div className={`flex items-start gap-2 ${txt2}`}><Check className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" /> <span>Confirmation email sent to <strong className={txt}>{address.email}</strong></span></div>
          <div className={`flex items-start gap-2 ${txt2}`}><Check className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" /> <span>Payment processed & secured</span></div>
          <div className={`flex items-start gap-2 ${txt2}`}><Package className="w-3.5 h-3.5 text-blue-400 mt-0.5 shrink-0" /> <span>Shipping label created</span></div>
          <div className={`flex items-start gap-2 ${txt2}`}><Truck className="w-3.5 h-3.5 mt-0.5 shrink-0" /> <span>Est. delivery: <strong className={txt}><EstimatedDelivery days={selectedShipping.days} /></strong></span></div>
          {isGift && <div className={`flex items-start gap-2 ${txt2}`}><Gift className="w-3.5 h-3.5 text-pink-400 mt-0.5 shrink-0" /> <span>Gift wrapped with message</span></div>}
        </div>
        <button onClick={handleNewOrder} className={`w-full py-3 rounded-xl text-sm font-medium transition-colors ${btnPrimary}`}>Continue Shopping</button>
        <div className={`flex items-center justify-center gap-3 text-[10px] ${txt3}`}>
          <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> Buyer Protection</span>
          <span className="flex items-center gap-1"><RotateCcw className="w-3 h-3" /> 30-Day Returns</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`xl:sticky xl:top-20 xl:rounded-2xl xl:border overflow-hidden flex flex-col max-h-[calc(100vh-5rem)] ${bg} ${border} ${txt}`}>
      {/* Header */}
      <div className={`p-4 border-b shrink-0 ${border}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className={`w-4 h-4 ${txt}`} />
            <h3 className={`font-black uppercase tracking-[0.2em] text-[11px] ${txt}`}>{step === 'cart' ? 'Your Bag' : STEP_LABELS[step]}</h3>
            {cart.length > 0 && step === 'cart' && (
              <span className={`px-2 py-0.5 border border-strong text-[9px] font-black leading-none ${cl(dm, 'bg-white text-black', 'bg-gray-900 text-white')}`}>{totalItems}</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {step !== 'cart' && (
              <button onClick={() => setStep(STEPS[Math.max(0, STEPS.indexOf(step) - 1)] as CheckoutStep)} className={`text-[11px] py-1 px-2 flex items-center gap-1 ${txt2} hover:${txt}`}>
                <ChevronDown className="w-3 h-3 rotate-90" /> Back
              </button>
            )}
            {cart.length > 0 && step === 'cart' && (
              <button onClick={clearCart} className={`text-[11px] py-1 px-2 ${txt3} hover:text-red-500`}>Clear all</button>
            )}
            <button 
              onClick={() => setCartOpen(false)}
              className={`p-2 rounded-lg hover:bg-surface-alt transition-colors ${txt2}`}
            >
              <X size={20} />
            </button>
          </div>
        </div>
      </div>

      {step !== 'cart' && <ProgressBar step={step} dm={dm} />}

      {undoItem && (
        <div className="px-4 py-2 bg-amber-500/10 border-b border-amber-500/20 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-amber-500">"{undoItem.product.name}" removed</span>
          <button onClick={handleUndo} className="flex items-center gap-1 text-[11px] text-amber-500 font-medium hover:text-amber-400"><Undo2 className="w-3 h-3" /> Undo</button>
        </div>
      )}

      <div ref={scrollRef} className="flex-1 overflow-y-auto min-h-0">
        {cart.length === 0 && step === 'cart' ? (
          <div className="p-6 text-center space-y-4">
            <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center ${bgSub}`}>
              <ShoppingBag className={`w-7 h-7 ${txt3}`} />
            </div>
            <div>
              <p className={`text-sm font-medium ${txt}`}>Your cart is empty</p>
              <p className={`text-xs mt-1 ${txt3}`}>Discover our trending products</p>
            </div>
            <div className="space-y-2 pt-2">
              <p className={`text-[10px] uppercase tracking-wider font-medium ${txt3}`}>Trending now</p>
              {products.filter(p => p.badge).slice(0, 3).map(product => (
                <CrossSellItem key={product.id} product={product} onAdd={() => addToCart(product)} dm={dm} />
              ))}
            </div>
            <div className={`flex items-center justify-center gap-3 text-[10px] pt-2 ${txt3}`}>
              <span className="flex items-center gap-1"><Truck className="w-3 h-3" /> Free shipping $50+</span>
              <span className="flex items-center gap-1"><RotateCcw className="w-3 h-3" /> 30-day returns</span>
              <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> Buyer protection</span>
            </div>
          </div>
        ) : step === 'cart' ? (
          <>
            {/* Free Shipping Bar */}
            <div className="px-4 pt-3 pb-1">
              {amountToFreeShip > 0 ? (
                <div className="space-y-1.5">
                  <div className={`flex items-center justify-between text-[10px] ${txt2}`}>
                    <span className="flex items-center gap-1"><Truck className="w-3 h-3" /> Add <span className={`font-semibold ${txt}`}>${amountToFreeShip.toFixed(2)}</span> for free shipping</span>
                    <span className={txt3}>{Math.round(freeShipProgress)}%</span>
                  </div>
                  <div className={`h-1.5 rounded-full overflow-hidden ${cl(dm, 'bg-gray-800', 'bg-gray-200')}`}>
                    <div className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 rounded-full transition-all duration-700" style={{ width: `${freeShipProgress}%` }} />
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-[10px] text-emerald-500 bg-emerald-500/10 rounded-lg px-2.5 py-1.5">
                  <Check className="w-3 h-3" /><span className="font-medium">Free standard shipping unlocked!</span>
                </div>
              )}
            </div>

            {lowStockItems.length > 0 && (
              <div className="px-4 pt-2">
                <div className="flex items-center gap-1.5 text-[10px] text-amber-500 bg-amber-500/10 rounded-lg px-2.5 py-1.5">
                  <Sparkles className="w-3 h-3 shrink-0" />
                  <span>{lowStockItems.length === 1 ? `"${lowStockItems[0].product.name}" is` : `${lowStockItems.length} items are`} selling fast!</span>
                </div>
              </div>
            )}

            {/* Items */}
            <div className="p-3 space-y-2">
              {cart.map(item => (
                <div key={item.product.id} className={`rounded-xl border overflow-hidden transition-all duration-300 ${bgSub} ${border} ${removingId === item.product.id ? 'opacity-0 scale-95 max-h-0 mb-0 p-0 border-0' : ''}`}>
                  <div className="flex items-start gap-3 p-3">
                    <div className="relative shrink-0">
                      <img src={item.product.image} alt={item.product.name} className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg object-cover" />
                      {item.product.stock < 20 && <div className={`absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 ${cl(dm, 'border-gray-800', 'border-white')}`} title="Low stock" />}
                      {item.product.badge && <span className={`absolute -bottom-1 -left-1 text-[8px] font-bold px-1.5 py-0.5 rounded ${cl(dm, 'bg-white text-black', 'bg-gray-900 text-white')}`}>{item.product.badge}</span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-medium truncate pr-2 ${txt}`}>{item.product.name}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className={`text-[10px] ${txt3}`}>{item.product.category}</span>
                        {item.product.rating && <span className="flex items-center gap-0.5 text-[10px] text-amber-400"><Star className="w-2.5 h-2.5 fill-current" />{item.product.rating}</span>}
                      </div>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <span className={`text-sm font-semibold ${txt}`}>{formatPrice(item.product.price)}</span>
                        {item.product.price < item.product.originalPrice && (
                          <>
                            <span className={`text-[10px] line-through ${txt3}`}>${item.product.originalPrice.toFixed(2)}</span>
                            <span className="text-[9px] text-emerald-500 font-medium bg-emerald-500/10 px-1 py-0.5 rounded">-{Math.round((1 - item.product.price / item.product.originalPrice) * 100)}%</span>
                          </>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <div className={`flex items-center border rounded-lg ${borderLight} ${cl(dm, 'bg-gray-800', 'bg-white')}`}>
                          <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} className={`p-1.5 transition-colors active:scale-90 ${txt2}`}><Minus className="w-3 h-3" /></button>
                          {editingQty === item.product.id ? (
                            <input type="number" value={qtyInput} onChange={e => setQtyInput(e.target.value)}
                              onBlur={() => handleQtySubmit(item.product.id, item.product.stock)}
                              onKeyDown={e => e.key === 'Enter' && handleQtySubmit(item.product.id, item.product.stock)}
                              className={`w-10 text-center text-xs bg-transparent focus:outline-none ${txt}`} autoFocus min={1} max={item.product.stock} />
                          ) : (
                            <button onClick={() => handleQtyEdit(item.product.id, item.quantity)} className={`w-7 text-center text-xs font-medium cursor-text ${txt}`}>{item.quantity}</button>
                          )}
                          <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} disabled={item.quantity >= item.product.stock}
                            className={`p-1.5 transition-colors active:scale-90 disabled:opacity-30 ${txt2}`}><Plus className="w-3 h-3" /></button>
                        </div>
                        <span className={`text-[10px] ${txt3}`}>= <strong className={txt}>{formatPrice(item.product.price * item.quantity)}</strong></span>
                      </div>
                    </div>
                  </div>
                  <div className={`flex items-center justify-between px-3 py-1.5 border-t ${border} ${cl(dm, 'bg-gray-900/50', 'bg-white')}`}>
                    <div className="flex items-center gap-3">
                      <button onClick={() => handleMoveToWishlist(item.product.id)} className={`flex items-center gap-1 text-[10px] transition-colors ${txt3} hover:text-pink-500`}><Heart className="w-3 h-3" /> Save</button>
                      <button onClick={() => handleRemove(item.product.id)} className={`flex items-center gap-1 text-[10px] transition-colors ${txt3} hover:text-red-500`}><Trash2 className="w-3 h-3" /> Remove</button>
                    </div>
                    {item.product.stock < 30 && <span className="text-[9px] text-amber-500 flex items-center gap-0.5"><Package className="w-2.5 h-2.5" /> Only {item.product.stock} left</span>}
                  </div>
                </div>
              ))}
            </div>

            {/* Gift & Notes */}
            <div className="px-4 pb-2 space-y-2">
              <button onClick={() => setIsGift(!isGift)} className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg border text-[11px] transition-all ${
                isGift ? 'bg-pink-500/10 border-pink-500/20 text-pink-500' : `${bgSub} ${border} ${txt2}`
              }`}><Gift className="w-3.5 h-3.5" /> {isGift ? 'This is a gift ✓' : 'Send as a gift?'}</button>
              {isGift && (
                <textarea value={giftMessage} onChange={e => setGiftMessage(e.target.value)} placeholder="Add a gift message..."
                  className={`w-full px-3 py-2 rounded-lg text-xs focus:outline-none resize-none h-16 border ${inputBg} ${borderLight}`} />
              )}
              <button onClick={() => setShowNote(!showNote)} className={`flex items-center gap-1.5 text-[11px] transition-colors ${txt2}`}>
                <MessageSquare className="w-3.5 h-3.5" /> {showNote ? 'Hide note' : 'Add order note'}
              </button>
              {showNote && (
                <textarea value={orderNote} onChange={e => setOrderNote(e.target.value)} placeholder="Special instructions..."
                  className={`w-full px-3 py-2 rounded-lg text-xs focus:outline-none resize-none h-16 border ${inputBg} ${borderLight}`} />
              )}
            </div>

            {/* Coupon */}
            <div className="px-4 pb-2">
              {appliedCoupon ? (
                <div className="flex items-center justify-between px-3 py-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                  <div className="flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-[11px] font-medium text-emerald-500">{appliedCoupon.code}</span>
                    <span className="text-[10px] text-emerald-600">(-{appliedCoupon.type === 'percentage' ? `${appliedCoupon.value}%` : `$${appliedCoupon.value}`})</span>
                  </div>
                  <button onClick={doRemoveCoupon} className="p-1 text-emerald-500 hover:text-emerald-400"><X className="w-3 h-3" /></button>
                </div>
              ) : (
                <>
                  <button onClick={() => setShowCoupon(!showCoupon)} className={`flex items-center gap-1.5 text-[11px] ${txt2}`}><Tag className="w-3.5 h-3.5" /> Have a promo code?</button>
                  {showCoupon && (
                    <div className="mt-2 space-y-1.5">
                      <div className="flex gap-1.5">
                        <input type="text" value={couponCode} onChange={e => { setCouponCode(e.target.value.toUpperCase()); setCouponError(''); }}
                          placeholder="WELCOME10" onKeyDown={e => e.key === 'Enter' && handleApplyCoupon()}
                          className={`flex-1 px-3 py-2 border rounded-lg text-xs focus:outline-none ${inputBg} ${borderLight}`} />
                        <button onClick={handleApplyCoupon} className={`px-3 py-2 text-xs rounded-lg font-medium transition-colors ${cl(dm, 'bg-gray-700 text-gray-300 hover:bg-gray-600', 'bg-gray-200 text-gray-700 hover:bg-gray-300')}`}>Apply</button>
                      </div>
                      {couponError && <p className="text-[10px] text-red-500">{couponError}</p>}
                      {couponSuccess && <p className="text-[10px] text-emerald-500 flex items-center gap-1"><Check className="w-3 h-3" /> Applied!</p>}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Cross-sell */}
            {crossSellProducts.length > 0 && (
              <div className={`px-4 pb-3 border-t pt-3 ${border}`}>
                <p className={`text-[10px] uppercase tracking-wider font-medium mb-2 ${txt3}`}>You might also like</p>
                <div className="space-y-1.5">
                  {crossSellProducts.map(product => (
                    <CrossSellItem key={product.id} product={product} onAdd={() => addToCart(product)} dm={dm} />
                  ))}
                </div>
              </div>
            )}
          </>
        ) : step === 'information' ? (
          <div className="p-4 space-y-4">
            <div>
              <h4 className={`text-xs font-semibold mb-3 flex items-center gap-2 ${txt}`}><Mail className="w-3.5 h-3.5" /> Contact</h4>
              <InputField label="Email" icon={Mail} value={address.email} onChange={e => setAddress({ ...address, email: e.target.value })}
                placeholder="your@email.com" type="email" error={errors.email} dm={dm} />
            </div>
            <div>
              <h4 className={`text-xs font-semibold mb-3 flex items-center gap-2 ${txt}`}><MapPin className="w-3.5 h-3.5" /> Shipping Address</h4>
              <div className="space-y-2.5">
                <div className="grid grid-cols-2 gap-2">
                  <InputField label="First Name" icon={User} value={address.firstName} onChange={e => setAddress({ ...address, firstName: e.target.value })} placeholder="John" error={errors.firstName} dm={dm} />
                  <InputField label="Last Name" value={address.lastName} onChange={e => setAddress({ ...address, lastName: e.target.value })} placeholder="Doe" error={errors.lastName} dm={dm} />
                </div>
                <InputField label="Phone (optional)" icon={Phone} value={address.phone} onChange={e => setAddress({ ...address, phone: e.target.value })} placeholder="+1 (555) 000-0000" type="tel" dm={dm} />
                <InputField label="Address" icon={MapPin} value={address.address} onChange={e => setAddress({ ...address, address: e.target.value })} placeholder="123 Main Street, Apt 4" error={errors.address} dm={dm} />
                <div className="grid grid-cols-2 gap-2">
                  <InputField label="City" value={address.city} onChange={e => setAddress({ ...address, city: e.target.value })} placeholder="New York" error={errors.city} dm={dm} />
                  <InputField label="State/Region" value={address.state} onChange={e => setAddress({ ...address, state: e.target.value })} placeholder="NY" dm={dm} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <InputField label="ZIP/Postal Code" value={address.zip} onChange={e => setAddress({ ...address, zip: e.target.value })} placeholder="10001" error={errors.zip} dm={dm} />
                  <div className="space-y-1">
                    <label className={`text-[10px] font-medium uppercase tracking-wider ${cl(dm, 'text-gray-400', 'text-gray-500')}`}>Country</label>
                    <select value={address.country} onChange={e => setAddress({ ...address, country: e.target.value })}
                      className={`w-full px-3 py-2.5 rounded-lg text-xs focus:outline-none border ${inputBg} ${borderLight}`}>
                      {COUNTRIES.map(c => <option key={c.code} value={c.code} className={cl(dm, 'bg-gray-900 text-white', 'bg-white text-gray-900')}>{c.name}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : step === 'shipping' ? (
          <div className="p-4 space-y-4">
            <h4 className={`text-xs font-semibold flex items-center gap-2 ${txt}`}><Truck className="w-3.5 h-3.5" /> Shipping Method</h4>
            <div className="space-y-2">
              {SHIPPING_OPTIONS.map(opt => {
                const isFree = opt.freeAbove && subtotal >= opt.freeAbove;
                const cost = isFree ? 0 : opt.baseCost;
                return (
                  <button key={opt.id} onClick={() => setShippingMethod(opt.id)}
                    className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-xs transition-all ${
                      shippingMethod === opt.id
                        ? cl(dm, 'bg-gray-800 border-2 border-white/30 text-white', 'bg-gray-50 border-2 border-gray-900 text-gray-900')
                        : `${bgSub} border ${border} ${txt2}`
                    }`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${shippingMethod === opt.id ? cl(dm, 'border-white', 'border-gray-900') : cl(dm, 'border-gray-600', 'border-gray-400')}`}>
                        {shippingMethod === opt.id && <div className={`w-2 h-2 rounded-full ${cl(dm, 'bg-white', 'bg-gray-900')}`} />}
                      </div>
                      <div className="text-left">
                        <p className="font-medium">{opt.label}</p>
                        <p className={`text-[10px] mt-0.5 ${txt3}`}><EstimatedDelivery days={opt.days} /> · {opt.time}</p>
                      </div>
                    </div>
                    <span className={`font-semibold ${cost === 0 ? 'text-emerald-500' : ''}`}>{cost === 0 ? 'FREE' : `$${cost.toFixed(2)}`}</span>
                  </button>
                );
              })}
            </div>
            <div className={`rounded-xl p-3 text-[11px] space-y-1.5 ${bgSub} border ${border} ${txt2}`}>
              <p className="flex items-center gap-1.5"><MapPin className={`w-3 h-3 ${txt3}`} /> Shipping to: {address.firstName} {address.lastName}, {address.city}, {COUNTRIES.find(c => c.code === address.country)?.name}</p>
              <p className="flex items-center gap-1.5"><Clock className={`w-3 h-3 ${txt3}`} /> Estimated: <EstimatedDelivery days={selectedShipping.days} /></p>
            </div>
          </div>
        ) : step === 'payment' ? (
          <div className="p-4 space-y-4">
            <h4 className={`text-xs font-semibold flex items-center gap-2 ${txt}`}><CreditCard className="w-3.5 h-3.5" /> Payment Method</h4>
            <div className="grid grid-cols-2 gap-2">
              {([
                { id: 'card' as const, label: 'Credit Card', icon: <CreditCard className="w-4 h-4" /> },
                { id: 'paypal' as const, label: 'PayPal', icon: <div className="text-[10px] font-black italic bg-blue-600 text-white px-1.5 rounded">P</div> },
                { id: 'klarna' as const, label: 'Klarna', icon: <div className="w-4 h-4 bg-pink-400 rounded-sm flex items-center justify-center text-[8px] font-black text-black">K</div> },
                { id: 'applepay' as const, label: 'Apple Pay', icon: <Smartphone className="w-4 h-4" /> },
              ]).map(m => (
                <button key={m.id} onClick={() => setPayment({ ...payment, method: m.id })}
                  className={`flex items-center gap-2 px-3 py-3 rounded-xl text-xs transition-all ${
                    payment.method === m.id
                      ? cl(dm, 'bg-gray-800 border-2 border-white/30 text-white', 'bg-gray-50 border-2 border-gray-900 text-gray-900')
                      : `${bgSub} border ${border} ${txt2}`
                  }`}>
                  <span className="text-muted shrink-0">{m.icon}</span><span className="font-medium">{m.label}</span>
                </button>
              ))}
            </div>
            {payment.method === 'card' && (
              <div className="space-y-2.5">
                <InputField label="Card Number" icon={CreditCard} value={payment.cardNumber} onChange={e => setPayment({ ...payment, cardNumber: formatCard(e.target.value) })} placeholder="4242 4242 4242 4242" error={errors.cardNumber} maxLength={19} dm={dm} />
                <InputField label="Name on Card" icon={User} value={payment.cardName} onChange={e => setPayment({ ...payment, cardName: e.target.value })} placeholder="John Doe" error={errors.cardName} dm={dm} />
                <div className="grid grid-cols-2 gap-2">
                  <InputField label="Expiry" value={payment.cardExpiry} onChange={e => setPayment({ ...payment, cardExpiry: formatExpiry(e.target.value) })} placeholder="MM/YY" error={errors.cardExpiry} maxLength={5} dm={dm} />
                  <InputField label="CVC" value={payment.cardCvc} onChange={e => setPayment({ ...payment, cardCvc: e.target.value.replace(/\D/g, '').slice(0, 4) })} placeholder="123" error={errors.cardCvc} maxLength={4} type="password" dm={dm} />
                </div>
              </div>
            )}
            {payment.method === 'paypal' && <div className={`text-center py-6 text-xs ${txt2}`}>You'll be redirected to PayPal after reviewing your order.</div>}
            {payment.method === 'klarna' && <div className={`text-center py-6 text-xs ${txt2}`}>Pay in 4 interest-free installments of <strong className={txt}>${(total / 4).toFixed(2)}</strong></div>}
            {payment.method === 'applepay' && <div className={`text-center py-6 text-xs ${txt2}`}>Confirm with Apple Pay after reviewing your order.</div>}
            <div className={`flex items-center gap-2 text-[10px] rounded-xl p-3 ${bgSub} border ${border} ${txt3}`}>
              <Lock className="w-3.5 h-3.5 shrink-0" /><span>Your payment information is encrypted and secure.</span>
            </div>
          </div>
        ) : step === 'review' ? (
          <div className="p-4 space-y-4">
            <h4 className={`text-xs font-semibold mb-2 ${txt}`}>Order Review</h4>
            <div className={`rounded-xl p-3 space-y-2.5 ${bgSub} border ${border}`}>
              <p className={`text-[10px] uppercase tracking-wider font-medium ${txt3}`}>Items ({totalItems})</p>
              {cart.map(item => (
                <div key={item.product.id} className="flex items-center gap-3">
                  <div className="relative shrink-0">
                    <img src={item.product.image} alt="" className="w-12 h-12 rounded-lg object-cover" />
                    <span className={`absolute -top-1 -right-1 w-4 h-4 rounded-full text-[8px] font-bold flex items-center justify-center ${cl(dm, 'bg-white text-black', 'bg-gray-900 text-white')}`}>{item.quantity}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-[11px] truncate ${txt}`}>{item.product.name}</p>
                    <p className={`text-[10px] ${txt3}`}>{item.product.category}</p>
                  </div>
<span className={`text-xs font-medium ${txt}`}>{formatPrice(item.product.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className={`rounded-xl p-3 ${bgSub} border ${border}`}>
              <div className="flex items-center justify-between mb-2">
                <p className={`text-[10px] uppercase tracking-wider font-medium ${txt3}`}>Ship To</p>
                <button onClick={() => setStep('information')} className="text-[10px] text-blue-500 hover:text-blue-400">Edit</button>
              </div>
              <p className={`text-xs ${txt}`}>{address.firstName} {address.lastName}</p>
              <p className={`text-[11px] ${txt2}`}>{address.address}</p>
              <p className={`text-[11px] ${txt2}`}>{address.city}, {address.state} {address.zip}</p>
              <p className={`text-[11px] ${txt2}`}>{COUNTRIES.find(c => c.code === address.country)?.name}</p>
              <p className={`text-[11px] mt-1 ${txt3}`}>{address.email}</p>
            </div>
            <div className={`rounded-xl p-3 ${bgSub} border ${border}`}>
              <div className="flex items-center justify-between mb-2">
                <p className={`text-[10px] uppercase tracking-wider font-medium ${txt3}`}>Shipping</p>
                <button onClick={() => setStep('shipping')} className="text-[10px] text-blue-500 hover:text-blue-400">Edit</button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-xs ${txt}`}>{selectedShipping.label} ({selectedShipping.time})</p>
                  <p className={`text-[10px] mt-0.5 ${txt3}`}>Est. <EstimatedDelivery days={selectedShipping.days} /></p>
                </div>
                <span className={`text-xs font-medium ${shippingCost === 0 ? 'text-emerald-500' : txt}`}>{shippingCost === 0 ? 'FREE' : `$${shippingCost.toFixed(2)}`}</span>
              </div>
            </div>
            <div className={`rounded-xl p-3 ${bgSub} border ${border}`}>
              <div className="flex items-center justify-between mb-2">
                <p className={`text-[10px] uppercase tracking-wider font-medium ${txt3}`}>Payment</p>
                <button onClick={() => setStep('payment')} className="text-[10px] text-blue-500 hover:text-blue-400">Edit</button>
              </div>
              <p className={`text-xs capitalize ${txt}`}>{payment.method === 'card' ? `Card ending in ${payment.cardNumber.slice(-4)}` : payment.method === 'applepay' ? 'Apple Pay' : payment.method}</p>
            </div>
            {isGift && (
              <div className="bg-pink-500/10 rounded-xl p-3 border border-pink-500/20">
                <p className="text-[10px] text-pink-500 uppercase tracking-wider font-medium mb-1 flex items-center gap-1"><Gift className="w-3 h-3" /> Gift Order</p>
                {giftMessage && <p className="text-xs text-pink-400 italic">"{giftMessage}"</p>}
              </div>
            )}
            {orderNote && (
              <div className={`rounded-xl p-3 ${bgSub} border ${border}`}>
                <p className={`text-[10px] uppercase tracking-wider font-medium mb-1 ${txt3}`}>Note</p>
                <p className={`text-xs ${txt2}`}>{orderNote}</p>
              </div>
            )}
          </div>
        ) : null}
      </div>

      {/* Footer */}
      {(cart.length > 0 || step !== 'cart') && (step as string) !== 'confirmed' && (
        <div className={`border-t shrink-0 ${border}`}>
          <div className="px-4 py-6 space-y-3 text-sm">
            <div className={`flex justify-between text-[10px] font-black uppercase tracking-widest ${txt2}`}><span>Subtotal ({totalItems} items)</span><span>${subtotal.toFixed(2)}</span></div>
            {savings > 0 && <div className="flex justify-between text-emerald-500 text-[10px] font-black uppercase tracking-widest"><span>Studio savings</span><span>-${savings.toFixed(2)}</span></div>}
            {couponDiscount > 0 && (
              <div className="flex justify-between text-emerald-500 text-[10px] font-black uppercase tracking-widest">
                <span className="flex items-center gap-2"><Tag className="w-3.5 h-3.5" /> {appliedCoupon?.code}</span>
                <span>-${couponDiscount.toFixed(2)}</span>
              </div>
            )}
            {(['shipping', 'payment', 'review'] as CheckoutStep[]).includes(step) && (
              <div className={`flex justify-between text-xs ${txt2}`}>
                <span className="flex items-center gap-1"><Truck className="w-3 h-3" /> {selectedShipping.label}</span>
                <span className={shippingCost === 0 ? 'text-emerald-500 font-medium' : ''}>{shippingCost === 0 ? 'FREE' : `$${shippingCost.toFixed(2)}`}</span>
              </div>
            )}
            <div className={`h-px my-1 ${cl(dm, 'bg-gray-800', 'bg-gray-200')}`} />
            <div className={`flex justify-between font-bold ${txt}`}>
              <span>Total</span>
              <div className="text-right">
                <span className="text-lg">${total.toFixed(2)}</span>
                {(savings + couponDiscount) > 0 && <p className="text-[10px] text-emerald-500 font-normal">You save ${(savings + couponDiscount).toFixed(2)}</p>}
              </div>
            </div>
          </div>
          <div className="p-4 pt-0 space-y-4 safe-bottom">
            {/* Express Checkout Visuals (Best Practice 2026) */}
            {step === 'cart' && cart.length > 0 && (
              <div className="space-y-2">
                 <div className="flex items-center gap-2 mb-3">
                    <div className="flex-1 h-px bg-border" />
                    <span className="text-[9px] font-black uppercase text-muted tracking-widest whitespace-nowrap">Express Checkout</span>
                    <div className="flex-1 h-px bg-border" />
                 </div>
                 <div className="grid grid-cols-2 gap-2">
                    <button className="py-2.5 rounded-xl bg-black text-white flex items-center justify-center gap-2 hover:opacity-90 transition-all border border-white/10 shadow-lg">
                       <Smartphone size={16} /> Pay
                    </button>
                    <button className="py-2.5 rounded-xl bg-[#0070ba] text-white flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-lg font-bold">
                       PayPal
                    </button>
                 </div>
              </div>
            )}

            {step === 'cart' && (
              <button onClick={() => goToStep('information')} className={`w-full py-4 rounded-2xl font-black uppercase tracking-[0.15em] text-xs active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-2xl ${btnPrimary}`}>
                Proceed to Checkout <ArrowRight className="w-4 h-4" />
              </button>
            )}
            {step === 'information' && (
              <button onClick={() => { if (validateInformation()) goToStep('shipping'); }} className={`w-full py-3.5 rounded-xl font-bold text-sm active:scale-[0.98] transition-all flex items-center justify-center gap-2 ${btnPrimary}`}>
                Continue to Shipping <ChevronRight className="w-4 h-4" />
              </button>
            )}
            {step === 'shipping' && (
              <button onClick={() => goToStep('payment')} className={`w-full py-3.5 rounded-xl font-bold text-sm active:scale-[0.98] transition-all flex items-center justify-center gap-2 ${btnPrimary}`}>
                Continue to Payment <ChevronRight className="w-4 h-4" />
              </button>
            )}
            {step === 'payment' && (
              <button onClick={() => { if (validatePayment()) goToStep('review'); }} className={`w-full py-3.5 rounded-xl font-bold text-sm active:scale-[0.98] transition-all flex items-center justify-center gap-2 ${btnPrimary}`}>
                Review Order <ChevronRight className="w-4 h-4" />
              </button>
            )}
            {step === 'review' && (
              <button onClick={handlePlaceOrder} disabled={processing}
                className="w-full py-3.5 rounded-xl bg-emerald-500 text-white font-bold text-sm hover:bg-emerald-400 active:scale-[0.98] transition-all disabled:opacity-60 flex items-center justify-center gap-2">
                {processing ? (<><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Processing...</>) : (<><Lock className="w-4 h-4" /> Place Order — ${total.toFixed(2)}</>)}
              </button>
            )}
            <div className={`flex items-center justify-center gap-4 text-[10px] pt-1 ${txt3}`}>
              <span className="flex items-center gap-1"><Lock className="w-3 h-3" /> 256-bit SSL</span>
              <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> Buyer Protection</span>
              <span className="flex items-center gap-1"><RotateCcw className="w-3 h-3" /> 30-Day Returns</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
