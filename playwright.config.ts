import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests', // Folder where test files will be located
  timeout: 30000, // Maximum test duration (in milliseconds)
  retries: 2, // Number of retries on failure
  use: {
    headless: true, // Run tests in headless mode
    baseURL: 'http://localhost:3000', // Base URL of your app
    screenshot: 'on', // Capture screenshots on failure
    video: 'retain-on-failure', // Record video on failure
    trace: 'retain-on-failure', // Enable trace on failure
  },
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
    { name: 'firefox', use: { browserName: 'firefox' } },
    { name: 'webkit', use: { browserName: 'webkit' } },
  ],
});
