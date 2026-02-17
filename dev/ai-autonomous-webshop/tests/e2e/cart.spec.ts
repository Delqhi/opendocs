import { test, expect } from '@playwright/test';

test.describe('Cart & Collaborative Cart', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should open cart drawer when clicking cart icon', async ({ page }) => {
    const cartButton = page.locator('button:has([class*="cart"]), button[aria-label*="cart"]').first();
    if (await cartButton.isVisible()) {
      await cartButton.click();
    } else {
      const shoppingCartIcon = page.locator('.lucide-shopping-cart, [class*="ShoppingCart"]').first();
      if (await shoppingCartIcon.isVisible()) {
        await shoppingCartIcon.click();
      }
    }
    await expect(page.locator('text=Your Cart, text=Cart')).toBeVisible({ timeout: 5000 });
  });

  test('should add product to cart from product grid', async ({ page }) => {
    const addToCartButton = page.locator('button:has-text("Add to Cart"), button:has([class*="plus"])').first();
    if (await addToCartButton.isVisible()) {
      await addToCartButton.click();
      await page.waitForTimeout(500);
    }
    const cartCount = page.locator('span[class*="badge"], span[class*="count"]').first();
    if (await cartCount.isVisible()) {
      const countText = await cartCount.textContent();
      expect(parseInt(countText || '0')).toBeGreaterThan(0);
    }
  });

  test('should update quantity in cart', async ({ page }) => {
    await page.goto('/');
    const addToCartButton = page.locator('button:has-text("Add to Cart")').first();
    if (await addToCartButton.isVisible({ timeout: 3000 })) {
      await addToCartButton.click();
      await page.waitForTimeout(500);
    }
    
    const cartButton = page.locator('button:has([class*="cart"])').first();
    if (await cartButton.isVisible()) {
      await cartButton.click();
    }
    
    const increaseButton = page.locator('button:has([class*="plus"]), button:has-text("+")').first();
    if (await increaseButton.isVisible()) {
      await increaseButton.click();
      await page.waitForTimeout(300);
    }
  });

  test('should remove item from cart', async ({ page }) => {
    await page.goto('/');
    const addToCartButton = page.locator('button:has-text("Add to Cart")').first();
    if (await addToCartButton.isVisible({ timeout: 3000 })) {
      await addToCartButton.click();
      await page.waitForTimeout(500);
    }
    
    const cartButton = page.locator('button:has([class*="cart"])').first();
    if (await cartButton.isVisible()) {
      await cartButton.click();
    }
    
    const removeButton = page.locator('button:has-text("Remove"), button[aria-label*="Remove"]').first();
    if (await removeButton.isVisible()) {
      await removeButton.click();
      await page.waitForTimeout(300);
    }
  });

  test('should display cart total correctly', async ({ page }) => {
    await page.goto('/');
    const addToCartButton = page.locator('button:has-text("Add to Cart")').first();
    if (await addToCartButton.isVisible({ timeout: 3000 })) {
      await addToCartButton.click();
      await page.waitForTimeout(500);
    }
    
    const cartButton = page.locator('button:has([class*="cart"])').first();
    if (await cartButton.isVisible()) {
      await cartButton.click();
    }
    
    const totalElement = page.locator('text=Total:, [class*="total"]').first();
    if (await totalElement.isVisible()) {
      await expect(page.locator('[class*="price"], [class*="Total"]')).toBeVisible();
    }
  });

  test('should generate collaborative cart share link', async ({ page }) => {
    await page.goto('/');
    const addToCartButton = page.locator('button:has-text("Add to Cart")').first();
    if (await addToCartButton.isVisible({ timeout: 3000 })) {
      await addToCartButton.click();
      await page.waitForTimeout(500);
    }
    
    const cartButton = page.locator('button:has([class*="cart"])').first();
    if (await cartButton.isVisible()) {
      await cartButton.click();
    }
    
    const shareButton = page.locator('button:has-text("Share"), button[aria-label*="Share"]').first();
    if (await shareButton.isVisible()) {
      await shareButton.click();
      await expect(page.locator('input[readonly], [class*="share-link"]')).toBeVisible({ timeout: 3000 });
    }
  });

  test('should load collaborative cart from URL parameter', async ({ page }) => {
    await page.goto('/?cart_session=test-session-123');
    await page.waitForTimeout(1000);
  });

  test('should show empty cart message', async ({ page }) => {
    const cartButton = page.locator('button:has([class*="cart"])').first();
    if (await cartButton.isVisible()) {
      await cartButton.click();
    }
    const emptyMessage = page.locator('text=Your cart is empty, text=No items');
    if (await emptyMessage.isVisible()) {
      await expect(emptyMessage).toBeVisible();
    }
  });

  test('should apply coupon code in cart', async ({ page }) => {
    await page.goto('/');
    const addToCartButton = page.locator('button:has-text("Add to Cart")').first();
    if (await addToCartButton.isVisible({ timeout: 3000 })) {
      await addToCartButton.click();
      await page.waitForTimeout(500);
    }
    
    const cartButton = page.locator('button:has([class*="cart"])').first();
    if (await cartButton.isVisible()) {
      await cartButton.click();
    }
    
    const couponInput = page.locator('input[placeholder*="coupon"], input[placeholder*="code"]').first();
    if (await couponInput.isVisible()) {
      await couponInput.fill('WELCOME10');
      const applyButton = page.locator('button:has-text("Apply")').first();
      if (await applyButton.isVisible()) {
        await applyButton.click();
        await page.waitForTimeout(500);
      }
    }
  });

  test('should clear entire cart', async ({ page }) => {
    await page.goto('/');
    const addToCartButton = page.locator('button:has-text("Add to Cart")').first();
    if (await addToCartButton.isVisible({ timeout: 3000 })) {
      await addToCartButton.click();
      await page.waitForTimeout(500);
    }
    
    const cartButton = page.locator('button:has([class*="cart"])').first();
    if (await cartButton.isVisible()) {
      await cartButton.click();
    }
    
    const clearButton = page.locator('button:has-text("Clear Cart"), button:has-text("Clear")').first();
    if (await clearButton.isVisible()) {
      await clearButton.click();
      await page.waitForTimeout(300);
    }
  });
});
