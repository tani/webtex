import { describe, it, expect, beforeAll } from 'vitest';

// Test the worker functionality directly
describe('MathJax Worker Integration', () => {
  let workerModule: any;

  beforeAll(async () => {
    try {
      // Import the worker module to test its exports (mocked version)
      workerModule = await import('../mathjax.worker');
    } catch (error) {
      console.error('Failed to import worker module:', error);
      throw error;
    }
  });

  describe('worker module exports', () => {
    it('should export tex2svg function', () => {
      expect(workerModule).toBeDefined();
      expect(workerModule.tex2svg).toBeDefined();
      expect(typeof workerModule.tex2svg).toBe('function');
    });
  });

  describe('worker tex2svg function', () => {
    it('should handle basic LaTeX conversion', () => {
      const result = workerModule.tex2svg('\\frac{a}{b}');
      
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
      expect(result).toContain('<svg');
      expect(result).toContain('\\frac{a}{b}');
    });

    it('should handle display mode parameter', () => {
      const result = workerModule.tex2svg('x = y', { display: true });
      
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
      expect(result).toContain('<svg');
      expect(result).toContain('x = y');
    });

    it('should handle inline mode parameter', () => {
      const result = workerModule.tex2svg('x = y', { display: false });
      
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
      expect(result).toContain('<svg');
      expect(result).toContain('x = y');
    });
  });

  describe('MathJax configuration', () => {
    it('should have proper MathJax global configuration', () => {
      // Check that the worker sets up MathJax config
      expect(globalThis.MathJax).toBeDefined();
      expect(globalThis.MathJax.tex).toBeDefined();
      expect(globalThis.MathJax.tex.packages).toBeDefined();
      expect(globalThis.MathJax.svg).toBeDefined();
      expect(globalThis.MathJax.loader).toBeDefined();
    });

    it('should include expected LaTeX packages', () => {
      const packages = globalThis.MathJax.tex.packages;
      
      // Check for essential packages
      expect(packages).toContain('base');
      expect(packages).toContain('ams');
      expect(packages).toContain('physics');
      expect(packages).toContain('mhchem');
      expect(packages).toContain('mathtools');
      expect(packages).toContain('color');
      expect(packages).toContain('autoload');
      expect(packages).toContain('xyjax');
    });

    it('should have proper SVG configuration', () => {
      expect(globalThis.MathJax.svg.fontCache).toBe('none');
    });

    it('should have proper startup configuration', () => {
      expect(globalThis.MathJax.startup.typeset).toBe(false);
    });

    it('should have loader configuration for external packages', () => {
      const loader = globalThis.MathJax.loader;
      
      expect(loader.load).toContain('adaptors/liteDOM');
      expect(loader.load).toContain('[custom]/xypic');
      expect(loader.paths).toHaveProperty('mathjax');
      expect(loader.paths).toHaveProperty('custom');
    });
  });

  describe('error handling in worker context', () => {
    it('should handle tex2svg calls without throwing', () => {
      // With mocks, this should work fine
      expect(() => {
        const result = workerModule.tex2svg('x = y');
        expect(result).toBeDefined();
      }).not.toThrow();
    });

    it('should return consistent mock output', () => {
      const result1 = workerModule.tex2svg('formula1');
      const result2 = workerModule.tex2svg('formula2');
      
      expect(result1).toContain('<svg');
      expect(result2).toContain('<svg');
      expect(result1).toContain('formula1');
      expect(result2).toContain('formula2');
    });
  });
});