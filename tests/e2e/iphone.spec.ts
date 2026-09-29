import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { devices, expect, test } from '@playwright/test';

test('keeps the five-day program readable on iPhone WebKit', async ({ browser, browserName }) => {
  test.skip(browserName !== 'webkit', 'This regression targets iPhone Safari.');
  const output = resolve('test-results', 'iphone');
  await mkdir(output, { recursive: true });

  for (const model of ['iPhone 11', 'iPhone 16 Pro Max']) {
    const context = await browser.newContext({ ...devices[model] });
    const page = await context.newPage();
    await page.goto('/#dia-08');
    const active = page.locator('#dia-08');
    await expect(active).not.toHaveAttribute('aria-hidden', 'true');
    await expect(page.locator('.desktop-nav')).toBeHidden();
    await expect(page.locator('.menu-toggle')).toBeVisible();

    const dimensions = await page.evaluate(() => {
      const card = document.querySelector('#dia-08 .lineup-card');
      const name = document.querySelector('#dia-08 .act-name');
      return {
        viewport: innerWidth,
        document: document.documentElement.scrollWidth,
        card: card?.getBoundingClientRect().width ?? 0,
        name: name?.getBoundingClientRect().width ?? 0,
      };
    });
    expect(dimensions.document).toBeLessThanOrEqual(dimensions.viewport + 1);
    expect(dimensions.card).toBeGreaterThan(dimensions.viewport * 0.8);
    expect(dimensions.name).toBeGreaterThan(120);
    await page.screenshot({ path: resolve(output, `${model.replaceAll(' ', '-')}-day-08.png`) });
    await context.close();
  }
});
