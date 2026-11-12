// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import { unified } from '@astrojs/markdown-remark';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import searchIndex from './integrations/search-index.mjs';

// https://astro.build/config
export default defineConfig({
  // Your site's production URL — used for canonical links + the sitemap.
  //
  // • Custom/apex domain (recommended): set it here (e.g. 'https://lab.example.edu')
  //   and put that same host in public/CNAME. Do NOT set `base`.
  // • No custom domain (project page at <user>.github.io/<repo>): instead use
  //   site: 'https://<user>.github.io' and base: '/<repo>', and delete public/CNAME.
  site: 'https://example.com',
  markdown: {
    processor: unified({ remarkPlugins: [remarkMath], rehypePlugins: [rehypeKatex] }),
  },

  // Fixture previews/builds never write into the production Pages artifact.
  ...(process.env.TELECOMAI_FIXTURES === '1' ? {
    outDir: './.fixture-dist',
    cacheDir: './.astro-fixtures',
    publicDir: './.fixture-public',
  } : {}),

  vite: {
    plugins: [tailwindcss()]
  },

  integrations: [sitemap(), searchIndex()]
});
