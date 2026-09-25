import { readFile, stat } from 'node:fs/promises';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = resolve('dist');

describe('static SEO output', () => {
  it('renders every public page and the real sitemap index', async () => {
    const paths = [
      'index.html',
      'programacion/index.html',
      'programacion/2026-10-07/index.html',
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

  it('keeps 32 performances in HTML and textual output', async () => {
    const home = await readFile(resolve(root, 'index.html'), 'utf8');
    const markdown = await readFile(resolve(root, 'programacion.md'), 'utf8');
    expect((home.match(/class="act-row"/g) || []).length).toBe(32);
    expect((markdown.match(/^- \d{2}:\d{2}/gm) || []).length).toBe(32);
  });

  it('uses distinct canonical URLs and noindex in non-production builds', async () => {
    const home = await readFile(resolve(root, 'index.html'), 'utf8');
    const day = await readFile(resolve(root, 'programacion/2026-10-07/index.html'), 'utf8');
    expect(home).toContain('rel="canonical" href="http://localhost:4321/"');
    expect(day).toContain('rel="canonical" href="http://localhost:4321/programacion/2026-10-07/"');
    expect(day).toContain('name="robots" content="noindex,nofollow"');
  });

  it('contains valid JSON-LD and no placeholder domains', async () => {
    const pages = ['index.html', 'programacion/index.html', 'programacion/2026-10-07/index.html'];
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
});
