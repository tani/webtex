import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['test/**/*.ts', 'test/**/*.js'],
    exclude: [
      '**/node_modules/**', 
      '**/dist/**', 
      '**/coverage/**',
      'test/api/**/*.js',
      'test/api/**/*.mjs',
      'test/api/**/*.html',
      'test/lib/**',
      'test/types/**',
      'test/fixtures/**',
      'test/screenshots/**',
      'test/integration/**'
    ],
    setupFiles: ['test/lib/setup.ts']
  }
});