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
  },
});
