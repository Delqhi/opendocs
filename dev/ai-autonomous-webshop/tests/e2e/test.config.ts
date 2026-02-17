export const config = {
  frontend: {
    port: parseInt(process.env.FRONTEND_PORT || '53001'),
    url: process.env.FRONTEND_URL || `http://localhost:${parseInt(process.env.FRONTEND_PORT || '53001')}`,
  },
  backend: {
    port: parseInt(process.env.BACKEND_PORT || '53002'),
    url: process.env.BACKEND_URL || `http://localhost:${parseInt(process.env.BACKEND_PORT || '53002')}`,
  },
  testUsers: {
    admin: {
      email: 'demo',
      password: 'demo',
    },
    standard: {
      email: 'user@test.com',
      password: 'password',
    },
    invalid: {
      email: 'invalid@test.com',
      password: 'wrongpassword',
    },
  },
  timeouts: {
    default: 30000,
    navigation: 10000,
    action: 5000,
  },
  viewports: {
    desktop: { width: 1920, height: 1080 },
    laptop: { width: 1280, height: 720 },
    tablet: { width: 1024, height: 768 },
    mobile: { width: 393, height: 852 },
  },
};

export const selectors = {
  auth: {
    loginButton: 'button:has-text("Login")',
    emailInput: 'input[type="email"], input[name="email"]',
    passwordInput: 'input[type="password"]',
    submitButton: 'button[type="submit"]',
    registerLink: 'text=Register',
    logoutButton: 'button:has-text("Logout"), button:has-text("Sign Out")',
    userAvatar: 'button[aria-label="Account"], button:has([class*="user"])',
  },
  cart: {
    cartButton: 'button:has([class*="cart"]), button[aria-label*="cart"]',
    addToCartButton: 'button:has-text("Add to Cart"), button:has([class*="plus"])',
    cartDrawer: '[class*="cart-drawer"], [class*="CartDrawer"]',
    cartItem: '[class*="cart-item"], [class*="CartItem"]',
    quantityInput: 'input[type="number"]',
    removeButton: 'button:has-text("Remove"), button[aria-label*="Remove"]',
    clearCartButton: 'button:has-text("Clear Cart")',
    checkoutButton: 'button:has-text("Checkout"), a:has-text("Checkout")',
    shareButton: 'button:has-text("Share"), button[aria-label*="Share"]',
    couponInput: 'input[placeholder*="coupon"], input[placeholder*="code"]',
    applyCouponButton: 'button:has-text("Apply")',
    emptyCartMessage: 'text=Your cart is empty, text=No items',
    cartBadge: 'span[class*="badge"], span[class*="count"]',
  },
  catalog: {
    featuredProducts: 'text=Featured Products',
    productCard: '[class*="product-card"], [class*="product"], [class*="ProductCard"]',
    productTitle: '[class*="product-title"], [class*="product-title"]',
    productPrice: '[class*="product-price"], [class*="price"]',
    searchInput: 'input[placeholder*="Search"]',
    categoryLink: 'a[href*="/category"], [class*="category"]',
  },
  product: {
    productDetail: '[class*="product-detail"], [class*="ProductDetail"]',
    productImage: '[class*="product-image"], img[class*="product"]',
    addToCart: 'button:has-text("Add to Cart")',
    quantitySelector: '[class*="quantity"], input[type="number"]',
    description: '[class*="description"], [class*="Description"]',
  },
  checkout: {
    checkoutPage: '[class*="checkout"], [class*="Checkout"]',
    firstName: 'input[name="firstName"], input[name="first_name"]',
    lastName: 'input[name="lastName"], input[name="last_name"]',
    address: 'input[name="address"], input[name="address1"]',
    city: 'input[name="city"]',
    zipCode: 'input[name="zip"], input[name="zipCode"]',
    country: 'select[name="country"], input[name="country"]',
    shippingOptions: 'text=Standard, text=Express, text=Priority',
    orderSummary: 'text=Order Summary, [class*="summary"]',
    placeOrderButton: 'button:has-text("Place Order"), button:has-text("Complete")',
  },
  order: {
    confirmationPage: '[class*="confirmation"], [class*="Confirmation"]',
    orderNumber: '[class*="order-number"], [class*="OrderNumber"]',
    continueShopping: 'button:has-text("Continue Shopping")',
  },
  navigation: {
    logo: '[class*="logo"], a[href="/"]',
    navLinks: 'nav a, header a',
  },
};

export function getBaseUrl(): string {
  return config.frontend.url;
}
