import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';

import { getBuildSite } from './src/lib/urls';

const buildSite = getBuildSite();

export default defineConfig({
  output: 'static',
  site: buildSite.url,
  trailingSlash: 'always',
  redirects: {
    '/programacion/2026-10-07/': '/programacion/2026-10-08/',
  },
  integrations: [
    react(),
    sitemap({
      filter: (page) => !page.endsWith('/404/'),
      customPages: buildSite.indexable
        ? [`${buildSite.url}llms.txt`, `${buildSite.url}programacion.md`]
        : [],
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
    build: {
      // Preserve classic media queries for Safari versions that cannot parse
      // the range syntax emitted by the default CSS minifier target.
      cssTarget: 'safari15',
    },
  },
});
