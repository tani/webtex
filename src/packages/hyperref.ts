interface Generator {
	create(element: any, content: any): any;
	link(url?: string): any;
	createText(text: string): any;
}

export class Hyperref {
	static displayName = "Hyperref";
	static args: Record<string, any[]> = {
		href: ["H", "o?", "u", "g"],
		url: ["H", "u"],
		nolinkurl: ["H", "u"],
	};

	private g: Generator;
	options?: any;

	constructor(generator: Generator, options?: any) {
		this.g = generator;
		this.options = options;
	}

	href(_opts: any, url: string, txt: any): any[] {
		return [this.g.create(this.g.link(url), txt)];
	}

	url(url: string): any[] {
		return [this.g.create(this.g.link(url), this.g.createText(url))];
	}

	nolinkurl(url: string): any[] {
		return [this.g.create(this.g.link(), this.g.createText(url))];
	}
}
