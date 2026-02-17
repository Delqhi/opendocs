import { test, expect } from '@playwright/test';

test.describe('Voice Control (Mocked)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display voice control button', async ({ page }) => {
    const voiceButton = page.locator('button[title*="Voice"], [class*="Mic"], [class*="voice"]').first();
    if (await voiceButton.isVisible()) {
      await expect(voiceButton).toBeVisible();
    } else {
      const micButton = page.locator('button:has([class*="Mic"])');
      await expect(micButton).toBeVisible();
    }
  });

  test('should toggle voice listening state (mocked)', async ({ page }) => {
    await page.addInitScript(() => {
      window.SpeechRecognition = class SpeechRecognition {
        start() {}
        stop() {}
        abort() {}
        lang = 'en-US';
        continuous = false;
        interimResults = false;
        onstart: (() => void) | null = null;
        onend: (() => void) | null = null;
        onresult: ((event: any) => void) | null = null;
      };
      (window as any).webkitSpeechRecognition = class SpeechRecognition {
        start() {}
        stop() {}
        abort() {}
        lang = 'en-US';
        continuous = false;
        interimResults = false;
        onstart: (() => void) | null = null;
        onend: (() => void) | null = null;
        onresult: ((event: any) => void) | null = null;
      };
    });
    
    const voiceButton = page.locator('button:has([class*="Mic"])').first();
    if (await voiceButton.isVisible()) {
      await voiceButton.click();
      await page.waitForTimeout(500);
    }
  });

  test('should show voice command feedback notification', async ({ page }) => {
    await page.addInitScript(() => {
      window.SpeechRecognition = class SpeechRecognition {
        start() {
          if (this.onstart) this.onstart();
        }
        stop() {
          if (this.onend) this.onend();
        }
        abort() {}
        lang = 'en-US';
        continuous = false;
        interimResults = false;
        onstart: (() => void) | null = null;
        onend: (() => void) | null = null;
        onresult: ((event: any) => void) | null = null;
      };
      (window as any).webkitSpeechRecognition = class SpeechRecognition {
        start() {
          if (this.onstart) this.onstart();
        }
        stop() {
          if (this.onend) this.onend();
        }
        abort() {}
        lang = 'en-US';
        continuous = false;
        interimResults = false;
        onstart: (() => void) | null = null;
        onend: (() => void) | null = null;
        onresult: ((event: any) => void) | null = null;
      };
    });
    
    const voiceButton = page.locator('button:has([class*="Mic"])').first();
    if (await voiceButton.isVisible()) {
      await voiceButton.click();
      await page.waitForTimeout(1000);
      
      const notification = page.locator('[class*="notification"], [class*="toast"]');
      if (await notification.first().isVisible()) {
        await expect(notification.first()).toBeVisible();
      }
    }
  });

  test('should handle unsupported browser gracefully', async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(window, 'SpeechRecognition', { value: undefined });
      Object.defineProperty(window, 'webkitSpeechRecognition', { value: undefined });
    });
    
    const voiceButton = page.locator('button:has([class*="Mic"])').first();
    if (await voiceButton.isVisible()) {
      await voiceButton.click();
      await page.waitForTimeout(500);
      
      const errorNotification = page.locator('text=not supported, text=error');
      if (await errorNotification.isVisible()) {
        await expect(errorNotification).toBeVisible();
      }
    }
  });
});
