import { defineConfig, devices } from '@playwright/test';
import { config } from './tests/e2e/test.config';

const frontendPort = process.env.FRONTEND_PORT || '53001';
const frontendUrl = `http://localhost:${frontendPort}`;

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['list'],
  ],
  timeout: config.timeouts.default,
  expect: {
    timeout: config.timeouts.action,
  },
  use: {
    baseURL: frontendUrl,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: config.timeouts.action,
    navigationTimeout: config.timeouts.navigation,
  },
  projects: [
    {
      name: 'chromium-desktop',
      use: {
        ...devices['Desktop Chrome'],
        viewport: config.viewports.desktop,
      },
    },
    {
      name: 'chromium-laptop',
      use: {
        ...devices['Desktop Chrome'],
        viewport: config.viewports.laptop,
      },
    },
    {
      name: 'tablet-landscape',
      use: {
        ...devices['iPad Pro 11'],
        viewport: { width: 1024, height: 768 },
      },
    },
    {
      name: 'tablet-portrait',
      use: {
        ...devices['iPad Mini'],
        viewport: { width: 768, height: 1024 },
      },
    },
    {
      name: 'mobile-iphone-14-pro',
      use: {
        ...devices['iPhone 14 Pro'],
        viewport: config.viewports.mobile,
      },
    },
    {
      name: 'mobile-pixel-7',
      use: {
        ...devices['Pixel 7'],
        viewport: { width: 412, height: 915 },
      },
    },
  ],
  webServer: {
    command: `echo "Frontend should be running on port ${frontendPort}"`,
    port: parseInt(frontendPort),
    timeout: 30000,
    reuseExistingServer: !process.env.CI,
  },
});
