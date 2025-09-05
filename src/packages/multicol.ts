import type { MulticolGenerator } from "../interfaces";

export class Multicol {
	static displayName = "Multicol";
	static args: Record<string, any[]> = {
		multicols: ["V", "n", "o?", "o?"],
	};

	private g: MulticolGenerator;
	options?: any;

	constructor(generator: MulticolGenerator, options?: any) {
		this.g = generator;
		this.options = options;
	}

	multicols(cols: number, pre?: any): any[] {
		return [pre, this.g.create(this.g.multicols(cols))];
	}
}
