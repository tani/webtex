type Generator = Record<string, unknown>;

export class Echo {
	static displayName = "Echo";
	static args: Record<string, unknown[]> = {
		gobbleO: ["H", "o?"],
		echoO: ["H", "o?"],
		echoOGO: ["H", "o?", "g", "o?"],
		echoGOG: ["H", "g", "o?", "g"],
	};

	g: Generator;
	options?: unknown;

	constructor(generator: Generator, options?: unknown) {
		this.g = generator;
		this.options = options;
	}

	gobbleO(): unknown[] {
		return [];
	}

	echoO(o?: unknown): unknown[] {
		return ["-", o, "-"];
	}

	echoOGO(o1?: unknown, g?: unknown, o2?: unknown): unknown[] {
		const result: unknown[] = [];
		if (o1) {
			result.push("-", o1, "-");
		}
		result.push("+", g, "+");
		if (o2) {
			result.push("-", o2, "-");
		}
		return result;
	}

	echoGOG(g1: unknown, o?: unknown, g2?: unknown): unknown[] {
		const result = ["+", g1, "+"];
		if (o) {
			result.push("-", o, "-");
		}
		result.push("+", g2, "+");
		return result;
	}
}
