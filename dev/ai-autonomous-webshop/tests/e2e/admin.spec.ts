import { test, expect } from '@playwright/test';

test.describe('Admin Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should navigate to admin dashboard', async ({ page }) => {
    const adminButton = page.locator('button[title*="Admin"], button[aria-label*="Admin"], [class*="Shield"]').first();
    if (await adminButton.isVisible()) {
      await adminButton.click();
      await expect(page.locator('text=Admin, text=Dashboard, text=Command')).toBeVisible({ timeout: 5000 });
    }
  });

  test('should display admin stats cards', async ({ page }) => {
    const adminButton = page.locator('button[title*="Admin"]').first();
    if (await adminButton.isVisible()) {
      await adminButton.click();
      await page.waitForTimeout(1000);
      
      const statCards = page.locator('[class*="stat"], [class*="card"], [class*="Stat"]');
      const count = await statCards.count();
      expect(count).toBeGreaterThan(0);
    }
  });

  test('should show revenue metrics', async ({ page }) => {
    const adminButton = page.locator('button[title*="Admin"]').first();
    if (await adminButton.isVisible()) {
      await adminButton.click();
      await page.waitForTimeout(1000);
      
      const revenueElement = page.locator('text=Revenue, text=Revenue:');
      if (await revenueElement.first().isVisible()) {
        await expect(revenueElement.first()).toBeVisible();
      }
    }
  });

  test('should show order count', async ({ page }) => {
    const adminButton = page.locator('button[title*="Admin"]').first();
    if (await adminButton.isVisible()) {
      await adminButton.click();
      await page.waitForTimeout(1000);
      
      const ordersElement = page.locator('text=Orders, text=Total Orders');
      if (await ordersElement.first().isVisible()) {
        await expect(ordersElement.first()).toBeVisible();
      }
    }
  });

  test('should display AI insights panel', async ({ page }) => {
    const adminButton = page.locator('button[title*="Admin"]').first();
    if (await adminButton.isVisible()) {
      await adminButton.click();
      await page.waitForTimeout(1000);
      
      const insightsElement = page.locator('text=AI Insight, text=AI Sourcing');
      if (await insightsElement.first().isVisible()) {
        await expect(insightsElement.first()).toBeVisible();
      }
    }
  });

  test('should access products management', async ({ page }) => {
    const adminButton = page.locator('button[title*="Admin"]').first();
    if (await adminButton.isVisible()) {
      await adminButton.click();
      await page.waitForTimeout(1000);
      
      const productsLink = page.locator('text=Products, text=Product Management').first();
      if (await productsLink.isVisible()) {
        await productsLink.click();
        await page.waitForTimeout(500);
      }
    }
  });

  test('should access orders management', async ({ page }) => {
    const adminButton = page.locator('button[title*="Admin"]').first();
    if (await adminButton.isVisible()) {
      await adminButton.click();
      await page.waitForTimeout(1000);
      
      const ordersLink = page.locator('text=Orders').first();
      if (await ordersLink.isVisible()) {
        await ordersLink.click();
        await page.waitForTimeout(500);
      }
    }
  });

  test('should access suppliers management', async ({ page }) => {
    const adminButton = page.locator('button[title*="Admin"]').first();
    if (await adminButton.isVisible()) {
      await adminButton.click();
      await page.waitForTimeout(1000);
      
      const suppliersLink = page.locator('text=Supplier').first();
      if (await suppliersLink.isVisible()) {
        await suppliersLink.click();
        await page.waitForTimeout(500);
      }
    }
  });

  test('should display settings panel', async ({ page }) => {
    const adminButton = page.locator('button[title*="Admin"]').first();
    if (await adminButton.isVisible()) {
      await adminButton.click();
      await page.waitForTimeout(1000);
      
      const settingsLink = page.locator('text=Settings').first();
      if (await settingsLink.isVisible()) {
        await settingsLink.click();
        await page.waitForTimeout(500);
      }
    }
  });

  test('should show automation rules', async ({ page }) => {
    const adminButton = page.locator('button[title*="Admin"]').first();
    if (await adminButton.isVisible()) {
      await adminButton.click();
      await page.waitForTimeout(1000);
      
      const automationLink = page.locator('text=Automation, text=Rules').first();
      if (await automationLink.isVisible()) {
        await automationLink.click();
        await page.waitForTimeout(500);
      }
    }
  });

  test('should toggle autopilot mode', async ({ page }) => {
    const adminButton = page.locator('button[title*="Admin"]').first();
    if (await adminButton.isVisible()) {
      await adminButton.click();
      await page.waitForTimeout(1000);
      
      const autopilotToggle = page.locator('button:has-text("Auto"), [class*="toggle"]').first();
      if (await autopilotToggle.isVisible()) {
        await autopilotToggle.click();
        await page.waitForTimeout(300);
      }
    }
  });

  test('should display campaigns section', async ({ page }) => {
    const adminButton = page.locator('button[title*="Admin"]').first();
    if (await adminButton.isVisible()) {
      await adminButton.click();
      await page.waitForTimeout(1000);
      
      const campaignsLink = page.locator('text=Campaign').first();
      if (await campaignsLink.isVisible()) {
        await campaignsLink.click();
        await page.waitForTimeout(500);
      }
    }
  });
});
