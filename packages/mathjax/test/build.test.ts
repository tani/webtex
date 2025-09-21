import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('Build Integration Tests', () => {
  const distDir = 'dist';
  
  describe('build outputs', () => {
    it('should create browser bundle', () => {
      const browserBundle = join(distDir, 'browser', 'index.js');
      expect(existsSync(browserBundle)).toBe(true);
      
      const content = readFileSync(browserBundle, 'utf8');
      expect(content).toContain('tex2svg');
      expect(content.length).toBeGreaterThan(1000); // Should be a substantial bundle
    });

    it('should create node bundle', () => {
      const nodeBundle = join(distDir, 'node', 'index.js');
      expect(existsSync(nodeBundle)).toBe(true);
      
      const content = readFileSync(nodeBundle, 'utf8');
      expect(content).toContain('tex2svg');
      expect(content.length).toBeGreaterThan(1000); // Should be a substantial bundle
    });

    it('should create TypeScript declarations', () => {
      const declarations = join(distDir, 'types', 'index.d.ts');
      expect(existsSync(declarations)).toBe(true);
      
      const content = readFileSync(declarations, 'utf8');
      expect(content).toContain('tex2svg');
    });

    it('should create sourcemaps', () => {
      expect(existsSync(join(distDir, 'browser', 'index.js.map'))).toBe(true);
      expect(existsSync(join(distDir, 'node', 'index.js.map'))).toBe(true);
    });

    it('should create proper package.json files', () => {
      const browserPkg = join(distDir, 'browser', 'package.json');
      const nodePkg = join(distDir, 'node', 'package.json');
      
      expect(existsSync(browserPkg)).toBe(true);
      expect(existsSync(nodePkg)).toBe(true);
      
      const browserContent = JSON.parse(readFileSync(browserPkg, 'utf8'));
      const nodeContent = JSON.parse(readFileSync(nodePkg, 'utf8'));
      
      expect(browserContent.type).toBe('module');
      expect(nodeContent.type).toBe('module');
      expect(browserContent.main).toBe('./index.js');
      expect(nodeContent.main).toBe('./index.js');
    });
  });

  describe('bundle content validation', () => {
    it('should inline workers in browser bundle', () => {
      const browserBundle = join(distDir, 'browser', 'index.js');
      const content = readFileSync(browserBundle, 'utf8');
      
      // Should contain inlined worker code
      expect(content).toContain('MathJax');
      expect(content).toContain('tex2svg');
      
      // Should be minified (no excessive whitespace)
      const lines = content.split('\n');
      const avgLineLength = content.length / lines.length;
      expect(avgLineLength).toBeGreaterThan(100); // Minified code has long lines
    });

    it('should inline workers in node bundle', () => {
      const nodeBundle = join(distDir, 'node', 'index.js');
      const content = readFileSync(nodeBundle, 'utf8');
      
      // Should contain inlined worker code
      expect(content).toContain('MathJax');
      expect(content).toContain('tex2svg');
      
      // Should have Node.js require helper
      expect(content).toContain('createRequire');
    });

    it('should have proper exports in TypeScript declarations', () => {
      const declarations = join(distDir, 'types', 'index.d.ts');
      const content = readFileSync(declarations, 'utf8');
      
      expect(content).toContain('export');
      expect(content).toContain('tex2svg');
    });
  });

  describe('package exports', () => {
    it('should have correct main package.json exports', () => {
      const mainPkg = JSON.parse(readFileSync('package.json', 'utf8'));
      
      expect(mainPkg.main).toBe('./dist/node/index.js');
      expect(mainPkg.browser).toBe('./dist/browser/index.js');
      expect(mainPkg.types).toBe('./dist/types/index.d.ts');
      expect(mainPkg.exports).toBeDefined();
      expect(mainPkg.exports['.']).toBeDefined();
      expect(mainPkg.exports['.'].browser).toBe('./dist/browser/index.js');
      expect(mainPkg.exports['.'].node).toBe('./dist/node/index.js');
    });
  });
});