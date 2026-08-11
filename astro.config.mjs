// @ts-check
import { defineConfig, sharpImageService } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://ben-walker.uk',
  image: {
    service: sharpImageService(),
  },
  vite: {
    plugins: [tailwindcss()]
  }
});
