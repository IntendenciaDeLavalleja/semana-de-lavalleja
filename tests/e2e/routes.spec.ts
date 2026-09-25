import { expect, test } from '@playwright/test';

test('serves static deep routes, SEO files and a real missing route', async ({ request }) => {
  for (const path of [
    '/programacion/',
    '/programacion/2026-10-11/',
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
