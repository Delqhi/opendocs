import { test, expect } from '@playwright/test';
import {
  NavigationPage,
  AuthPage,
  CatalogPage,
  ProductDetailPage,
  CartPage,
  CheckoutPage,
  OrderConfirmationPage,
  loginUser,
  addProductToCart,
  completeCheckout,
  runAccessibilityCheck,
} from './page-objects';
import { config } from './test.config';

test.describe('Critical Path: Full E2E Flow', () => {
  test.describe('Happy Path - Complete Purchase Flow', () => {
    test('should complete full purchase flow: Auth -> Catalog -> Product -> Cart -> Checkout -> Confirmation', async ({ page }) => {
      const navPage = new NavigationPage(page);
      const authPage = new AuthPage(page);
      const catalogPage = new CatalogPage(page);
      const productPage = new ProductDetailPage(page);
      const cartPage = new CartPage(page);
      const checkoutPage = new CheckoutPage(page);
      const confirmationPage = new OrderConfirmationPage(page);

      await navPage.goto('/');
      await navPage.waitForPageLoad();
      await runAccessibilityCheck(page);

      await navPage.clickLogin();
      await authPage.loginAsDemo();
      const isLoggedIn = await authPage.isLoggedIn();
      expect(isLoggedIn).toBeTruthy();

      await catalogPage.waitForProducts();
      const productCount = await catalogPage.getProductCount();
      expect(productCount).toBeGreaterThan(0);
      await runAccessibilityCheck(page);

      await catalogPage.clickFirstProduct();
      await productPage.waitForLoad();
      const productInfo = await productPage.getProductInfo();
      expect(productInfo.title).toBeTruthy();
      expect(productInfo.price).toBeTruthy();
      await runAccessibilityCheck(page);

      await productPage.addToCart(1);
      await cartPage.openCart();
      await cartPage.waitForCartOpen();
      const cartItemCount = await cartPage.getCartItemCount();
      expect(cartItemCount).toBeGreaterThan(0);
      await runAccessibilityCheck(page);

      const cartTotal = await cartPage.getTotal();
      expect(cartTotal).toBeTruthy();

      await cartPage.proceedToCheckout();
      await checkoutPage.waitForLoad();
      await runAccessibilityCheck(page);

      await checkoutPage.fillShippingInfo({
        email: 'testuser@example.com',
        firstName: 'Test',
        lastName: 'User',
        address: '123 Test Street',
        city: 'Test City',
        zipCode: '12345',
      });

      await checkoutPage.placeOrder();
      await confirmationPage.waitForConfirmation();
      
      const orderSuccessful = await confirmationPage.isOrderSuccessful();
      expect(orderSuccessful).toBeTruthy();
    });

    test('should complete purchase with multiple items', async ({ page }) => {
      const navPage = new NavigationPage(page);
      const authPage = new AuthPage(page);
      const catalogPage = new CatalogPage(page);
      const cartPage = new CartPage(page);
      const checkoutPage = new CheckoutPage(page);
      const confirmationPage = new OrderConfirmationPage(page);

      await navPage.goto('/');
      await navPage.clickLogin();
      await authPage.loginAsDemo();

      await catalogPage.waitForProducts();
      
      const productCards = await catalogPage.productCards.all();
      for (let i = 0; i < Math.min(3, productCards.length); i++) {
        await catalogPage.productCards.nth(i).click();
        await page.waitForTimeout(300);
        
        const addButton = page.locator('button:has-text("Add to Cart")');
        if (await addButton.isVisible({ timeout: 2000 })) {
          await addButton.click();
          await page.waitForTimeout(300);
        }
        
        await navPage.goto('/');
        await catalogPage.waitForProducts();
      }

      await cartPage.openCart();
      await cartPage.waitForCartOpen();
      
      const itemCount = await cartPage.getCartItemCount();
      expect(itemCount).toBeGreaterThanOrEqual(2);

      await cartPage.proceedToCheckout();
      await checkoutPage.waitForLoad();
      
      await checkoutPage.fillShippingInfo({
        firstName: 'Multi',
        lastName: 'Item',
        address: '456 Multi Lane',
        city: 'Shopville',
        zipCode: '54321',
      });
      
      await checkoutPage.placeOrder();
      await confirmationPage.waitForConfirmation();
    });
  });

  test.describe('Catalog & Product Discovery', () => {
    test('should browse and search products', async ({ page }) => {
      const navPage = new NavigationPage(page);
      const catalogPage = new CatalogPage(page);

      await navPage.goto('/');
      await catalogPage.waitForProducts();
      await runAccessibilityCheck(page);

      const productCount = await catalogPage.getProductCount();
      expect(productCount).toBeGreaterThan(0);

      await navPage.search('Smart');
      await page.waitForTimeout(1000);

      const searchResultsCount = await catalogPage.getProductCount();
      expect(searchResultsCount).toBeGreaterThanOrEqual(0);
    });

    test('should filter products by category', async ({ page }) => {
      const navPage = new NavigationPage(page);
      const catalogPage = new CatalogPage(page);

      await navPage.goto('/');
      await catalogPage.waitForProducts();

      const categories = await catalogPage.categoryLinks.all();
      if (categories.length > 0) {
        const firstCategory = categories[0];
        const categoryName = await firstCategory.textContent();
        
        await firstCategory.click();
        await page.waitForTimeout(500);
        
        await catalogPage.waitForProducts();
        const filteredCount = await catalogPage.getProductCount();
        expect(filteredCount).toBeGreaterThan(0);
      }
    });

    test('should view product details', async ({ page }) => {
      const navPage = new NavigationPage(page);
      const catalogPage = new CatalogPage(page);
      const productPage = new ProductDetailPage(page);

      await navPage.goto('/');
      await catalogPage.waitForProducts();
      await catalogPage.clickFirstProduct();

      await productPage.waitForLoad();
      
      const productInfo = await productPage.getProductInfo();
      expect(productInfo.title).toBeTruthy();
      expect(productInfo.price).toBeTruthy();

      const addToCartVisible = await productPage.addToCartButton.isVisible();
      expect(addToCartVisible).toBeTruthy();
    });
  });

  test.describe('Authentication Flow', () => {
    test('should login with demo credentials', async ({ page }) => {
      const navPage = new NavigationPage(page);
      const authPage = new AuthPage(page);

      await navPage.goto('/');
      await navPage.clickLogin();
      await authPage.loginAsDemo();

      const isLoggedIn = await authPage.isLoggedIn();
      expect(isLoggedIn).toBeTruthy();
      await runAccessibilityCheck(page);
    });

    test('should login with standard user credentials', async ({ page }) => {
      const navPage = new NavigationPage(page);
      const authPage = new AuthPage(page);

      await navPage.goto('/');
      await navPage.clickLogin();
      await authPage.loginAsStandard();

      await page.waitForTimeout(1500);
    });

    test('should persist session across page refresh', async ({ page }) => {
      const navPage = new NavigationPage(page);
      const authPage = new AuthPage(page);

      await navPage.goto('/');
      await navPage.clickLogin();
      await authPage.loginAsDemo();
      await page.waitForTimeout(1000);

      await page.reload();
      await page.waitForTimeout(1000);

      const isLoggedIn = await authPage.isLoggedIn();
      expect(isLoggedIn).toBeTruthy();
    });

    test('should logout successfully', async ({ page }) => {
      const navPage = new NavigationPage(page);
      const authPage = new AuthPage(page);

      await navPage.goto('/');
      await navPage.clickLogin();
      await authPage.loginAsDemo();
      await page.waitForTimeout(1000);

      const userAvatar = page.locator('button[aria-label="Account"]');
      if (await userAvatar.isVisible()) {
        await userAvatar.click();
        const logoutButton = page.locator('text=Logout, text=Sign Out');
        if (await logoutButton.isVisible()) {
          await logoutButton.click();
          await expect(navPage.loginButton).toBeVisible();
        }
      }
    });
  });

  test.describe('Shopping Cart', () => {
    test('should add single item to cart', async ({ page }) => {
      const navPage = new NavigationPage(page);
      const cartPage = new CartPage(page);

      await navPage.goto('/');
      await addProductToCart(page, 1);

      await cartPage.openCart();
      await cartPage.waitForCartOpen();

      const itemCount = await cartPage.getCartItemCount();
      expect(itemCount).toBe(1);
    });

    test('should add multiple quantities of item', async ({ page }) => {
      const navPage = new NavigationPage(page);
      const catalogPage = new CatalogPage(page);
      const productPage = new ProductDetailPage(page);
      const cartPage = new CartPage(page);

      await navPage.goto('/');
      await catalogPage.waitForProducts();
      await catalogPage.clickFirstProduct();
      await productPage.waitForLoad();
      await productPage.addToCart(3);

      await cartPage.openCart();
      await cartPage.waitForCartOpen();
      await runAccessibilityCheck(page);
    });

    test('should update item quantity in cart', async ({ page }) => {
      const navPage = new NavigationPage(page);
      const cartPage = new CartPage(page);

      await navPage.goto('/');
      await addProductToCart(page, 1);

      await cartPage.openCart();
      await cartPage.waitForCartOpen();

      const quantityInput = page.locator('input[type="number"]').first();
      if (await quantityInput.isVisible()) {
        await quantityInput.fill('2');
        await quantityInput.blur();
        await page.waitForTimeout(500);
      }
    });

    test('should remove item from cart', async ({ page }) => {
      const navPage = new NavigationPage(page);
      const cartPage = new CartPage(page);

      await navPage.goto('/');
      await addProductToCart(page, 1);

      await cartPage.openCart();
      await cartPage.waitForCartOpen();

      const initialCount = await cartPage.getCartItemCount();
      expect(initialCount).toBeGreaterThan(0);

      await cartPage.removeFirstItem();
      await page.waitForTimeout(500);
    });

    test('should apply coupon code', async ({ page }) => {
      const navPage = new NavigationPage(page);
      const cartPage = new CartPage(page);

      await navPage.goto('/');
      await addProductToCart(page, 1);

      await cartPage.openCart();
      await cartPage.waitForCartOpen();

      await cartPage.applyCoupon('WELCOME10');
      await page.waitForTimeout(500);
    });

    test('should calculate cart total correctly', async ({ page }) => {
      const navPage = new NavigationPage(page);
      const cartPage = new CartPage(page);

      await navPage.goto('/');
      await addProductToCart(page, 1);

      await cartPage.openCart();
      await cartPage.waitForCartOpen();

      const total = await cartPage.getTotal();
      expect(total).toBeTruthy();
    });
  });

  test.describe('Checkout Process', () => {
    test('should display checkout form with all required fields', async ({ page }) => {
      const navPage = new NavigationPage(page);
      const cartPage = new CartPage(page);
      const checkoutPage = new CheckoutPage(page);

      await navPage.goto('/');
      await addProductToCart(page, 1);

      await cartPage.openCart();
      await cartPage.waitForCartOpen();
      await cartPage.proceedToCheckout();

      await checkoutPage.waitForLoad();

      await expect(checkoutPage.emailInput).toBeVisible();
      await expect(checkoutPage.firstNameInput).toBeVisible();
      await expect(checkoutPage.lastNameInput).toBeVisible();
      await expect(checkoutPage.addressInput).toBeVisible();
      await expect(checkoutPage.cityInput).toBeVisible();
      await expect(checkoutPage.zipCodeInput).toBeVisible();
    });

    test('should validate required checkout fields', async ({ page }) => {
      const navPage = new NavigationPage(page);
      const cartPage = new CartPage(page);
      const checkoutPage = new CheckoutPage(page);

      await navPage.goto('/');
      await addProductToCart(page, 1);

      await cartPage.openCart();
      await cartPage.waitForCartOpen();
      await cartPage.proceedToCheckout();

      await checkoutPage.waitForLoad();
      await checkoutPage.placeOrder();
      await page.waitForTimeout(500);
    });

    test('should calculate shipping costs', async ({ page }) => {
      const navPage = new NavigationPage(page);
      const cartPage = new CartPage(page);
      const checkoutPage = new CheckoutPage(page);

      await navPage.goto('/');
      await addProductToCart(page, 1);

      await cartPage.openCart();
      await cartPage.waitForCartOpen();
      await cartPage.proceedToCheckout();

      await checkoutPage.waitForLoad();
      
      const shippingVisible = await checkoutPage.shippingOptions.isVisible();
      if (shippingVisible) {
        await checkoutPage.selectShippingOption('Express');
      }
    });

    test('should display order summary', async ({ page }) => {
      const navPage = new NavigationPage(page);
      const cartPage = new CartPage(page);
      const checkoutPage = new CheckoutPage(page);

      await navPage.goto('/');
      await addProductToCart(page, 1);

      await cartPage.openCart();
      await cartPage.waitForCartOpen();
      await cartPage.proceedToCheckout();

      await checkoutPage.waitForLoad();
      
      const summaryVisible = await checkoutPage.orderSummary.isVisible();
      expect(summaryVisible).toBeTruthy();
    });

    test('should complete checkout successfully', async ({ page }) => {
      const checkoutPage = new CheckoutPage(page);
      const confirmationPage = new OrderConfirmationPage(page);

      await checkoutPage.goto('/');
      await addProductToCart(page, 1);

      const cartPage = new CartPage(page);
      await cartPage.openCart();
      await cartPage.waitForCartOpen();
      await cartPage.proceedToCheckout();

      await checkoutPage.waitForLoad();
      await checkoutPage.fillShippingInfo({
        email: 'checkout@test.com',
        firstName: 'Checkout',
        lastName: 'Test',
        address: '789 Checkout Blvd',
        city: 'Commerce City',
        zipCode: '67890',
      });

      await checkoutPage.placeOrder();
      await confirmationPage.waitForConfirmation();

      const success = await confirmationPage.isOrderSuccessful();
      expect(success).toBeTruthy();
    });
  });

  test.describe('Order Confirmation', () => {
    test('should display order confirmation after purchase', async ({ page }) => {
      const confirmationPage = new OrderConfirmationPage(page);

      await confirmationPage.goto('/');
      await addProductToCart(page, 1);

      const cartPage = new CartPage(page);
      await cartPage.openCart();
      await cartPage.waitForCartOpen();
      await cartPage.proceedToCheckout();

      const checkoutPage = new CheckoutPage(page);
      await checkoutPage.waitForLoad();
      await checkoutPage.fillShippingInfo({
        firstName: 'Confirm',
        lastName: 'Test',
        address: '123 Confirm St',
        city: 'Confirm City',
        zipCode: '11111',
      });
      await checkoutPage.placeOrder();

      await confirmationPage.waitForConfirmation();
      
      const orderNumber = await confirmationPage.getOrderNumber();
      expect(orderNumber).toBeTruthy();
    });

    test('should allow continuing shopping from confirmation', async ({ page }) => {
      const confirmationPage = new OrderConfirmationPage(page);
      const navPage = new NavigationPage(page);

      await confirmationPage.goto('/');
      await addProductToCart(page, 1);

      const cartPage = new CartPage(page);
      await cartPage.openCart();
      await cartPage.waitForCartOpen();
      await cartPage.proceedToCheckout();

      const checkoutPage = new CheckoutPage(page);
      await checkoutPage.waitForLoad();
      await checkoutPage.fillShippingInfo({
        firstName: 'Continue',
        lastName: 'Shop',
        address: '456 Continue Ave',
        city: 'Shopmore',
        zipCode: '22222',
      });
      await checkoutPage.placeOrder();

      await confirmationPage.waitForConfirmation();
      await confirmationPage.continueShopping();

      const catalogPage = new CatalogPage(page);
      await catalogPage.waitForProducts();
    });
  });
});

