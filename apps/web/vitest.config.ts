import { defineConfig } from 'vitest/config';
import path from 'path';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./__tests__/setup.ts'],
    include: ['__tests__/**/*.test.{ts,tsx}'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
      '@booking/shared-schemas': path.resolve(__dirname, '../../packages/shared-schemas/src'),
      '@booking/shared-types': path.resolve(__dirname, '../../packages/shared-types/src'),
      '@booking/shared-constants': path.resolve(__dirname, '../../packages/shared-constants/src'),
      '@booking/shared-utils': path.resolve(__dirname, '../../packages/shared-utils/src'),
    },
  },
});
