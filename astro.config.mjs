import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
  output: 'static',
  base: '/resume', // CHANGE THIS to match your exact GitHub repo name
  integrations: [tailwind()]
});