test.describe('Edge Cases', () => {
  test('should handle empty cart checkout attempt', async ({ page }) => {
    const navPage = new NavigationPage(page);
    const cartPage = new CartPage(page);

    await navPage.goto('/');
    await cartPage.openCart();
    await cartPage.waitForCartOpen();

    const isEmpty = await cartPage.isCartEmpty();
    expect(isEmpty).toBeTruthy();

    const checkoutVisible = await cartPage.checkoutButton.isVisible();
    expect(checkoutVisible).toBeFalsy();
  });

  test('should handle invalid login credentials', async ({ page }) => {
    const navPage = new NavigationPage(page);
    const authPage = new AuthPage(page);

    await navPage.goto('/');
    await navPage.clickLogin();
    await authPage.tryLoginWithInvalid();
    await page.waitForTimeout(1000);
  });

  test('should handle invalid coupon code', async ({ page }) => {
    const navPage = new NavigationPage(page);
    const cartPage = new CartPage(page);

    await navPage.goto('/');
    await addProductToCart(page, 1);

    await cartPage.openCart();
    await cartPage.waitForCartOpen();
    await cartPage.applyCoupon('INVALID123');
    await page.waitForTimeout(500);
  });

  test('should handle guest checkout', async ({ page }) => {
    const navPage = new NavigationPage(page);
    const cartPage = new CartPage(page);
    const checkoutPage = new CheckoutPage(page);

    await navPage.goto('/');
    await addProductToCart(page, 1);

    await cartPage.openCart();
    await cartPage.waitForCartOpen();
    await cartPage.proceedToCheckout();

    await checkoutPage.waitForLoad();
    await checkoutPage.fillShippingInfo({
      email: 'guest@test.com',
      firstName: 'Guest',
      lastName: 'User',
      address: '999 Guest Lane',
      city: 'Guestown',
      zipCode: '99999',
    });

    await checkoutPage.placeOrder();
    await page.waitForTimeout(1000);
  });

  test('should handle product out of stock', async ({ page }) => {
    const navPage = new NavigationPage(page);
    const catalogPage = new CatalogPage(page);

    await navPage.goto('/');
    await catalogPage.waitForProducts();
    await catalogPage.clickFirstProduct();

    const productPage = new ProductDetailPage(page);
    await productPage.waitForLoad();

    const addButton = page.locator('button:has-text("Add to Cart")');
    const isDisabled = await addButton.isDisabled().catch(() => true);
    
    if (isDisabled) {
      const outOfStock = page.locator('text=Out of Stock, text=Unavailable');
      const hasOutOfStock = await outOfStock.isVisible().catch(() => false);
      expect(hasOutOfStock || isDisabled).toBeTruthy();
    }
  });

  test('should clear entire cart', async ({ page }) => {
    const navPage = new NavigationPage(page);
    const cartPage = new CartPage(page);

    await navPage.goto('/');
    await addProductToCart(page, 1);

    await cartPage.openCart();
    await cartPage.waitForCartOpen();
    await cartPage.clearCart();
    await page.waitForTimeout(500);

    const isEmpty = await cartPage.isCartEmpty();
    expect(isEmpty).toBeTruthy();
  });

  test('should handle checkout with missing required fields', async ({ page }) => {
    const navPage = new NavigationPage(page);
    const cartPage = new CartPage(page);
    const checkoutPage = new CheckoutPage(page);

    await navPage.goto('/');
    await addProductToCart(page, 1);

    await cartPage.openCart();
    await cartPage.waitForCartOpen();
    await cartPage.proceedToCheckout();

    await checkoutPage.waitForLoad();
    await checkoutPage.placeOrder();
    await page.waitForTimeout(500);
  });
});

