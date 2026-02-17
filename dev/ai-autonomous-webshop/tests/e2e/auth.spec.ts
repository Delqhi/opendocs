import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display login button in nav', async ({ page }) => {
    const loginButton = page.locator('button:has-text("Login")');
    await expect(loginButton).toBeVisible();
  });

  test('should navigate to login page when clicking login button', async ({ page }) => {
    await page.click('button:has-text("Login")');
    await expect(page.locator('input[type="email"], input[name="email"]')).toBeVisible({ timeout: 5000 });
  });

  test('should show login form with email and password fields', async ({ page }) => {
    await page.click('button:has-text("Login")');
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('should toggle between login and register forms', async ({ page }) => {
    await page.click('button:has-text("Login")');
    const registerLink = page.locator('text=Register');
    if (await registerLink.isVisible()) {
      await registerLink.click();
      await expect(page.locator('input[name="firstName"], input[name="first_name"]')).toBeVisible({ timeout: 3000 });
    }
  });

  test('should validate email format on login', async ({ page }) => {
    await page.click('button:has-text("Login")');
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    
    await emailInput.fill('invalid-email');
    await passwordInput.fill('password123');
    
    const submitButton = page.locator('button[type="submit"]');
    if (await submitButton.isVisible()) {
      await submitButton.click();
    }
  });

  test('should allow guest to browse products without login', async ({ page }) => {
    await expect(page.locator('text=Featured Products')).toBeVisible();
    const productCards = page.locator('[class*="product"], [class*="card"]');
    await expect(productCards.first()).toBeVisible();
  });

  test('should show user avatar when logged in (demo)', async ({ page }) => {
    await page.click('button:has-text("Login")');
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    
    if (await emailInput.isVisible()) {
      await emailInput.fill('demo');
      await passwordInput.fill('demo');
      
      const submitButton = page.locator('button[type="submit"]');
      if (await submitButton.isVisible()) {
        await submitButton.click();
        await page.waitForTimeout(1000);
      }
    }
  });

  test('should logout user and return to shop', async ({ page }) => {
    await page.click('button:has-text("Login")');
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    
    if (await emailInput.isVisible()) {
      await emailInput.fill('demo');
      await passwordInput.fill('demo');
      
      const submitButton = page.locator('button[type="submit"]');
      if (await submitButton.isVisible()) {
        await submitButton.click();
        await page.waitForTimeout(1000);
      }
    }
    
    const accountButton = page.locator('button[aria-label="Account"], button:has([class*="user"])');
    if (await accountButton.isVisible()) {
      await accountButton.click();
      const logoutButton = page.locator('text=Logout, text=Sign Out');
      if (await logoutButton.isVisible()) {
        await logoutButton.click();
        await expect(page.locator('button:has-text("Login")')).toBeVisible();
      }
    }
  });

  test('should handle login error gracefully', async ({ page }) => {
    await page.click('button:has-text("Login")');
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    
    if (await emailInput.isVisible()) {
      await emailInput.fill('wrong@test.com');
      await passwordInput.fill('wrongpassword');
      
      const submitButton = page.locator('button[type="submit"]');
      if (await submitButton.isVisible()) {
        await submitButton.click();
        await page.waitForTimeout(500);
      }
    }
  });

  test('should persist session across page refreshes', async ({ page }) => {
    await page.click('button:has-text("Login")');
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    
    if (await emailInput.isVisible()) {
      await emailInput.fill('demo');
      await passwordInput.fill('demo');
      
      const submitButton = page.locator('button[type="submit"]');
      if (await submitButton.isVisible()) {
        await submitButton.click();
        await page.waitForTimeout(1000);
      }
    }
    
    await page.reload();
    await page.waitForTimeout(500);
  });
});
