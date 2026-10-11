import { defineConfig, devices } from '@playwright/test';
import { WEB_URL, backend, frontend } from './test/playwright/stack.js';

// SHOWCASE=1 records every test slowly, for demos
const showcase = !!process.env.SHOWCASE;

export default defineConfig({
  testDir: 'test/playwright',
  outputDir: 'test/playwright/.results',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: [['list'], ['html', { outputFolder: 'test/playwright/.report', open: 'never' }]],
  // the Vite dev server compiles pages on first visit, which is slow under parallel load
  expect: { timeout: 15_000 },

  use: {
    baseURL: WEB_URL,
    testIdAttribute: 'data-cy',
    locale: 'el-GR',
    trace: showcase ? 'on' : 'retain-on-failure',
    video: showcase ? 'on' : 'retain-on-failure',
    screenshot: showcase ? 'on' : 'only-on-failure',
    launchOptions: { slowMo: showcase ? 400 : 0 },
  },

  projects: [
    { name: 'setup', testMatch: /.*\.setup\.js/ },
    {
      name: 'desktop',
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['setup'],
    },
    {
      name: 'mobile',
      use: { ...devices['Pixel 7'] },
      dependencies: ['setup'],
    },
  ],

  webServer: [
    { ...backend, timeout: 120_000, reuseExistingServer: false },
    // Vite echoes every browser console warning on stderr
    { ...frontend, timeout: 120_000, reuseExistingServer: false, stderr: 'ignore' },
  ],
});
