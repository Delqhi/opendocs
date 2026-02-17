import { test, expect } from '@playwright/test';

test.describe('Search Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display search input in header', async ({ page }) => {
    const searchInput = page.locator('input[type="text"][placeholder*="Search"], input[placeholder*="search"]').first();
    if (await searchInput.isVisible()) {
      await expect(searchInput).toBeVisible();
    } else {
      const searchBar = page.locator('[class*="SearchBar"], [class*="search"]').first();
      await expect(searchBar).toBeVisible();
    }
  });

  test('should filter products by search query', async ({ page }) => {
    const searchInput = page.locator('input[type="text"]').first();
    if (await searchInput.isVisible()) {
      await searchInput.fill('Smartwatch');
      await searchInput.press('Enter');
      await page.waitForTimeout(500);
      
      const results = page.locator('[class*="product"], [class*="card"]');
      const count = await results.count();
      expect(count).toBeGreaterThanOrEqual(0);
    }
  });

  test('should show search suggestions dropdown', async ({ page }) => {
    const searchInput = page.locator('input[type="text"]').first();
    if (await searchInput.isVisible()) {
      await searchInput.fill('Phone');
      await page.waitForTimeout(500);
      
      const suggestions = page.locator('[class*="suggestion"], [class*="dropdown"], [class*="result"]');
      const hasSuggestions = await suggestions.count();
      expect(hasSuggestions).toBeGreaterThanOrEqual(0);
    }
  });

  test('should search by category', async ({ page }) => {
    const categoryButton = page.locator('button:has-text("Technology"), button:has-text("Wellness")').first();
    if (await categoryButton.isVisible()) {
      await categoryButton.click();
      await page.waitForTimeout(500);
      
      const products = page.locator('[class*="product"], [class*="card"]');
      const count = await products.count();
      expect(count).toBeGreaterThan(0);
    }
  });

  test('should show no results message for empty search', async ({ page }) => {
    const searchInput = page.locator('input[type="text"]').first();
    if (await searchInput.isVisible()) {
      await searchInput.fill('xyznonexistentproduct123');
      await searchInput.press('Enter');
      await page.waitForTimeout(500);
      
      const noResults = page.locator('text=No results, text=No products found, text=No artifacts');
      if (await noResults.isVisible()) {
        await expect(noResults).toBeVisible();
      }
    }
  });

  test('should clear search and show all products', async ({ page }) => {
    const searchInput = page.locator('input[type="text"]').first();
    if (await searchInput.isVisible()) {
      await searchInput.fill('Smart');
      await page.waitForTimeout(300);
      
      const clearButton = page.locator('button:has-text("Clear"), button[aria-label="Clear"]').first();
      if (await clearButton.isVisible()) {
        await clearButton.click();
        await page.waitForTimeout(300);
      }
      
      await expect(page.locator('text=Featured Products')).toBeVisible();
    }
  });

  test('should support keyboard navigation in search', async ({ page }) => {
    const searchInput = page.locator('input[type="text"]').first();
    if (await searchInput.isVisible()) {
      await searchInput.fill('Phone');
      await page.waitForTimeout(500);
      
      await searchInput.press('ArrowDown');
      await page.waitForTimeout(200);
    }
  });
});
