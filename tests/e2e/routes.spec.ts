import { expect, test } from '@playwright/test';

test('serves static deep routes, SEO files and a real missing route', async ({ request }) => {
  for (const path of [
    '/programacion/',
    '/programacion/2026-10-08/',
    '/programacion/2026-10-11/',
    '/programacion/2026-10-12/',
    '/fiestas-del-interior/',
    '/robots.txt',
    '/llms.txt',
    '/programacion.md',
    '/sitemap-index.xml',
  ]) {
    const response = await request.get(path);
    expect(response.ok(), path).toBe(true);
  }
  const missing = await request.get('/esta-ruta-no-existe/');
  expect(missing.status()).toBe(404);
});

test('renders the complete interior agenda without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('/fiestas-del-interior/');
  await expect(page.locator('.culture-card')).toHaveCount(13);
  await expect(page.locator('.sport-event')).toHaveCount(11);
  await expect(page.locator('.screening-card')).toHaveCount(4);
  await expect(page.getByRole('heading', { name: 'Zapicán' })).toBeVisible();
  await expect(page.getByText('Encuentro Paradeportivo Regional')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Villa Serrana' })).toBeVisible();
  await context.close();
});

test('old Wednesday deep links redirect to the new Thursday program without JavaScript', async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('/programacion/2026-10-07/');
  await expect(page).toHaveURL(/\/programacion\/2026-10-08\/$/);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Jueves 8');
  await context.close();
});
