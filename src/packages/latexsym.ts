type Generator = Record<string, unknown>;

export class Latexsym {
	static displayName = "Latexsym";
	static args: Record<string, unknown[]> = {};

	static symbols = new Map([
		["mho", "\u2127"],
		["Join", "\u2A1D"],
		["Box", "\u25A1"],
		["Diamond", "\u25C7"],
		["leadsto", "\u2933"],
		["sqsubset", "\u228F"],
		["sqsupset", "\u2290"],
		["lhd", "\u22B2"],
		["unlhd", "\u22B4"],
		["rhd", "\u22B3"],
		["unrhd", "\u22B5"],
	]);

	g: Generator;
	options?: unknown;

	constructor(generator: Generator, options?: unknown) {
		this.g = generator;
		this.options = options;
	}
}
