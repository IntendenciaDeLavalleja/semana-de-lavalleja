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
  await expect(page.locator('.fogones-act')).toHaveCount(17);
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

test('reinitializes every home animation after visiting the interior page', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });

  const expectAnimatedJourney = async () => {
    await expect(page.locator('body')).toHaveClass(/js-motion/);
    await expect(page.locator('body')).toHaveClass(/scroll-story/);
    await expect
      .poll(() =>
        page.evaluate(() => ({
          tickerName: getComputedStyle(document.querySelector<HTMLElement>('.ticker-track')!)
            .animationName,
          tickerState: getComputedStyle(document.querySelector<HTMLElement>('.ticker-track')!)
            .animationPlayState,
          sealName: getComputedStyle(document.querySelector<HTMLElement>('.edition-seal')!)
            .animationName,
        })),
      )
      .toEqual({ tickerName: 'ticker', tickerState: 'running', sealName: 'orbit' });
  };

  await page.goto('/fiestas-del-interior/');
  await expect(page.locator('.interior-hero')).toBeVisible();
  await expect(page.locator('body')).not.toHaveClass(/js-motion/);

  await page.getByRole('link', { name: 'Programación' }).first().click();
  await expect(page).toHaveURL(/\/#programacion$/);
  await expectAnimatedJourney();

  await page.getByRole('button', { name: /Ver jueves 8/ }).click();
  await expect(page).toHaveURL(/#dia-08$/);
  await expect(page.locator('#chapter-count')).toHaveText('02');

  await page.getByRole('link', { name: 'Fiestas del interior' }).first().click();
  await expect(page).toHaveURL(/\/fiestas-del-interior\/$/);
  await page.goBack();
  await expect(page).toHaveURL(/#dia-08$/);
  await expectAnimatedJourney();
  await expect(page.locator('#chapter-count')).toHaveText('02');
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
  await expect(
    page.locator('astro-island[component-export="AgendaTrigger"]').first(),
  ).not.toHaveAttribute('ssr', '');
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
  await expect(noJsPage.locator('.fogones-act')).toHaveCount(17);
  await expect(noJsPage.getByText('DJ Gustavo Olazábal')).toBeVisible();
  await expect(noJsPage.locator('#dia-10').getByText('DJ Emilio Cáceres')).toBeVisible();
  await noJsPage.goto('/#fogones-programacion');
  await expect(noJsPage.locator('#fogones-program-title')).toBeVisible();
  expect(await noJsPage.locator('#fogones').evaluate((section) => section.scrollTop)).toBe(0);
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

test('shows the confirmed parade date, time and location', async ({ page }) => {
  await page.goto('/');
  const parade = page.locator('.parade-card');
  await expect(parade).toContainText('DOMINGO 11 DE OCTUBRE');
  await expect(parade).toContainText('11:00 h');
  await expect(parade).toContainText('Avenida Varela');
  await expect(parade).toContainText('Minas');
  await expect(parade.locator('time')).toHaveAttribute('datetime', '2026-10-11T11:00:00-03:00');
});

test('Fogones program anchor lands below the header on desktop and mobile', async ({ browser }) => {
  for (const viewport of [
    { width: 1905, height: 930 },
    { width: 390, height: 844 },
  ]) {
    const page = await browser.newPage({ viewport });
    await page.goto('/#fogones-programacion', { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    const position = await page.evaluate(() => {
      const target = document.querySelector<HTMLElement>('#fogones-programacion')!;
      const heading = document.querySelector<HTMLElement>('#fogones-program-title')!;
      const section = document.querySelector<HTMLElement>('#fogones')!;
      return {
        headerHeight: Number.parseFloat(
          getComputedStyle(document.documentElement).getPropertyValue('--header-h'),
        ),
        targetTop: target.getBoundingClientRect().top,
        headingBottom: heading.getBoundingClientRect().bottom,
        viewportHeight: innerHeight,
        pageWidth: document.documentElement.scrollWidth,
        viewportWidth: innerWidth,
        sectionScrollTop: section.scrollTop,
      };
    });
    expect(position.sectionScrollTop).toBe(0);
    expect(position.targetTop).toBeGreaterThanOrEqual(position.headerHeight - 2);
    expect(position.targetTop).toBeLessThanOrEqual(position.headerHeight + 22);
    expect(position.headingBottom).toBeLessThan(position.viewportHeight);
    expect(position.pageWidth).toBeLessThanOrEqual(position.viewportWidth);

    await page.locator('.fogones-links a[href="#fogones-programacion"]').click();
    const clickedTop = await page
      .locator('#fogones-programacion')
      .evaluate((element) => element.getBoundingClientRect().top);
    expect(clickedTop).toBeGreaterThanOrEqual(position.headerHeight - 2);
    expect(clickedTop).toBeLessThanOrEqual(position.headerHeight + 22);
    const sectionEntry = await page.evaluate(() => {
      const section = document.querySelector<HTMLElement>('#fogones')!;
      const title = document.querySelector<HTMLElement>('#fogones-title')!;
      document.documentElement.style.scrollBehavior = 'auto';
      window.scrollTo(0, section.offsetTop - 230);
      return {
        sectionTop: section.getBoundingClientRect().top,
        titleTop: title.getBoundingClientRect().top,
        sectionScrollTop: section.scrollTop,
      };
    });
    expect(sectionEntry.sectionScrollTop).toBe(0);
    expect(sectionEntry.titleTop).toBeGreaterThan(sectionEntry.sectionTop + 100);
    await page.close();
  }
});
