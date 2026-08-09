// @ts-check
import { defineConfig, sharpImageService } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  // For GitHub Pages: set site to your GitHub Pages URL
  // e.g. site: 'https://BenWalker01.github.io'
  image: {
    service: sharpImageService(),
  },
  vite: {
    plugins: [tailwindcss()]
  }
});
