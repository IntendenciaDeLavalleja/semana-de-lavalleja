import { readFile, readdir, stat } from 'node:fs/promises';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = resolve('dist');

describe('static SEO output', () => {
  it('renders every public page and the real sitemap index', async () => {
    const paths = [
      'index.html',
      'programacion/index.html',
      'programacion/2026-10-08/index.html',
      'programacion/2026-10-12/index.html',
      'fiestas-del-interior/index.html',
      '404.html',
      'robots.txt',
      'llms.txt',
      'programacion.md',
      'sitemap-index.xml',
    ];
    await Promise.all(
      paths.map((path) => expect(stat(resolve(root, path))).resolves.toBeDefined()),
    );
  });

  it('keeps all 50 performances in HTML and textual output', async () => {
    const home = await readFile(resolve(root, 'index.html'), 'utf8');
    const markdown = await readFile(resolve(root, 'programacion.md'), 'utf8');
    expect((home.match(/class="act-row"/g) || []).length).toBe(33);
    expect((home.match(/class="fogones-act"/g) || []).length).toBe(17);
    expect(home).not.toContain('component-export="DayLineup"');
    expect((markdown.match(/^- \d{2}:\d{2}/gm) || []).length).toBe(50);
  });

  it('uses distinct canonical URLs and noindex in non-production builds', async () => {
    const home = await readFile(resolve(root, 'index.html'), 'utf8');
    const day = await readFile(resolve(root, 'programacion/2026-10-08/index.html'), 'utf8');
    expect(home).toContain('rel="canonical" href="http://localhost:4321/"');
    expect(day).toContain('rel="canonical" href="http://localhost:4321/programacion/2026-10-08/"');
    expect(day).toContain('name="robots" content="noindex,nofollow"');
  });

  it('redirects the cancelled Wednesday route to the first rescheduled day', async () => {
    const oldDay = await readFile(resolve(root, 'programacion/2026-10-07/index.html'), 'utf8');
    expect(oldDay).toContain('content="0;url=/programacion/2026-10-08/"');
    expect(oldDay).toContain('name="robots" content="noindex"');
    expect(oldDay).toContain('href="http://localhost:4321/programacion/2026-10-08/"');
  });

  it('contains valid JSON-LD and no placeholder domains', async () => {
    const pages = [
      'index.html',
      'programacion/index.html',
      'programacion/2026-10-08/index.html',
      'programacion/2026-10-12/index.html',
      'fiestas-del-interior/index.html',
    ];
    for (const page of pages) {
      const html = await readFile(resolve(root, page), 'utf8');
      const scripts = [
        ...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g),
      ];
      expect(scripts.length).toBeGreaterThan(0);
      scripts.forEach((match) => expect(() => JSON.parse(match[1]!)).not.toThrow());
      expect(html).not.toContain('example.com');
    }
  });

  it('keeps mobile breakpoints compatible with older iPhone Safari', async () => {
    const assets = await readdir(resolve(root, '_astro'));
    const cssFiles = assets.filter((asset) => asset.endsWith('.css'));
    expect(cssFiles.length).toBeGreaterThan(0);
    const css = (
      await Promise.all(cssFiles.map((asset) => readFile(resolve(root, '_astro', asset), 'utf8')))
    ).join('\n');
    expect(css).toMatch(/@media\s*\(max-width:\s*620px\)/);
    expect(css).toMatch(/@media\s*\(max-width:\s*900px\)/);
    expect(css).not.toMatch(/@media[^{}]*\(\s*(?:width|height)\s*[<>]=?/);
  });
});
