import { describe, it, expect, beforeAll, vi } from 'vitest';

// Import the tex2svg function - we'll test with mocks
let tex2svg: (math: string, options?: { display?: boolean }) => string;

describe('tex2svg functionality', () => {
  beforeAll(async () => {
    // Import the source version with mocks enabled
    try {
      const module = await import('../index.ts');
      tex2svg = module.tex2svg;
      
      // Verify the function is available
      expect(tex2svg).toBeDefined();
      expect(typeof tex2svg).toBe('function');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Failed to import tex2svg:', errorMessage);
      throw error;
    }
  });

  describe('basic LaTeX conversion', () => {
    it('should convert simple fraction to SVG', () => {
      const result = tex2svg('\\frac{a}{b}');
      
      expect(result).toBeDefined();
      expect(result).toContain('<svg');
      expect(result).toContain('</svg>');
      expect(result).toContain('<style>');
      expect(result).toContain('\\frac{a}{b}'); // Mock includes the input
      expect(typeof result).toBe('string');
    });

    it('should convert simple equation to SVG', () => {
      const result = tex2svg('x = y + z');
      
      expect(result).toBeDefined();
      expect(result).toContain('<svg');
      expect(result).toContain('</svg>');
      expect(result).toContain('x = y + z');
      expect(typeof result).toBe('string');
    });

    it('should handle inline math mode', () => {
      const result = tex2svg('E = mc^2', { display: false });
      
      expect(result).toBeDefined();
      expect(result).toContain('<svg');
      expect(result).toContain('</svg>');
      expect(result).toContain('E = mc^2');
      expect(typeof result).toBe('string');
    });

    it('should handle display math mode', () => {
      const result = tex2svg('\\sum_{i=1}^{n} x_i', { display: true });
      
      expect(result).toBeDefined();
      expect(result).toContain('<svg');
      expect(result).toContain('</svg>');
      expect(result).toContain('\\sum_{i=1}^{n} x_i');
      expect(typeof result).toBe('string');
    });
  });

  describe('advanced LaTeX features', () => {
    it('should handle AMS math packages', () => {
      const result = tex2svg('\\begin{align} x &= y \\\\ z &= w \\end{align}');
      
      expect(result).toBeDefined();
      expect(result).toContain('<svg');
      expect(result).toContain('\\begin{align}');
    });

    it('should handle physics package', () => {
      const result = tex2svg('\\hbar \\omega = E');
      
      expect(result).toBeDefined();
      expect(result).toContain('<svg');
      expect(result).toContain('\\hbar');
    });

    it('should handle chemistry notation (mhchem)', () => {
      const result = tex2svg('\\ce{H2O}');
      
      expect(result).toBeDefined();
      expect(result).toContain('<svg');
      expect(result).toContain('\\ce{H2O}');
    });

    it('should handle matrices', () => {
      const result = tex2svg('\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}');
      
      expect(result).toBeDefined();
      expect(result).toContain('<svg');
      expect(result).toContain('pmatrix');
    });
  });

  describe('error handling', () => {
    it('should handle empty input', () => {
      const result = tex2svg('');
      
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
      expect(result).toContain('<svg');
    });

    it('should handle whitespace input', () => {
      const result = tex2svg('   ');
      
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
      expect(result).toContain('<svg');
    });

    it('should gracefully handle invalid LaTeX syntax', () => {
      // This might still produce output, but shouldn't crash
      expect(() => {
        tex2svg('\\invalidcommand{unclosed');
      }).not.toThrow();
    });
  });

  describe('output format validation', () => {
    it('should produce valid SVG with embedded styles', () => {
      const result = tex2svg('\\alpha + \\beta');
      
      // Check for SVG structure
      expect(result).toMatch(/<svg[^>]*>/);
      expect(result).toContain('</svg>');
      
      // Check for embedded styles
      expect(result).toContain('<style>');
      expect(result).toContain('</style>');
      
      // Should be properly inlined (no external dependencies)
      expect(result).not.toContain('href=');
      expect(result).not.toContain('src=');
      
      // Should contain the input
      expect(result).toContain('\\alpha + \\beta');
    });

    it('should produce self-contained SVG', () => {
      const result = tex2svg('\\sum_{i=1}^{\\infty} \\frac{1}{n^2}');
      
      // The SVG should be self-contained with inlined styles
      expect(result).toContain('<style>');
      
      // Should contain viewBox (from mock)
      expect(result).toContain('viewBox');
      
      // Should be a single string (not an object)
      expect(typeof result).toBe('string');
      
      // Should contain the input
      expect(result).toContain('\\sum');
    });
  });

  describe('performance and memory', () => {
    it('should handle multiple conversions efficiently', () => {
      const expressions = [
        'x^2 + y^2 = z^2',
        '\\int_0^\\infty e^{-x} dx',
        '\\lim_{n \\to \\infty} \\frac{1}{n}',
        '\\nabla \\cdot \\vec{F} = \\rho',
        '\\mathbb{R}^n'
      ];

      const results = expressions.map(expr => tex2svg(expr));
      
      // All results should be valid
      results.forEach((result, index) => {
        expect(result, `Expression ${index}: ${expressions[index]}`).toBeDefined();
        expect(result, `Expression ${index}: ${expressions[index]}`).toContain('<svg');
        expect(result, `Expression ${index}: ${expressions[index]}`).toContain(expressions[index]);
      });
    });

    it('should handle large expressions', () => {
      const largeExpression = '\\begin{pmatrix}' +
        Array.from({ length: 5 }, (_, i) => 
          Array.from({ length: 5 }, (_, j) => `a_{${i+1}${j+1}}`).join(' & ')
        ).join(' \\\\ ') + 
        '\\end{pmatrix}';
      
      const result = tex2svg(largeExpression);
      
      expect(result).toBeDefined();
      expect(result).toContain('<svg');
      expect(typeof result).toBe('string');
      expect(result).toContain('pmatrix');
    });
  });
});