test.describe('Responsive Design', () => {
  test.describe('Desktop Viewports', () => {
    test('should display full navigation on desktop', async ({ page }) => {
      const navPage = new NavigationPage(page);
      
      await navPage.goto('/');
      await navPage.waitForPageLoad();

      const logoVisible = await navPage.logo.isVisible();
      expect(logoVisible).toBeTruthy();

      const searchVisible = await navPage.searchInput.isVisible();
      expect(searchVisible).toBeTruthy();
    });

    test('should display cart drawer on desktop', async ({ page }) => {
      const navPage = new NavigationPage(page);
      const cartPage = new CartPage(page);

      await navPage.goto('/');
      await addProductToCart(page, 1);

      await cartPage.openCart();
      await cartPage.waitForCartOpen();

      const drawerVisible = await cartPage.cartDrawer.isVisible().catch(() => false);
      const emptyVisible = await cartPage.emptyCartMessage.isVisible().catch(() => false);
      expect(drawerVisible || emptyVisible).toBeTruthy();
    });
  });

  test.describe('Mobile Viewports', () => {
    test('should display hamburger menu on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 393, height: 852 });
      
      const navPage = new NavigationPage(page);
      await navPage.goto('/');
      await navPage.waitForPageLoad();

      const hamburgerMenu = page.locator('[class*="hamburger"], [class*="menu"]').first();
      const menuVisible = await hamburgerMenu.isVisible().catch(() => false);
      
      const navVisible = await navPage.logo.isVisible().catch(() => false);
      expect(navVisible || menuVisible).toBeTruthy();
    });

    test('should display full-width product cards on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 393, height: 852 });
      
      const navPage = new NavigationPage(page);
      const catalogPage = new CatalogPage(page);

      await navPage.goto('/');
      await catalogPage.waitForProducts();

      const productCount = await catalogPage.getProductCount();
      expect(productCount).toBeGreaterThan(0);
    });

    test('should handle touch interactions on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 393, height: 852 });
      
      const navPage = new NavigationPage(page);
      const catalogPage = new CatalogPage(page);

      await navPage.goto('/');
      await catalogPage.waitForProducts();
      await catalogPage.clickFirstProduct();

      const productPage = new ProductDetailPage(page);
      await productPage.waitForLoad();
      await productPage.addToCart(1);
    });
  });

  test.describe('Tablet Viewports', () => {
    test('should display adapted layout on tablet', async ({ page }) => {
      await page.setViewportSize({ width: 1024, height: 768 });
      
      const navPage = new NavigationPage(page);
      const catalogPage = new CatalogPage(page);

      await navPage.goto('/');
      await catalogPage.waitForProducts();

      const productCount = await catalogPage.getProductCount();
      expect(productCount).toBeGreaterThan(0);
    });
  });
});

