import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
  output: 'static',
  base: '/', // Configured for custom domain zakijariwala.space
  integrations: [tailwind()]
});
