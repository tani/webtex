declare module "hyphenation.en-us" {
	const patterns: unknown;
	export default patterns;
}

declare module "hypher" {
	export default class Hypher {
		constructor(patterns: unknown);
		hyphenate(word: string): string[];
		hyphenateText(text: string): string;
		patterns: unknown;
	}
}

declare module "mathjax" {
	interface MathJaxAPI {
		tex2svg(math: string, options?: unknown): unknown;
		startup: {
			adaptor: { outerHTML(node: unknown): string };
			document: { outputJax: { styleSheet(): Element | null } };
		};
	}
	const mathjax: {
		init(options?: unknown): Promise<MathJaxAPI>;
	};
	export default mathjax;
}
