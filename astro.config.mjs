// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  // For GitHub Pages: set site to your GitHub Pages URL
  // e.g. site: 'https://benwalker.github.io'
  // If deploying to a sub-path repo (not username.github.io), also set:
  // base: '/repo-name'
  vite: {
    plugins: [tailwindcss()]
  }
});
