import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import tailwind from '@astrojs/tailwind';
import keystatic from '@keystatic/astro';

export default defineConfig({
  site: 'https://bruehstdio.github.io',
  base: '/inovacao-hub',
  integrations: [
    mdx(),
    tailwind(),
    keystatic()
  ],
  output: 'hybrid'
});