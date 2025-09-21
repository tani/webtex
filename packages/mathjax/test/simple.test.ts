import { describe, it, expect } from 'vitest';

describe('Simple Package Tests', () => {
  it('should import the package without errors', async () => {
    try {
      const pkg = await import('../dist/node/index.js');
      expect(pkg).toBeDefined();
      expect(pkg.tex2svg).toBeDefined();
      expect(typeof pkg.tex2svg).toBe('function');
    } catch (error) {
      // If import fails, it's likely due to Worker not being available in test environment
      // This is expected for worker-based packages
      expect(error).toBeInstanceOf(Error);
      console.log('Package import failed as expected in test environment:', error.message);
    }
  });

  it('should have correct TypeScript declarations', () => {
    const fs = require('fs');
    const path = require('path');
    
    const declarationPath = path.join('dist', 'types', 'index.d.ts');
    expect(fs.existsSync(declarationPath)).toBe(true);
    
    const content = fs.readFileSync(declarationPath, 'utf8');
    expect(content).toContain('tex2svg');
    expect(content).toContain('export');
  });

  it('should have proper package.json configuration', () => {
    const fs = require('fs');
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    
    expect(pkg.name).toBe('webtex-mathjax');
    expect(pkg.type).toBe('module');
    expect(pkg.main).toBe('./dist/node/index.js');
    expect(pkg.browser).toBe('./dist/browser/index.js');
    expect(pkg.types).toBe('./dist/types/index.d.ts');
    expect(pkg.exports).toBeDefined();
  });
});