import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

// CLOUDFLARE PAGES — no base path needed
export default defineConfig({
  output: 'static',
  base: '/',
  integrations: [tailwind()]
});
