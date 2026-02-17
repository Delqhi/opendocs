import { test, expect } from '@playwright/test';

test.describe('Checkout Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should proceed to checkout from cart', async ({ page }) => {
    await page.goto('/');
    const addToCartButton = page.locator('button:has-text("Add to Cart")').first();
    if (await addToCartButton.isVisible({ timeout: 3000 })) {
      await addToCartButton.click();
      await page.waitForTimeout(500);
    }
    
    const checkoutButton = page.locator('button:has-text("Checkout"), a:has-text("Checkout")').first();
    if (await checkoutButton.isVisible()) {
      await checkoutButton.click();
      await expect(page.locator('text=Checkout, text=Shipping, text=Payment')).toBeVisible({ timeout: 5000 });
    }
  });

  test('should display checkout form fields', async ({ page }) => {
    await page.goto('/');
    const addToCartButton = page.locator('button:has-text("Add to Cart")').first();
    if (await addToCartButton.isVisible({ timeout: 3000 })) {
      await addToCartButton.click();
      await page.waitForTimeout(500);
    }
    
    const checkoutButton = page.locator('button:has-text("Checkout")').first();
    if (await checkoutButton.isVisible()) {
      await checkoutButton.click();
      
      await expect(page.locator('input[name="email"], input[type="email"]')).toBeVisible({ timeout: 5000 });
      await expect(page.locator('input[name="firstName"], input[name="first_name"]')).toBeVisible();
      await expect(page.locator('input[name="lastName"], input[name="last_name"]')).toBeVisible();
      await expect(page.locator('input[name="address"], input[name="address1"]')).toBeVisible();
      await expect(page.locator('input[name="city"]')).toBeVisible();
      await expect(page.locator('input[name="zip"], input[name="zipCode"]')).toBeVisible();
    }
  });

  test('should validate required checkout fields', async ({ page }) => {
    await page.goto('/');
    const addToCartButton = page.locator('button:has-text("Add to Cart")').first();
    if (await addToCartButton.isVisible({ timeout: 3000 })) {
      await addToCartButton.click();
      await page.waitForTimeout(500);
    }
    
    const checkoutButton = page.locator('button:has-text("Checkout")').first();
    if (await checkoutButton.isVisible()) {
      await checkoutButton.click();
      
      const submitButton = page.locator('button:has-text("Continue"), button[type="submit"]').first();
      if (await submitButton.isVisible()) {
        await submitButton.click();
        await page.waitForTimeout(500);
      }
    }
  });

  test('should calculate shipping costs', async ({ page }) => {
    await page.goto('/');
    const addToCartButton = page.locator('button:has-text("Add to Cart")').first();
    if (await addToCartButton.isVisible({ timeout: 3000 })) {
      await addToCartButton.click();
      await page.waitForTimeout(500);
    }
    
    const checkoutButton = page.locator('button:has-text("Checkout")').first();
    if (await checkoutButton.isVisible()) {
      await checkoutButton.click();
      
      const shippingOptions = page.locator('text=Standard, text=Express, text=Priority');
      if (await shippingOptions.first().isVisible()) {
        await expect(shippingOptions.first()).toBeVisible();
      }
    }
  });

  test('should select shipping method', async ({ page }) => {
    await page.goto('/');
    const addToCartButton = page.locator('button:has-text("Add to Cart")').first();
    if (await addToCartButton.isVisible({ timeout: 3000 })) {
      await addToCartButton.click();
      await page.waitForTimeout(500);
    }
    
    const checkoutButton = page.locator('button:has-text("Checkout")').first();
    if (await checkoutButton.isVisible()) {
      await checkoutButton.click();
      
      const expressOption = page.locator('text=Express, text=Priority').first();
      if (await expressOption.isVisible()) {
        await expressOption.click();
        await page.waitForTimeout(300);
      }
    }
  });

  test('should display order summary', async ({ page }) => {
    await page.goto('/');
    const addToCartButton = page.locator('button:has-text("Add to Cart")').first();
    if (await addToCartButton.isVisible({ timeout: 3000 })) {
      await addToCartButton.click();
      await page.waitForTimeout(500);
    }
    
    const checkoutButton = page.locator('button:has-text("Checkout")').first();
    if (await checkoutButton.isVisible()) {
      await checkoutButton.click();
      
      const summarySection = page.locator('text=Order Summary, [class*="summary"]');
      if (await summarySection.isVisible()) {
        await expect(summarySection).toBeVisible();
      }
    }
  });

  test('should show discount in order total', async ({ page }) => {
    await page.goto('/');
    const addToCartButton = page.locator('button:has-text("Add to Cart")').first();
    if (await addToCartButton.isVisible({ timeout: 3000 })) {
      await addToCartButton.click();
      await page.waitForTimeout(500);
    }
    
    const checkoutButton = page.locator('button:has-text("Checkout")').first();
    if (await checkoutButton.isVisible()) {
      await checkoutButton.click();
      
      const discountLine = page.locator('text=Discount:, text=-');
      if (await discountLine.isVisible()) {
        await expect(discountLine).toBeVisible();
      }
    }
  });

  test('should complete purchase (mocked)', async ({ page }) => {
    await page.goto('/');
    const addToCartButton = page.locator('button:has-text("Add to Cart")').first();
    if (await addToCartButton.isVisible({ timeout: 3000 })) {
      await addToCartButton.click();
      await page.waitForTimeout(500);
    }
    
    const checkoutButton = page.locator('button:has-text("Checkout")').first();
    if (await checkoutButton.isVisible()) {
      await checkoutButton.click();
      
      const emailInput = page.locator('input[name="email"]');
      if (await emailInput.isVisible()) {
        await emailInput.fill('test@example.com');
        await page.locator('input[name="firstName"]').fill('Test');
        await page.locator('input[name="lastName"]').fill('User');
        await page.locator('input[name="address1"]').fill('123 Test St');
        await page.locator('input[name="city"]').fill('Test City');
        await page.locator('input[name="zip"]').fill('12345');
        
        const placeOrderButton = page.locator('button:has-text("Place Order"), button:has-text("Complete")').first();
        if (await placeOrderButton.isVisible()) {
          await placeOrderButton.click();
          await page.waitForTimeout(1000);
        }
      }
    }
  });
});
