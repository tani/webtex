import he from "he";

import type { StixGenerator } from "../interfaces";

export class Stix {
	static displayName = "Stix";
	static args: Record<string, any[]> = {};

	static symbols = new Map([["checkmark", he.decode("&check;")]]);

	g: StixGenerator;
	options?: any;

	constructor(generator: StixGenerator, options?: any) {
		this.g = generator;
		this.options = options;

		generator.KaTeX.__defineSymbol(
			"math",
			"main",
			"textord",
			"\u2664",
			"\\varspadesuit",
			true,
		);
		generator.KaTeX.__defineSymbol(
			"math",
			"main",
			"textord",
			"\u2665",
			"\\varheartsuit",
			true,
		);
		generator.KaTeX.__defineSymbol(
			"math",
			"main",
			"textord",
			"\u2666",
			"\\vardiamondsuit",
			true,
		);
		generator.KaTeX.__defineSymbol(
			"math",
			"main",
			"textord",
			"\u2667",
			"\\varclubsuit",
			true,
		);
	}
}
