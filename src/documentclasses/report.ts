import { Base } from "./base";

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
	Alph(value: number): string;
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
	_toc: any;
	setFontSize(size: string): void;
	enterGroup(): void;
	exitGroup(): void;
	setFontWeight(weight: string): void;
}

export class Report extends Base {
	static displayName = "Report";
	static css = "css/book.css";
	static args = {
		...Base.args,
		part: ["V", "s", "X", "o?", "g"],
		chapter: ["V", "s", "X", "o?", "g"],
		tableofcontents: ["V"],
		abstract: ["V"],
		appendix: ["V"],
	};

	declare protected g: Generator;

	constructor(generator: Generator, options?: any) {
		super(generator, options);
		this.g = generator;
		this.g.newCounter("chapter");
		this.g.addToReset("section", "chapter");
		this.g.setCounter("secnumdepth", 2);
		this.g.setCounter("tocdepth", 2);
		this.g.addToReset("figure", "chapter");
		this.g.addToReset("table", "chapter");
		this.g.addToReset("footnote", "chapter");
	}

	chaptername(): string[] {
		return ["Chapter"];
	}

	bibname(): string[] {
		return ["Bibliography"];
	}

	part(s: boolean, toc?: any, ttl?: any): any[] {
		return [this.g.startsection("part", -1, s, toc, ttl)];
	}

	chapter(s: boolean, toc?: any, ttl?: any): any[] {
		return [this.g.startsection("chapter", 0, s, toc, ttl)];
	}

	thechapter(): string[] {
		return [this.g.arabic(this.g.counter("chapter"))];
	}

	thesection(): string[] {
		return this.thechapter().concat(
			".",
			this.g.arabic(this.g.counter("section")),
		);
	}

	thefigure(): string[] {
		return this.g.counter("chapter") > 0
			? this.thechapter().concat(".", this.g.arabic(this.g.counter("figure")))
			: [this.g.arabic(this.g.counter("figure"))];
	}

	thetable(): string[] {
		return this.g.counter("chapter") > 0
			? this.thechapter().concat(".", this.g.arabic(this.g.counter("table")))
			: [this.g.arabic(this.g.counter("table"))];
	}

	tableofcontents(): any[] {
		return this.chapter(true, undefined, this.g.macro("contentsname")).concat([
			this.g._toc,
		]);
	}

	abstract(): any[] {
		this.g.setFontSize("small");
		this.g.enterGroup();
		this.g.setFontWeight("bf");
		const head = this.g.create(
			this.g.list,
			this.g.macro("abstractname"),
			"center",
		);
		this.g.exitGroup();
		return [head].concat(this.quotation());
	}

	endabstract(): void {
		this.endquotation();
	}

	appendix(): void {
		this.g.setCounter("chapter", 0);
		this.g.setCounter("section", 0);
		this.chaptername = this.appendixname;
		this.thechapter = () => {
			return [this.g.Alph(this.g.counter("chapter"))];
		};
	}

	// Methods inherited from Base or provided via macros; type-only declarations
	declare quotation: () => any[];
	declare endquotation: () => void;
	declare appendixname: () => string[];
}
