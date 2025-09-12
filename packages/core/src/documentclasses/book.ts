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
	private _mainmatter = true;

	constructor(
		generator: DocumentClassGenerator,
		options?: Map<string, unknown>,
	) {
		super(generator, options);
		this._mainmatter = true;
	}

	chapter(s: boolean, toc?: unknown, ttl?: unknown): Element[] {
		const el = this.g.startsection(
			"chapter",
			0,
			s || !this._mainmatter,
			toc,
			ttl,
		);
		return el ? [el] : [];
	}

	frontmatter(): void {
		this._mainmatter = false;
	}

	mainmatter(): void {
		this._mainmatter = true;
	}

	backmatter(): void {
		this._mainmatter = false;
	}
}
