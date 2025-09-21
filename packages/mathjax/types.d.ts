// Type declarations for external modules

declare module 'mathjax/es5/tex-svg-full.js' {
  const mathjax: any;
  export default mathjax;
}

declare module 'mathjax/es5/adaptors/liteDOM.js' {
  const liteDOM: any;
  export default liteDOM;
}

declare module 'xyjax/build/xypic.js' {
  const xypic: any;
  export default xypic;
}

declare module 'juice' {
  function juice(html: string, options?: any): string;
  export default juice;
}

declare module 'unasync' {
  export function createSyncFn(asyncFn: any): any;
  export function runAsWorker(fn: any): any;
}