// Test setup file for MathJax package
import { beforeAll, afterAll, vi } from 'vitest';

// Mock Worker API for Node.js environment
class MockWorker {
  constructor(scriptURL: string | URL, options?: any) {
    // Mock worker constructor
  }
  
  postMessage(data: any) {
    // Mock postMessage
  }
  
  terminate() {
    // Mock terminate
  }
  
  onmessage: ((event: any) => void) | null = null;
  onerror: ((event: any) => void) | null = null;
}

// Mock unasync functions to work synchronously in tests
vi.mock('unasync', () => ({
  createSyncFn: (asyncFn: any) => {
    // Return a synchronous version that generates mock SVG
    return (math: string, options: any = { display: true }) => {
      // Return a mock SVG for testing
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 50">
        <text x="10" y="30" font-family="serif" font-size="16">${math}</text>
        <style>text { fill: black; }</style>
      </svg>`;
    };
  },
  runAsWorker: (fn: any) => {
    // Return a no-op function to prevent worker execution
    return () => {};
  }
}));

// Mock MathJax modules that are loaded dynamically
vi.mock('mathjax/es5/tex-svg-full.js', () => ({}));
vi.mock('mathjax/es5/adaptors/liteDOM.js', () => ({}));
vi.mock('xyjax/build/xypic.js', () => ({}));

// Mock juice for HTML inlining
vi.mock('juice', () => ({
  default: (html: string) => html // Just return the HTML as-is for testing
}));

// Mock the entire worker module to prevent initialization
vi.mock('../mathjax.worker', () => ({
  default: () => () => {}, // Return a no-op function
  tex2svg: (math: string, options: any = { display: true }) => {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 50">
      <text x="10" y="30" font-family="serif" font-size="16">${math}</text>
      <style>text { fill: black; }</style>
    </svg>`;
  }
}));

// Global test setup
beforeAll(async () => {
  console.log('Setting up MathJax tests...');
  
  // Mock Worker globally
  global.Worker = MockWorker as any;
  
  // Mock MathJax global object
  globalThis.MathJax = {
    loader: {
      source: {},
      require: async (path: string) => ({}),
      load: ['adaptors/liteDOM', '[custom]/xypic'],
      paths: {
        mathjax: 'mathjax/es5',
        custom: 'xyjax/build',
      },
    },
    tex: {
      packages: [
        'base', 'verb', 'upgreek', 'unicode', 'textmacros', 'textcomp', 
        'tagformat', 'setoptions', 'require', 'physics', 'noundefined', 
        'noerrors', 'newcommand', 'mhchem', 'mathtools', 'html', 'gensymb', 
        'extpfeil', 'enclose', 'empheq', 'configmacros', 'colorv2', 'colortbl', 
        'color', 'centernot', 'cases', 'cancel', 'bussproofs', 'braket', 
        'boldsymbol', 'bbox', 'autoload', 'amscd', 'ams', 'action', 'xyjax'
      ],
    },
    svg: {
      fontCache: 'none',
    },
    startup: {
      typeset: false,
      promise: Promise.resolve(),
      adaptor: {
        textContent: (node: any) => 'svg { font-family: serif; }',
        outerHTML: (node: any) => '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 50"><text>mock</text></svg>'
      }
    },
    tex2svg: (math: string, options: any) => ({
      type: 'svg',
      content: `<text>${math}</text>`
    }),
    svgStylesheet: () => ({
      type: 'style',
      content: 'svg { font-family: serif; }'
    })
  };
  
  // Set timeout for MathJax initialization
  process.env.TEST_TIMEOUT = '30000';
});

afterAll(() => {
  // Cleanup after all tests
  console.log('Cleaning up MathJax tests...');
  
  // Restore console
  delete global.Worker;
});

// Mock console for cleaner test output
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

// Override console methods to reduce noise during tests
console.log = (...args: any[]) => {
  // Only log if explicitly testing console output
  if (process.env.VITEST_VERBOSE) {
    originalConsoleLog(...args);
  }
};

console.error = (...args: any[]) => {
  // Always show errors
  originalConsoleError(...args);
};