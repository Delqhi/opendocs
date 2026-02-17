import { test, expect } from '@playwright/test';

test.describe('Visual Regression Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('homepage visual snapshot', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    await expect(page.locator('text=NEXUS, text=NEXUSAI')).toBeVisible({ timeout: 10000 });
    await expect(page).toHaveScreenshot('homepage.png', { maxDiffPixelRatio: 0.1 });
  });

  test('product grid visual snapshot', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    await expect(page.locator('text=Featured Products')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('[class*="product"]').first()).toBeVisible({ timeout: 5000 });
    await expect(page).toHaveScreenshot('product-grid.png', { maxDiffPixelRatio: 0.15 });
  });

  test('product detail page visual snapshot', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    const productCard = page.locator('[class*="product"], [class*="card"]').first();
    if (await productCard.isVisible({ timeout: 5000 })) {
      await productCard.click();
      await page.waitForTimeout(1000);
      await expect(page).toHaveScreenshot('product-detail.png', { maxDiffPixelRatio: 0.15 });
    }
  });

  test('cart drawer visual snapshot', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    const cartButton = page.locator('button:has([class*="cart"])').first();
    if (await cartButton.isVisible()) {
      await cartButton.click();
      await page.waitForTimeout(500);
      await expect(page).toHaveScreenshot('cart-drawer.png', { maxDiffPixelRatio: 0.1 });
    }
  });

  test('login page visual snapshot', async ({ page }) => {
    await page.click('button:has-text("Login")');
    await page.waitForTimeout(1000);
    await expect(page).toHaveScreenshot('login-page.png', { maxDiffPixelRatio: 0.1 });
  });

  test('admin dashboard visual snapshot', async ({ page }) => {
    const adminButton = page.locator('button[title*="Admin"]').first();
    if (await adminButton.isVisible()) {
      await adminButton.click();
      await page.waitForTimeout(2000);
      await expect(page).toHaveScreenshot('admin-dashboard.png', { maxDiffPixelRatio: 0.15 });
    }
  });

  test('mobile homepage visual snapshot', async ({ page, isMobile }) => {
    if (isMobile) {
      await page.waitForLoadState('networkidle');
      await expect(page).toHaveScreenshot('homepage-mobile.png', { maxDiffPixelRatio: 0.2 });
    }
  });

  test('tablet homepage visual snapshot', async ({ page, isMobile }) => {
    const viewport = page.viewportSize();
    if (viewport && viewport.width >= 768 && viewport.width <= 1024) {
      await page.waitForLoadState('networkidle');
      await expect(page).toHaveScreenshot('homepage-tablet.png', { maxDiffPixelRatio: 0.15 });
    }
  });
});
