import { useShopStore } from '../store/shopStore';

/**
 * 2026 Best Practice: Centralized AI Command & API Hub.
 * This client bridges the UI (Command Palette / Chat) with the actual Backend (Supabase / OpenClaw / n8n).
 */
export const aiCommandHub = {
  /**
   * Universal command executor.
   * AI can call this to perform any shop action.
   */
  async execute(command: string, args: any = {}) {
    const { pushToast, setCurrentView, addProduct, updateProduct } = useShopStore.getState();
    
    console.log(`[AI Command] Executing: ${command}`, args);

    switch (command) {
      case 'NAVIGATE':
        if (args.view) setCurrentView(args.view);
        break;
      
      case 'CREATE_PRODUCT':
        addProduct(args.product);
        pushToast({ type: 'success', message: `AI created product: ${args.product.name}` });
        break;

      case 'UPDATE_PRICE':
        updateProduct(args.productId, { price: args.newPrice });
        pushToast({ type: 'info', message: `AI updated price for ${args.productId} to ${args.newPrice}` });
        break;

      case 'TRIGGER_N8N':
        // Real logic would call n8nClient here
        pushToast({ type: 'info', message: `AI triggered workflow: ${args.workflowId}` });
        break;

      case 'OPEN_WHATSAPP':
        // Real logic would call openclawClient here
        pushToast({ type: 'info', message: `AI opening WhatsApp for: ${args.recipient}` });
        break;

      case 'CREATE_COUPON':
        useShopStore.getState().addCoupon(args.coupon);
        pushToast({ type: 'success', message: `AI created coupon: ${args.coupon.code}` });
        break;

      case 'TOGGLE_AUTOPILOT':
        useShopStore.getState().toggleAiAutoPilot();
        pushToast({ type: 'info', message: `AI toggled autopilot: ${useShopStore.getState().aiAutoPilot ? 'ON' : 'OFF'}` });
        break;

      case 'ADD_TO_CART':
        const prod = useShopStore.getState().products.find(p => p.id === args.productId);
        if (prod) {
          useShopStore.getState().addToCart(prod);
        }
        break;

      case 'CLEAR_CART':
        useShopStore.getState().clearCart();
        pushToast({ type: 'info', message: 'AI cleared your cart' });
        break;

      case 'SET_CURRENCY':
        useShopStore.getState().setCurrency(args.code);
        break;

      case 'OFFER_DISCOUNT':
        const code = `AI-${Math.random().toString(36).substring(7).toUpperCase()}`;
        useShopStore.getState().addCoupon({
          id: `ai-${Date.now()}`,
          code,
          type: 'percentage',
          value: args.percent || 10,
          minOrder: 0,
          maxUses: 1,
          usedCount: 0,
          expiresAt: new Date(Date.now() + 3600000), // 1 hour
          active: true
        });
        return { code, message: `Created a one-time ${args.percent || 10}% discount code: ${code}` };

      case 'FIND_PRODUCT':
        const found = useShopStore.getState().products.filter(p => 
          p.name.toLowerCase().includes(args.query.toLowerCase()) ||
          p.category.toLowerCase().includes(args.query.toLowerCase())
        );
        return found;

      default:
        console.warn(`[AI Command] Unknown command: ${command}`);
    }
  }
};
