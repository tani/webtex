import type { DocumentClassGenerator } from "../interfaces";
import { Base } from "./base";

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

	protected declare g: DocumentClassGenerator;

	constructor(
		generator: DocumentClassGenerator,
		options?: Map<string, unknown>,
	) {
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

	part(s: boolean, toc?: unknown, ttl?: unknown): Element[] {
		const el = this.g.startsection("part", -1, s, toc, ttl);
		return el ? [el] : [];
	}

	chapter(s: boolean, toc?: unknown, ttl?: unknown): Element[] {
		const el = this.g.startsection("chapter", 0, s, toc, ttl);
		return el ? [el] : [];
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

	tableofcontents(): Element[] {
		const head = this.chapter(true, undefined, this.g.macro("contentsname"));
		const toc = this.g._toc ? [this.g._toc] : [];
		return head.concat(toc);
	}

	abstract(): Element[] {
		this.g.setFontSize?.("small");
		this.g.enterGroup?.();
		this.g.setFontWeight?.("bf");
		const head = this.g.create(
			this.g.list,
			this.g.macro("abstractname"),
			"center",
		);
		this.g.exitGroup?.();
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
	declare quotation: () => Element[];
	declare endquotation: () => void;
	declare appendixname: () => string[];
}
