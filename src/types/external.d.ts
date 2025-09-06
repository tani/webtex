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
