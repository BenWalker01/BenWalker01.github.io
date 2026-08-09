// @ts-check
import { defineConfig, sharpImageService } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://benwalker01.github.io',
  image: {
    service: sharpImageService(),
  },
  vite: {
    plugins: [tailwindcss()]
  }
});
