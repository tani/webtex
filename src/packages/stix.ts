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
	}
}
