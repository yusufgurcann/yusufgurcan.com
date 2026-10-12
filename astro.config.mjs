// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { loadEnv } from 'vite';

/**
 * The site's public address. Used for canonical / hreflang / Open Graph URLs
 * and printed on the CV. Override with PUBLIC_SITE_URL in `.env` if it changes.
 */
const DEFAULT_SITE_URL = 'https://yusufgurcan.com';
const { PUBLIC_SITE_URL } = loadEnv(process.env['NODE_ENV'] ?? 'production', process.cwd(), '');

export default defineConfig({
  site: PUBLIC_SITE_URL || DEFAULT_SITE_URL,
  integrations: [
    // sitemap-index.xml for Google Search Console; CV pages are print sources, not content.
    sitemap({
      filter: (page) => !/\/cv\/?$/.test(page),
      i18n: { defaultLocale: 'tr', locales: { tr: 'tr-TR', en: 'en-US' } },
    }),
  ],
  trailingSlash: 'ignore',
  i18n: {
    locales: ['tr', 'en'],
    defaultLocale: 'tr',
    routing: { prefixDefaultLocale: false },
  },
  build: { inlineStylesheets: 'auto' },
  // Keep page scripts as separate files in dist/ instead of inlining them into the HTML.
  vite: { build: { assetsInlineLimit: 0 } },
  // Hide Astro's floating developer toolbar in `npm run dev`.
  devToolbar: { enabled: false },
});
