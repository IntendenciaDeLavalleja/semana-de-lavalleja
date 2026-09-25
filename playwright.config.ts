import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 45_000,
  expect: { timeout: 7_000 },
  fullyParallel: false,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://127.0.0.1:4322',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  webServer: [
    {
      command: 'node scripts/serve-reference.mjs',
      url: 'http://127.0.0.1:4173/Semana-de-Lavalleja-53.html',
      reuseExistingServer: true,
      timeout: 30_000,
    },
    {
      command: 'npm run build && npx astro preview --host 0.0.0.0 --port 4322',
      url: 'http://127.0.0.1:4322/',
      reuseExistingServer: true,
      timeout: 120_000,
      ignoreHTTPSErrors: true,
    },
  ],
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
});
