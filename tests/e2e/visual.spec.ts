import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { expect, test } from '@playwright/test';

const viewports = [
  { name: '360', width: 360, height: 800 },
  { name: '390', width: 390, height: 844 },
  { name: '768', width: 768, height: 1024 },
  { name: '1024', width: 1024, height: 768 },
  { name: '1440', width: 1440, height: 900 },
  { name: 'low', width: 390, height: 650 },
  { name: 'landscape', width: 844, height: 390 },
];

test('captures site sections at required viewports', async ({ browser, browserName }) => {
  test.skip(browserName !== 'chromium', 'Visual capture is recorded once with Chromium.');
  const output = resolve('test-results', 'visual-comparison');
  await mkdir(output, { recursive: true });

  for (const viewport of viewports) {
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
      reducedMotion: 'reduce',
    });
    const site = await context.newPage();
    await site.goto('http://127.0.0.1:4322/');
    const hero = await site.screenshot({
      path: resolve(output, `site-${viewport.name}-hero.png`),
    });
    expect(hero.byteLength).toBeGreaterThan(10_000);

    for (const anchor of [
      'programacion',
      'dia-07',
      'dia-08',
      'dia-09',
      'dia-10',
      'dia-11',
      'pueblos',
      'fogones',
      'fogones-programacion',
      'visita',
    ]) {
      await site.locator(`#${anchor}`).scrollIntoViewIfNeeded();
      await site.screenshot({
        path: resolve(output, `site-${viewport.name}-${anchor}.png`),
      });
    }
    await site.locator('.site-footer').screenshot({
      path: resolve(output, `site-${viewport.name}-footer.png`),
    });
    await context.close();
  }
});