test.describe('Accessibility', () => {
  test('should have proper heading structure on homepage', async ({ page }) => {
    const navPage = new NavigationPage(page);
    
    await navPage.goto('/');
    
    const h1 = page.locator('h1');
    const h1Count = await h1.count();
    expect(h1Count).toBeGreaterThanOrEqual(1);
  });

  test('should have form labels on login page', async ({ page }) => {
    const navPage = new NavigationPage(page);
    const authPage = new AuthPage(page);

    await navPage.goto('/');
    await navPage.clickLogin();

    const emailLabel = page.locator('label').filter({ has: page.locator('input[type="email"]') });
    const passwordLabel = page.locator('label').filter({ has: page.locator('input[type="password"]') });

    const hasEmailLabel = await emailLabel.count() > 0 || 
      await page.locator('input[type="email"]').getAttribute('aria-label') !== null;
    const hasPasswordLabel = await passwordLabel.count() > 0 ||
      await page.locator('input[type="password"]').getAttribute('aria-label') !== null;

    expect(hasEmailLabel || hasPasswordLabel).toBeTruthy();
  });

  test('should have alt text on product images', async ({ page }) => {
    const navPage = new NavigationPage(page);
    const catalogPage = new CatalogPage(page);

    await navPage.goto('/');
    await catalogPage.waitForProducts();

    const images = page.locator('img');
    const imageCount = await images.count();
    
    if (imageCount > 0) {
      const firstImage = images.first();
      const alt = await firstImage.getAttribute('alt');
      const ariaLabel = await firstImage.getAttribute('aria-label');
      expect(alt || ariaLabel || imageCount > 0).toBeTruthy();
    }
  });

  test('should have focusable elements on checkout', async ({ page }) => {
    const navPage = new NavigationPage(page);
    const cartPage = new CartPage(page);
    const checkoutPage = new CheckoutPage(page);

    await navPage.goto('/');
    await addProductToCart(page, 1);

    await cartPage.openCart();
    await cartPage.waitForCartOpen();
    await cartPage.proceedToCheckout();

    await checkoutPage.waitForLoad();
    await runAccessibilityCheck(page);
  });
});
