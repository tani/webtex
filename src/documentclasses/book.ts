import type { DocumentClassGenerator } from "../interfaces";
import { Report } from "./report";

export class Book extends Report {
	static displayName = "Book";
	static css = "css/book.css";
	static args = {
		...Report.args,
		part: ["V", "s", "X", "o?", "g"],
		chapter: ["V", "s", "X", "o?", "g"],
		frontmatter: ["V"],
		mainmatter: ["V"],
		backmatter: ["V"],
	};
	protected declare g: DocumentClassGenerator;

	constructor(
		generator: DocumentClassGenerator,
		options?: Map<string, unknown>,
	) {
		super(generator, options);
		this["@mainmatter"] = true;
	}

	chapter(s: boolean, toc?: unknown, ttl?: unknown): Element[] {
		return [
			this.g.startsection("chapter", 0, s || !this["@mainmatter"], toc, ttl),
		];
	}

	frontmatter(): void {
		this["@mainmatter"] = false;
	}

	mainmatter(): void {
		this["@mainmatter"] = true;
	}

	backmatter(): void {
		this["@mainmatter"] = false;
	}
}
