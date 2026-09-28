import { defineConfig } from 'astro/config';

// Static output only. Dynamic routes (contact, résumé, admin) live in the Worker.
export default defineConfig({
  site: 'https://zakijariwala.space',
  srcDir: './site',
  publicDir: './site/public',
  outDir: './dist',
  build: { format: 'directory' },
  trailingSlash: 'ignore',
});
