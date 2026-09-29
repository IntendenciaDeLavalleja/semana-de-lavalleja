import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

for (const path of ['/', '/programacion/', '/fiestas-del-interior/']) {
  test(`${path} has no serious or critical automated accessibility violations`, async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(path);
    await page.evaluate(() => document.fonts.ready);
    const results = await new AxeBuilder({ page }).analyze();
    const blocking = results.violations.filter(
      ({ impact }) => impact === 'serious' || impact === 'critical',
    );
    expect(blocking, JSON.stringify(blocking, null, 2)).toEqual([]);
  });
}

test('internal document links resolve and 200% zoom does not clip the main controls', async ({
  page,
  request,
}) => {
  await page.goto('/');
  const hrefs = await page
    .locator('a[href^="/"]')
    .evaluateAll((links) => [...new Set(links.map((link) => (link as HTMLAnchorElement).href))]);
  for (const href of hrefs) {
    const url = new URL(href);
    url.hash = '';
    const response = await request.get(url.toString());
    expect(response.status(), url.toString()).toBeLessThan(400);
  }

  await page.setViewportSize({ width: 640, height: 800 });
  await page.evaluate(() => {
    document.documentElement.style.zoom = '2';
  });
  await expect(page.getByRole('link', { name: /Semana de Lavalleja, ir al inicio/ })).toBeVisible();
  await expect(page.getByRole('button', { name: /Abrir mis elegidos/ }).first()).toBeVisible();
  await expect(page.getByRole('button', { name: /Abrir menú/ })).toBeVisible();
});
