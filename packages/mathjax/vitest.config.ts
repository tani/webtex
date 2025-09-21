import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Test environment configuration - use happy-dom for better web API support
    environment: 'happy-dom',
    
    // Include test files
    include: ['test/**/*.{test,spec}.{js,ts}'],
    
    // Globals for easier testing
    globals: true,
    
    // Timeout for tests (MathJax initialization can be slow)
    testTimeout: 30000,
    
    // Setup files
    setupFiles: ['./test/setup.ts'],
    
    // Coverage configuration
    coverage: {
      provider: 'v8',
      include: ['index.ts', '*.worker.ts'],
      exclude: [
        'node_modules/**',
        'dist/**',
        'test/**',
        'build.ts',
        'vitest.config.ts'
      ],
      reporter: ['text', 'html', 'json']
    },
    
    // Pool options for better worker testing
    pool: 'forks',
    
    // Disable isolate to help with worker testing
    isolate: false
  },
  
  // Ensure TypeScript files are handled properly
  esbuild: {
    target: 'node18'
  }
});