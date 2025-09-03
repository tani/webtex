import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['test/**/*.ts', 'test/**/*.js'],
    exclude: [
      '**/node_modules/**', 
      '**/dist/**', 
      '**/coverage/**',
      'test/api/node.js',
      'test/api/node.mjs', 
      'test/api/CustomMacros.js',
      'test/api/dom.js',
      'test/lib/**',
      'test/types/**'
    ],
    setupFiles: ['test/lib/setup.ts']
  }
});