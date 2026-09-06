import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({
  // Electron loads the built page with file://, so assets must use relative paths.
  base: './',
  plugins: [react()]
});
