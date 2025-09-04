interface Generator {
	create(element: any): any;
	multicols(cols: number): any;
}

export class Multicol {
	static displayName = "Multicol";
	static args: Record<string, any[]> = {
		multicols: ["V", "n", "o?", "o?"],
	};

	private g: Generator;
	options?: any;

	constructor(generator: Generator, options?: any) {
		this.g = generator;
		this.options = options;
	}

	multicols(cols: number, pre?: any): any[] {
		return [pre, this.g.create(this.g.multicols(cols))];
	}
}
