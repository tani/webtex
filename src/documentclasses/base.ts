interface Generator {
	newCounter(name: string, resetBy?: string): void;
	addToReset(counter: string, resetBy: string): void;
	setLength(name: string, value: any): void;
	length(name: string): any;
	Length: any;
	setCounter(name: string, value: number): void;
	counter(name: string): number;
	arabic(value: number): string;
	Roman(value: number): string;
	startsection(
		type: string,
		level: number,
		starred: boolean,
		toc?: any,
		title?: any,
	): any;
	setTitle(title: any): void;
	create(element: any, content: any, className?: string): any;
	createVSpace(length: any): any;
	macro(name: string): any;
	title: any;
	author: any;
	date: any;
	list: any;
}

export class Base {
	static displayName = "Base";
	static args: Record<string, any[]> = {
		part: ["V", "s", "X", "o?", "g"],
		section: ["V", "s", "X", "o?", "g"],
		subsection: ["V", "s", "X", "o?", "g"],
		subsubsection: ["V", "s", "X", "o?", "g"],
		paragraph: ["V", "s", "X", "o?", "g"],
		subparagraph: ["V", "s", "X", "o?", "g"],
		maketitle: ["V"],
		quotation: ["V"],
	};

	protected g: Generator;
	public options: Map<string, any> = new Map();
	protected _title: any = null;
	protected _author: any = null;
	protected _date: any = null;
	protected _thanks: any = null;

	constructor(generator: Generator, options?: any) {
		this.g = generator;
		if (options) {
			this.options = options;
		}

		this.g.newCounter("part");
		this.g.newCounter("section");
		this.g.newCounter("subsection", "section");
		this.g.newCounter("subsubsection", "subsection");
		this.g.newCounter("paragraph", "subsubsection");
		this.g.newCounter("subparagraph", "paragraph");
		this.g.newCounter("figure");
		this.g.newCounter("table");
		this.g.setLength("paperheight", new this.g.Length(11, "in"));
		this.g.setLength("paperwidth", new this.g.Length(8.5, "in"));
		this.g.setLength("@@size", new this.g.Length(10, "pt"));

		this.options.forEach((_v, k) => {
			let tmp: any, value: any;
			switch (k) {
				case "oneside":
					break;
				case "twoside":
					break;
				case "onecolumn":
					break;
				case "twocolumn":
					break;
				case "titlepage":
					break;
				case "notitlepage":
					break;
				case "fleqn":
					break;
				case "leqno":
					break;
				case "a4paper":
					this.g.setLength("paperheight", new this.g.Length(297, "mm"));
					this.g.setLength("paperwidth", new this.g.Length(210, "mm"));
					break;
				case "a5paper":
					this.g.setLength("paperheight", new this.g.Length(210, "mm"));
					this.g.setLength("paperwidth", new this.g.Length(148, "mm"));
					break;
				case "b5paper":
					this.g.setLength("paperheight", new this.g.Length(250, "mm"));
					this.g.setLength("paperwidth", new this.g.Length(176, "mm"));
					break;
				case "letterpaper":
					this.g.setLength("paperheight", new this.g.Length(11, "in"));
					this.g.setLength("paperwidth", new this.g.Length(8.5, "in"));
					break;
				case "legalpaper":
					this.g.setLength("paperheight", new this.g.Length(14, "in"));
					this.g.setLength("paperwidth", new this.g.Length(8.5, "in"));
					break;
				case "executivepaper":
					this.g.setLength("paperheight", new this.g.Length(10.5, "in"));
					this.g.setLength("paperwidth", new this.g.Length(7.25, "in"));
					break;
				case "landscape":
					tmp = this.g.length("paperheight");
					this.g.setLength("paperheight", this.g.length("paperwidth"));
					this.g.setLength("paperwidth", tmp);
					break;
				default:
					value = parseFloat(k);
					if (
						!Number.isNaN(value) &&
						k.endsWith("pt") &&
						String(value) === k.substring(0, k.length - 2)
					) {
						this.g.setLength("@@size", new this.g.Length(value, "pt"));
					}
			}
		});

		const pt345 = new this.g.Length(345, "pt");
		const inch = new this.g.Length(1, "in");
		let textwidth = this.g.length("paperwidth").sub(inch.mul(2));
		if (textwidth.cmp(pt345) === 1) {
			textwidth = pt345;
		}
		this.g.setLength("textwidth", textwidth);
		this.g.setLength("marginparsep", new this.g.Length(11, "pt"));
		this.g.setLength("marginparpush", new this.g.Length(5, "pt"));
		const margins = this.g.length("paperwidth").sub(this.g.length("textwidth"));
		const oddsidemargin = margins.mul(0.5).sub(inch);
		let marginparwidth = margins
			.mul(0.5)
			.sub(this.g.length("marginparsep"))
			.sub(inch.mul(0.8));
		if (marginparwidth.cmp(inch.mul(2)) === 1) {
			marginparwidth = inch.mul(2);
		}
		this.g.setLength("oddsidemargin", oddsidemargin);
		this.g.setLength("marginparwidth", marginparwidth);
	}

