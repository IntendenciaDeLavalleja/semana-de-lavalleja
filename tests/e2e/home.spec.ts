import { expect, test } from '@playwright/test';

test('renders the whole editorial program and changes all five days in both directions', async ({
  page,
}) => {
  const consoleErrors: string[] = [];
  const failedResources: string[] = [];
  page.on('console', (message) => message.type() === 'error' && consoleErrors.push(message.text()));
  page.on(
    'response',
    (response) =>
      response.status() >= 400 && failedResources.push(`${response.status()} ${response.url()}`),
  );

  await page.goto('/');
  await expect(page.locator('.act-row')).toHaveCount(32);
  for (const [day, label] of [
    ['08', 'jueves 8'],
    ['09', 'viernes 9'],
    ['10', 'sábado 10'],
    ['11', 'domingo 11'],
    ['07', 'miércoles 7'],
  ]) {
    await page.getByRole('button', { name: new RegExp(`Ver ${label}`) }).click();
    await expect(page).toHaveURL(new RegExp(`#dia-${day}$`));
  }
  expect(consoleErrors).toEqual([]);
  expect(failedResources).toEqual([]);
});

test('opens direct hashes and day pages, then returns to the same journey chapter', async ({
  page,
}) => {
  await page.goto('/#dia-10');
  await expect(page).toHaveURL(/#dia-10$/);
  await expect(page.locator('#dia-10')).not.toHaveAttribute('aria-hidden', 'true');
  await page.goto('/programacion/2026-10-10/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Sábado 10');
  await page.getByRole('link', { name: /Volver a esta jornada/ }).click();
  await expect(page).toHaveURL(/#dia-10$/);
});

test('synchronizes favorites between cards, navbar, dialog, reload and two tabs', async ({
  page,
  context,
}) => {
  await page.goto('/');
  const favorite = page.getByRole('button', { name: /Agregar Raúl Jaimés/ });
  await favorite.click();
  await expect(page.locator('.my-lineup .favorites-count')).toHaveText('1');

  await page.getByRole('button', { name: 'Abrir mis elegidos' }).first().click();
  await expect(page.getByRole('dialog')).toContainText('Raúl Jaimés');
  await page.getByRole('button', { name: 'Cerrar grilla' }).click();
  await page.reload();
  await expect(page.locator('.my-lineup .favorites-count')).toHaveText('1');

  const second = await context.newPage();
  await second.goto('/');
  await expect(second.locator('.my-lineup .favorites-count')).toHaveText('1');
  await page.getByRole('button', { name: /Quitar Raúl Jaimés/ }).click();
  await expect(second.locator('.my-lineup .favorites-count')).toHaveText('0');
});

test('keeps an independent browser context independent', async ({ browser }) => {
  const first = await browser.newContext();
  const second = await browser.newContext();
  const pageA = await first.newPage();
  const pageB = await second.newPage();
  await pageA.goto('/');
  await pageB.goto('/');
  await pageA.getByRole('button', { name: /Agregar Raúl Jaimés/ }).click();
  await expect(pageA.locator('.my-lineup .favorites-count')).toHaveText('1');
  await expect(pageB.locator('.my-lineup .favorites-count')).toHaveText('0');
  await first.close();
  await second.close();
});

test('exports, prints and clears favorites with an accessible confirmation', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /Agregar Abel Pintos/ }).click();
  await page.getByRole('button', { name: 'Abrir mis elegidos' }).first().click();
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: /Descargar calendario/ }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toContain('mis-elegidos.ics');

  await page.evaluate(() => {
    (window as typeof window & { printCalled?: boolean }).print = () => {
      (window as typeof window & { printCalled?: boolean }).printCalled = true;
    };
  });
  await page.getByRole('button', { name: /Imprimir grilla/ }).click();
  expect(
    await page.evaluate(() => (window as typeof window & { printCalled?: boolean }).printCalled),
  ).toBe(true);

  await page.getByRole('button', { name: 'Vaciar mi grilla' }).click();
  await expect(page.getByRole('group', { name: 'Confirmar vaciado de la grilla' })).toBeVisible();
  await page.getByRole('button', { name: 'Sí, vaciar' }).click();
  await expect(page.getByText('Tu grilla empieza acá.')).toBeVisible();
});

test('keeps the whole program available without JavaScript and with reduced motion', async ({
  browser,
}) => {
  const noJs = await browser.newContext({ javaScriptEnabled: false });
  const noJsPage = await noJs.newPage();
  await noJsPage.goto('/');
  await expect(noJsPage.locator('.act-row')).toHaveCount(32);
  await expect(noJsPage.locator('#dia-10').getByText('DJ Emilio Cáceres')).toBeVisible();
  await noJs.close();

  const reduced = await browser.newContext({ reducedMotion: 'reduce' });
  const reducedPage = await reduced.newPage();
  await reducedPage.goto('/');
  await expect(reducedPage.locator('body')).toHaveClass(/is-static/);
  await expect(reducedPage.locator('.day-scene')).toHaveCount(5);
  await reduced.close();
});

test('mobile menu exposes navigation and both social networks', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Abrir menú' }).click();
  const menu = page.locator('#mobile-nav');
  await expect(menu).toBeVisible();
  await expect(menu.getByRole('link', { name: /Instagram/ })).toHaveAttribute(
    'href',
    'https://www.instagram.com/semanadelavalleja/',
  );
  await expect(menu.getByRole('link', { name: /Facebook/ })).toHaveAttribute(
    'href',
    /facebook\.com/,
  );
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Abrir menú' })).toBeFocused();
});
