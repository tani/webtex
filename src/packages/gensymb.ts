import he from "he";

type Generator = Record<string, unknown>;

export class Gensymb {
	static displayName = "Gensymb";
	static args: Record<string, any[]> = {};

	static symbols = new Map([
		["degree", he.decode("&deg;")],
		["celsius", "\u2103"],
		["perthousand", he.decode("&permil;")],
		["ohm", "\u2126"],
		["micro", he.decode("&mu;")],
	]);

	g: Generator;
	options?: any;

	constructor(generator: Generator, options?: any) {
		this.g = generator;
		this.options = options;
	}
}
