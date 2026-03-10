import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  site: 'https://bruehstdio.github.io',
  base: '/inovacao-hub',
  integrations: [
    mdx(),
    tailwind()
  ],
  output: 'static',
  outDir: './dist'
});