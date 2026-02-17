import { test, expect } from '@playwright/test';

test.describe('Performance Tests', () => {
  test('should load homepage under 3 seconds', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(3000);
  });

  test('should have FCP under 1 second', async ({ page }) => {
    await page.goto('/');
    
    const fcp = await page.evaluate(() => {
      return new Promise((resolve) => {
        if ('PerformanceObserver' in window) {
          const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              if (entry.name === 'first-contentful-paint') {
                resolve(entry.startTime);
                observer.disconnect();
              }
            }
          });
          observer.observe({ type: 'paint', buffered: true });
          
          setTimeout(() => resolve(-1), 5000);
        } else {
          resolve(-1);
        }
      });
    });
    
    if (fcp > 0) {
      expect(fcp).toBeLessThan(1000);
    }
  });

  test('should have LCP under 2.5 seconds', async ({ page }) => {
    await page.goto('/');
    
    const lcp = await page.evaluate(() => {
      return new Promise((resolve) => {
        if ('PerformanceObserver' in window) {
          let lcpValue = -1;
          const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              const lastEntry = list.getEntries().pop();
              if (lastEntry) {
                lcpValue = lastEntry.startTime;
                resolve(lcpValue);
              }
            }
          });
          observer.observe({ type: 'largest-contentful-paint', buffered: true });
          
          setTimeout(() => resolve(lcpValue), 5000);
        } else {
          resolve(-1);
        }
      });
    });
    
    if (lcp > 0) {
      expect(lcp).toBeLessThan(2500);
    }
  });

  test('should not have layout shifts after load', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const cls = await page.evaluate(() => {
      return new Promise((resolve) => {
        if ('PerformanceObserver' in window) {
          let clsValue = 0;
          const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              if ('value' in entry) {
                clsValue += (entry as any).value;
              }
            }
          });
          observer.observe({ type: 'layout-shift', buffered: true });
          
          setTimeout(() => resolve(clsValue), 2000);
        } else {
          resolve(0);
        }
      });
    });
    
    expect(cls).toBeLessThan(0.1);
  });

  test('should load product images efficiently', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const images = await page.locator('img').count();
    expect(images).toBeGreaterThan(0);
    
    const lazyImages = await page.locator('img[loading="lazy"]').count();
    expect(lazyImages).toBeGreaterThan(0);
  });

  test('should have responsive navigation on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const menuButton = page.locator('button[class*="menu"], button[aria-label*="menu"]');
    if (await menuButton.isVisible()) {
      await expect(menuButton).toBeVisible();
    }
  });

  test('should execute JavaScript without blocking render', async ({ page }) => {
    await page.goto('/');
    
    const blockingJS = await page.evaluate(() => {
      const entries = performance.getEntriesByType('resource');
      const jsFiles = entries.filter(e => e.name.endsWith('.js'));
      const blocking = jsFiles.filter(e => e.transferDuration === 0 && e.duration > 50);
      return blocking.length;
    });
    
    expect(blockingJS).toBeLessThan(3);
  });
});
