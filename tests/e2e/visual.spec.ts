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

test('captures equivalent reference and migrated sections at required viewports', async ({
  browser,
  browserName,
}) => {
  test.skip(browserName !== 'chromium', 'Visual capture is recorded once with Chromium.');
  const output = resolve('test-results', 'visual-comparison');
  await mkdir(output, { recursive: true });

  for (const viewport of viewports) {
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
      reducedMotion: 'reduce',
    });
    const reference = await context.newPage();
    const migrated = await context.newPage();
    await reference.goto('http://127.0.0.1:4173/Semana-de-Lavalleja-53.html');
    await migrated.goto('http://127.0.0.1:4321/');
    const referenceHero = await reference.screenshot({
      path: resolve(output, `reference-${viewport.name}-hero.png`),
    });
    const migratedHero = await migrated.screenshot({
      path: resolve(output, `migrated-${viewport.name}-hero.png`),
    });
    expect(referenceHero.byteLength).toBeGreaterThan(10_000);
    expect(migratedHero.byteLength).toBeGreaterThan(10_000);

    for (const anchor of ['programacion', 'dia-10', 'pueblos', 'fogones', 'visita']) {
      await reference.locator(`#${anchor}`).scrollIntoViewIfNeeded();
      await migrated.locator(`#${anchor}`).scrollIntoViewIfNeeded();
      await reference.screenshot({
        path: resolve(output, `reference-${viewport.name}-${anchor}.png`),
      });
      await migrated.screenshot({
        path: resolve(output, `migrated-${viewport.name}-${anchor}.png`),
      });
    }
    await context.close();
  }
});
