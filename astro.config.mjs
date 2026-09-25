// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  output: 'static',
  compressHTML: true,
  trailingSlash: 'never',
  vite: {
    plugins: [tailwindcss()],
  },
  build: {
    inlineStylesheets: 'always',
  },
});