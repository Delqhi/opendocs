import { test, expect } from '@playwright/test';

test.describe('NEXUS AI Shop E2E', () => {
  test('should load the homepage and show products', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await expect(page.locator('text=NEXUSAI')).toBeVisible();
    await expect(page.locator('text=Featured Products')).toBeVisible();
  });

  test('should allow searching for products', async ({ page }) => {
    await page.goto('http://localhost:3000');
    const searchInput = page.locator('placeholder="Search products, categories, or AI trends..."');
    await searchInput.fill('Smartwatch');
    await searchInput.press('Enter');
    // Check if results are filtered (mocked or real)
  });

  test('should open the cart drawer', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.click('button:has-text("Login")'); // Just to navigate
    await page.click('.lucide-shopping-cart');
    await expect(page.locator('text=Your Cart')).toBeVisible();
  });

  test('should navigate to admin dashboard', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.click('title="Admin Dashboard"');
    await expect(page.locator('text=Admin Command Center')).toBeVisible();
    await expect(page.locator('text=AI Trend Sourcing')).toBeVisible();
  });
});
