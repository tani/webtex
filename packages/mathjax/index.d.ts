export interface Tex2SvgOptions {
  display?: boolean;
}

export interface Tex2SvgFunction {
  (math: string, options?: Tex2SvgOptions): string;
  [Symbol.dispose](): void;
}

export declare const tex2svg: Tex2SvgFunction;
