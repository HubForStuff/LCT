import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  site: 'https://bruehstdio.github.io',
  base: '/latamchina-tech',
  integrations: [
    mdx(),
    tailwind()
  ],
  output: 'static',
  outDir: './dist'
});