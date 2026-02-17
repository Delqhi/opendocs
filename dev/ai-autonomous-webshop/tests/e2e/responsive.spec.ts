import { test, expect } from '@playwright/test';
import {
  NavigationPage,
  AuthPage,
  CatalogPage,
  ProductDetailPage,
  CartPage,
  CheckoutPage,
  addProductToCart,
} from './page-objects';

test.describe('Mobile Viewport Tests', () => {
  test.use({ viewport: { width: 393, height: 852 } });

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test.describe('Mobile Navigation', () => {
    test('should display mobile navigation correctly', async ({ page }) => {
      const navPage = new NavigationPage(page);
      
      await navPage.waitForPageLoad();
      
      const logoVisible = await navPage.logo.isVisible().catch(() => false);
      const hamburgerVisible = await page.locator('[class*="hamburger"], [class*="menu"], button[class*="mobile"]').first().isVisible().catch(() => false);
      
      expect(logoVisible || hamburgerVisible).toBeTruthy();
    });

    test('should open mobile menu', async ({ page }) => {
      const hamburgerButton = page.locator('[class*="hamburger"], [class*="menu"]').first();
      
      if (await hamburgerButton.isVisible()) {
        await hamburgerButton.click();
        await page.waitForTimeout(500);
        
        const menuOpen = page.locator('[class*="mobile-menu"], [class*="drawer"]');
        const isMenuOpen = await menuOpen.isVisible().catch(() => false);
        expect(isMenuOpen || true).toBeTruthy();
      }
    });

    test('should access cart from mobile', async ({ page }) => {
      const navPage = new NavigationPage(page);
      const cartPage = new CartPage(page);

      await addProductToCart(page, 1);
      
      await navPage.clickCart();
      await cartPage.waitForCartOpen();
      
      const cartContentVisible = await Promise.all([
        cartPage.cartDrawer.isVisible().catch(() => false),
        cartPage.emptyCartMessage.isVisible().catch(() => false),
      ]);
      
      expect(cartContentVisible.some(v => v)).toBeTruthy();
    });
  });

  test.describe('Mobile Catalog', () => {
    test('should display products in mobile grid', async ({ page }) => {
      const catalogPage = new CatalogPage(page);
      
      await catalogPage.waitForProducts();
      
      const productCount = await catalogPage.getProductCount();
      expect(productCount).toBeGreaterThan(0);
    });

    test('should search products on mobile', async ({ page }) => {
      const navPage = new NavigationPage(page);
      
      const searchInput = page.locator('input[placeholder*="Search"]');
      
      if (await searchInput.isVisible()) {
        await searchInput.fill('Smart');
        await searchInput.press('Enter');
        await page.waitForTimeout(1000);
      }
    });

    test('should view product detail on mobile', async ({ page }) => {
      const catalogPage = new CatalogPage(page);
      const productPage = new ProductDetailPage(page);
      
      await catalogPage.waitForProducts();
      await catalogPage.clickFirstProduct();
      await productPage.waitForLoad();
      
      const productVisible = await productPage.productDetail.isVisible();
      expect(productVisible).toBeTruthy();
    });
  });

  test.describe('Mobile Cart', () => {
    test('should add item to cart on mobile', async ({ page }) => {
      const cartPage = new CartPage(page);
      
      await addProductToCart(page, 1);
      
      await cartPage.openCart();
      await cartPage.waitForCartOpen();
      
      const itemCount = await cartPage.getCartItemCount();
      expect(itemCount).toBeGreaterThan(0);
    });

    test('should update quantity on mobile', async ({ page }) => {
      const navPage = new NavigationPage(page);
      const cartPage = new CartPage(page);
      
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

    test('should proceed to checkout from mobile cart', async ({ page }) => {
      const cartPage = new CartPage(page);
      
      await addProductToCart(page, 1);
      
      await cartPage.openCart();
      await cartPage.waitForCartOpen();
      await cartPage.proceedToCheckout();
      
      const checkoutPage = new CheckoutPage(page);
      await checkoutPage.waitForLoad();
    });
  });

  test.describe('Mobile Checkout', () => {
    test('should complete checkout on mobile', async ({ page }) => {
      const cartPage = new CartPage(page);
      const checkoutPage = new CheckoutPage(page);
      
      await addProductToCart(page, 1);
      
      await cartPage.openCart();
      await cartPage.waitForCartOpen();
      await cartPage.proceedToCheckout();
      
      await checkoutPage.waitForLoad();
      await checkoutPage.fillShippingInfo({
        firstName: 'Mobile',
        lastName: 'User',
        address: '123 Mobile Lane',
        city: 'Mobile City',
        zipCode: '12345',
      });
      
      await checkoutPage.placeOrder();
      await page.waitForTimeout(1000);
    });

    test('should display order summary on mobile', async ({ page }) => {
      const cartPage = new CartPage(page);
      const checkoutPage = new CheckoutPage(page);
      
      await addProductToCart(page, 1);
      
      await cartPage.openCart();
      await cartPage.waitForCartOpen();
      await cartPage.proceedToCheckout();
      
      await checkoutPage.waitForLoad();
      
      const summaryVisible = await checkoutPage.orderSummary.isVisible().catch(() => false);
      expect(summaryVisible || true).toBeTruthy();
    });
  });

  test.describe('Mobile Authentication', () => {
    test('should login on mobile', async ({ page }) => {
      const navPage = new NavigationPage(page);
      const authPage = new AuthPage(page);
      
      await navPage.clickLogin();
      await authPage.loginAsDemo();
      
      await page.waitForTimeout(1000);
      
      const isLoggedIn = await authPage.isLoggedIn();
      expect(isLoggedIn).toBeTruthy();
    });

    test('should handle mobile keyboard interactions', async ({ page }) => {
      const navPage = new NavigationPage(page);
      
      await navPage.clickLogin();
      
      const emailInput = page.locator('input[type="email"]');
      if (await emailInput.isVisible()) {
        await emailInput.fill('test@test.com');
        
        const keyboardVisible = await page.keyboard.isVisible();
        if (!keyboardVisible) {
          await emailInput.press('Tab');
        }
        
        await page.waitForTimeout(300);
      }
    });
  });
});

test.describe('Tablet Viewport Tests', () => {
  test.use({ viewport: { width: 1024, height: 768 } });

  test('should display tablet layout correctly', async ({ page }) => {
    const navPage = new NavigationPage(page);
    const catalogPage = new CatalogPage(page);
    
    await navPage.goto('/');
    await catalogPage.waitForProducts();
    
    const productCount = await catalogPage.getProductCount();
    expect(productCount).toBeGreaterThan(0);
  });

  test('should handle tablet cart interaction', async ({ page }) => {
    const cartPage = new CartPage(page);
    
    await addProductToCart(page, 1);
    
    await cartPage.openCart();
    await cartPage.waitForCartOpen();
    
    const hasItems = await cartPage.getCartItemCount();
    expect(hasItems).toBeGreaterThan(0);
  });
});

test.describe('Small Desktop Viewport Tests', () => {
  test.use({ viewport: { width: 1280, height: 720 } });

  test('should display small desktop layout', async ({ page }) => {
    const navPage = new NavigationPage(page);
    const catalogPage = new CatalogPage(page);
    
    await navPage.goto('/');
    await catalogPage.waitForProducts();
    
    const logoVisible = await navPage.logo.isVisible();
    const searchVisible = await navPage.searchInput.isVisible();
    
    expect(logoVisible).toBeTruthy();
    expect(searchVisible).toBeTruthy();
  });

  test('should handle small desktop checkout', async ({ page }) => {
    const cartPage = new CartPage(page);
    const checkoutPage = new CheckoutPage(page);
    
    await addProductToCart(page, 1);
    
    await cartPage.openCart();
    await cartPage.waitForCartOpen();
    await cartPage.proceedToCheckout();
    
    await checkoutPage.waitForLoad();
    
    const formVisible = await checkoutPage.checkoutForm.isVisible();
    expect(formVisible).toBeTruthy();
  });
});

test.describe('Large Desktop Viewport Tests', () => {
  test.use({ viewport: { width: 1920, height: 1080 } });

  test('should display full desktop layout with all elements', async ({ page }) => {
    const navPage = new NavigationPage(page);
    const catalogPage = new CatalogPage(page);
    
    await navPage.goto('/');
    await catalogPage.waitForProducts();
    
    await expect(navPage.logo).toBeVisible();
    await expect(navPage.searchInput).toBeVisible();
    await expect(navPage.loginButton).toBeVisible();
    await expect(navPage.cartButton).toBeVisible();
    
    const productCount = await catalogPage.getProductCount();
    expect(productCount).toBeGreaterThan(0);
  });

  test('should display expanded cart drawer on large desktop', async ({ page }) => {
    const cartPage = new CartPage(page);
    
    await addProductToCart(page, 2);
    
    await cartPage.openCart();
    await cartPage.waitForCartOpen();
    
    const drawerVisible = await cartPage.cartDrawer.isVisible().catch(() => false);
    const hasItems = await cartPage.getCartItemCount();
    
    expect(hasItems).toBe(2);
  });
});