	contentsname(): string[] {
		return ["Contents"];
	}

	listfigurename(): string[] {
		return ["List of Figures"];
	}

	listtablename(): string[] {
		return ["List of Tables"];
	}

	partname(): string[] {
		return ["Part"];
	}

	figurename(): string[] {
		return ["Figure"];
	}

	tablename(): string[] {
		return ["Table"];
	}

	appendixname(): string[] {
		return ["Appendix"];
	}

	indexname(): string[] {
		return ["Index"];
	}

	part(s: boolean, toc?: any, ttl?: any): any[] {
		return [this.g.startsection("part", 0, s, toc, ttl)];
	}

	section(s: boolean, toc?: any, ttl?: any): any[] {
		return [this.g.startsection("section", 1, s, toc, ttl)];
	}

	subsection(s: boolean, toc?: any, ttl?: any): any[] {
		return [this.g.startsection("subsection", 2, s, toc, ttl)];
	}

	subsubsection(s: boolean, toc?: any, ttl?: any): any[] {
		return [this.g.startsection("subsubsection", 3, s, toc, ttl)];
	}

	paragraph(s: boolean, toc?: any, ttl?: any): any[] {
		return [this.g.startsection("paragraph", 4, s, toc, ttl)];
	}

	subparagraph(s: boolean, toc?: any, ttl?: any): any[] {
		return [this.g.startsection("subparagraph", 5, s, toc, ttl)];
	}

	thepart(): string[] {
		return [this.g.Roman(this.g.counter("part"))];
	}

	thesection(): string[] {
		return [this.g.arabic(this.g.counter("section"))];
	}

	thesubsection(): string[] {
		return this.thesection().concat(
			".",
			this.g.arabic(this.g.counter("subsection")),
		);
	}

	thesubsubsection(): string[] {
		return this.thesubsection().concat(
			".",
			this.g.arabic(this.g.counter("subsubsection")),
		);
	}

	theparagraph(): string[] {
		return this.thesubsubsection().concat(
			".",
			this.g.arabic(this.g.counter("paragraph")),
		);
	}

	thesubparagraph(): string[] {
		return this.theparagraph().concat(
			".",
			this.g.arabic(this.g.counter("subparagraph")),
		);
	}

	maketitle(): any[] {
		this.g.setTitle(this._title);
		const title = this.g.create(this.g.title, this._title);
		const author = this.g.create(this.g.author, this._author);
		const date = this.g.create(
			this.g.date,
			this._date ? this._date : this.g.macro("today"),
		);
		const maketitle = this.g.create(
			this.g.list,
			[
				this.g.createVSpace(new this.g.Length(2, "em")),
				title,
				this.g.createVSpace(new this.g.Length(1.5, "em")),
				author,
				this.g.createVSpace(new this.g.Length(1, "em")),
				date,
				this.g.createVSpace(new this.g.Length(1.5, "em")),
			],
			"center",
		);

		this.g.setCounter("footnote", 0);
		this._title = null;
		this._author = null;
		this._date = null;
		this._thanks = null;

		// Clear methods after use
		(this as any).title =
			(this as any).author =
			(this as any).date =
			(this as any).thanks =
			(this as any).and =
			(this as any).maketitle =
				() => {};

		return [maketitle];
	}

	// Methods that might be inherited and called by other document classes
	quotation(): any[] {
		(this.g as any).startlist();
		return [(this.g as any).create((this.g as any).quotation)];
	}
	
	endquotation(): void {
		(this.g as any).endlist();
	}
}
