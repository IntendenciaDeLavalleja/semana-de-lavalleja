import type { APIRoute } from 'astro';
import { getBuildSite } from '../lib/urls';

export const prerender = true;

export const GET: APIRoute = () => {
  const site = getBuildSite();
  const lines = ['User-agent: *', 'Allow: /'];
  if (site.indexable) lines.push(`Sitemap: ${new URL('sitemap-index.xml', site.url)}`);
  return new Response(`${lines.join('\n')}\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
