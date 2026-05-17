import { defineConfig } from 'vite';

export default defineConfig({
  root: 'src',
  publicDir: '../public',
  base: '/pixel-parker/',
  build: {
    outDir: '../dist',
    emptyOutDir: true
  }
});

