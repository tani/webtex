import { SVG } from "@svgdotjs/svg.js";
import he from "he";
import hEn from "hyphenation.en-us";
import Hypher from "hypher";
import mathjax from "mathjax";

const MathJax = await mathjax.init({
	loader: { load: ["input/tex", "output/svg", "[tex]/bussproofs"] },
	startup: { typeset: false },
	svg: { fontCache: "none" },
	tex: {
		packages: { "[+]": ["bussproofs"] },
	},
});

// Native JavaScript replacements for lodash functions
const compact = <T>(array: T[]): NonNullable<T>[] =>
	array.filter((item): item is NonNullable<T> => item != null);
const flattenDeep = (arr: unknown[]): unknown[] =>
	arr.reduce<unknown[]>(
		(acc, val) =>
			Array.isArray(val) ? acc.concat(flattenDeep(val)) : acc.concat(val),
		[],
	);

import { Generator } from "./generator";
import { diacritics, ligatures } from "./symbols";

interface HtmlGeneratorOptions {
	documentClass: string;
	styles: string[];
	hyphenate: boolean;
	languagePatterns: unknown;
	precision: number;
	[key: string]: unknown;
}

interface CssDocumentClass {
	constructor: { css: string };
}

he.decode.options.strict = true;

const blockRegex =
	/^(address|blockquote|body|center|dir|div|dl|fieldset|form|h[1-6]|hr|isindex|menu|noframes|noscript|ol|p|pre|table|ul|dd|dt|frameset|li|tbody|td|tfoot|th|thead|tr|html)$/i;

const create = (type: string, classes?: string): HTMLElement => {
	const el = document.createElement(type);
	if (classes) {
		el.setAttribute("class", classes);
	}
	return el;
};

const isBlockLevel = (el: Element): boolean => {
	return blockRegex.test(el.nodeName);
};

const appendChildren = (
	parent: Element | DocumentFragment,
	children: unknown,
): Element | DocumentFragment => {
	if (children) {
		if (Array.isArray(children)) {
			for (const child of children) {
				if (child != null) {
					parent.appendChild(child as Node);
				}
			}
		} else {
			parent.appendChild(children as Node);
		}
	}
	return parent;
};

const _debugDOM = (
	oParent: Element,
	oCallback: (...args: unknown[]) => unknown,
): void => {
	if (oParent.hasChildNodes()) {
		let oNode = oParent.firstChild;
		for (; oNode; oNode = oNode.nextSibling) {
			_debugDOM(oNode as Element, oCallback);
		}
	}
	oCallback.call(oParent);
};

const debugNode = (n: unknown): void => {
	if (!n) {
		return;
	}
	const node = n as { nodeName?: string; textContent?: string };
	if (typeof node.nodeName !== "undefined") {
		console.log(`${node.nodeName}:`, node.textContent);
	} else {
		console.log("not a node:", n);
	}
};

const _debugNodes = (l: unknown[]): void => {
	for (const n of l) {
		debugNode(n);
	}
};

const _debugNodeContent = function (this: {
	nodeValue?: string | null;
}): void {
	if (this.nodeValue) {
		console.log(this.nodeValue);
	}
};

export class HtmlGenerator extends Generator {
	public sp = " ";
	public brsp = "\u200B ";
	public nbsp = he.decode("&nbsp;");
	public visp = he.decode("&blank;");
	public zwnj = he.decode("&zwnj;");
	public shy = he.decode("&shy;");
	public thinsp = he.decode("&thinsp;");

	public inline = "span";
	public block = "div";

	public part = "part";
	public chapter = "h1";
	public section = "h2";
	public subsection = "h3";
	public subsubsection = "h4";
	public paragraph = "h5";
	public subparagraph = "h6";
	public linebreak = "br";
	public par = "p";
	public listitem = "li";
	public term = "dt";
	public description = "dd";
	public verbatim = "pre";
	public img = "img";

	protected declare _options: HtmlGeneratorOptions;
	private _h?: Hypher;
	private _dom: DocumentFragment | null = null;

	constructor(options?: Partial<HtmlGeneratorOptions>) {
		super();

		this._options = Object.assign(
			{
				documentClass: "article",
				styles: [],
				hyphenate: true,
				languagePatterns: hEn,
				precision: 3,
			},
			options,
		);

		if (this._options.hyphenate) {
			this._h = new Hypher(
				this._options.languagePatterns as Hypher["patterns"],
			);
		}

		this.reset();
	}

	public titlepage = (): HTMLElement => {
		return create(this.block, "titlepage");
	};

	public title = (): HTMLElement => {
		return create(this.block, "title");
	};

	public author = (): HTMLElement => {
		return create(this.block, "author");
	};

	public date = (): HTMLElement => {
		return create(this.block, "date");
	};

	public abstract = (): HTMLElement => {
		return create(this.block, "abstract");
	};

	public list = (): HTMLElement => {
		return create(this.block, "list");
	};

	public unorderedList = (): HTMLElement => {
		return create("ul", "list");
	};

	public orderedList = (): HTMLElement => {
		return create("ol", "list");
	};

	public descriptionList = (): HTMLElement => {
		return create("dl", "list");
	};

	public itemlabel = (): HTMLElement => {
		return create(this.inline, "itemlabel");
	};

	public quote = (): HTMLElement => {
		return create(this.block, "list quote");
	};

	public quotation = (): HTMLElement => {
		return create(this.block, "list quotation");
	};

	public verse = (): HTMLElement => {
		return create(this.block, "list verse");
	};

	public multicols = (c: number) => {
		return (): HTMLElement => {
			const el = create(this.block, "multicols");
			el.setAttribute("style", `column-count:${c}`);
			return el;
		};
	};

	public anchor = (id?: string) => {
		return (): HTMLElement => {
			const el = document.createElement("a");
			if (id != null) {
				el.id = id;
			}
			return el;
		};
	};

	public link = (url?: string) => {
		return (): HTMLElement => {
			const el = document.createElement("a");
			if (url) {
				el.setAttribute("href", url);
			}
			return el;
		};
	};

	public verb = (): HTMLElement => {
		return create("code", "tt");
	};

	public image = (width: number, height: number, url: string) => {
		return (): HTMLElement => {
			const el = create(this.img);
			(el as HTMLImageElement).src = url;
			(el as HTMLImageElement).height = height;
			(el as HTMLImageElement).width = width;
			return el;
		};
	};

	public picture = (): HTMLElement => {
		return create(this.inline, "picture");
	};

	public pictureCanvas = (): HTMLElement => {
		return create(this.inline, "picture-canvas");
	};

	public SVG() {
		// Create isolated SVG instance to prevent DOM serialization race conditions
		const svgInstance = SVG();
		// Add namespace attributes immediately to prevent corruption
		if (svgInstance.node) {
			svgInstance.attr({
				xmlns: "http://www.w3.org/2000/svg",
				version: "1.1",
				"xmlns:xlink": "http://www.w3.org/1999/xlink",
				"xmlns:svgjs": "http://svgjs.dev/svgjs",
			});
		}
		return svgInstance;
	}

	public MathJax = MathJax;

	public reset(): void {
		super.reset();
		this._dom = document.createDocumentFragment();
	}

	public character(c: string): string {
		return c;
	}

	public textquote(q: string): string {
		switch (q) {
			case "`":
				return this.symbol("textquoteleft");
			case "'":
				return this.symbol("textquoteright");
			default:
				return q;
		}
	}

	public hyphen(): string {
		if (this._activeAttributeValue("fontFamily") === "tt") {
			return "-";
		} else {
			return he.decode("&hyphen;");
		}
	}

	public ligature(l: string): string {
		if (this._activeAttributeValue("fontFamily") === "tt") {
			return l;
		} else {
			return ligatures.get(l);
		}
	}

	public hasDiacritic(d: string): boolean {
		return diacritics.has(d);
	}

	public diacritic(d: string, c?: string): string {
		if (!c) {
			return diacritics.get(d)[1];
		} else {
			return c + diacritics.get(d)[0];
		}
	}

	public controlSymbol(c: string): string {
		switch (c) {
			case "/":
				return this.zwnj;
			case ",":
				return this.thinsp;
			case "-":
				return this.shy;
			case "@":
				return "\u200B";
			default:
				return this.character(c);
		}
	}

	/**
	 * @return the HTMLDocument for use as a standalone webpage
	 * @param baseURL the base URL to use to build an absolute URL
	 */
	public htmlDocument(baseURL?: string): Document {
		const doc = document.implementation.createHTMLDocument(
			this.documentTitle ?? "",
		);
		const charset = document.createElement("meta");
		charset.setAttribute("charset", "UTF-8");
		doc.head.appendChild(charset);

		if (!baseURL && typeof window !== "undefined") {
			baseURL = window.location?.href;
		}

		if (baseURL) {
			const base = document.createElement("base");
			base.href = baseURL;
			doc.head.appendChild(base);
			doc.head.appendChild(this.stylesAndScripts(baseURL));
		} else {
			doc.head.appendChild(this.stylesAndScripts());
		}

		doc.body.appendChild(this.domFragment());
		this.applyLengthsAndGeometryToDom(doc.documentElement);
		return doc;
	}

	/**
	 * @return a DocumentFragment consisting of stylesheets and scripts
	 */
	public stylesAndScripts(baseURL?: string): DocumentFragment {
		const el = document.createDocumentFragment();

		const createStyleSheet = (url: string): HTMLLinkElement => {
			const link = document.createElement("link");
			link.type = "text/css";
			link.rel = "stylesheet";
			link.href = url;
			return link;
		};

		const createScript = (url: string): HTMLScriptElement => {
			const script = document.createElement("script");
			script.src = url;
			return script;
		};

		// Add MathJax stylesheet using the proper method with fallback
		try {
			const jax = MathJax.startup.document.outputJax;
			const mathJaxStyleElement = jax.styleSheet();
			if (mathJaxStyleElement) {
				el.appendChild(mathJaxStyleElement.cloneNode(true));
			} else {
				// No stylesheet available, fallback to static CSS
				if (baseURL) {
					el.appendChild(
						createStyleSheet(new URL("css/mathjax.css", baseURL).toString()),
					);
				} else {
					el.appendChild(createStyleSheet("css/mathjax.css"));
				}
			}
		} catch (_e) {
			// MathJax stylesheet method failed, fallback to static CSS
			if (baseURL) {
				el.appendChild(
					createStyleSheet(new URL("css/mathjax.css", baseURL).toString()),
				);
			} else {
				el.appendChild(createStyleSheet("css/mathjax.css"));
			}
		}

		const maybeDocClass: unknown = this.documentClass;
		const docClass =
			maybeDocClass && typeof maybeDocClass !== "string"
				? (maybeDocClass as CssDocumentClass)
				: null;

		if (baseURL) {
			if (docClass) {
				el.appendChild(
					createStyleSheet(
						new URL(docClass.constructor.css, baseURL).toString(),
					),
				);
			}
			for (const style of this._options.styles) {
				el.appendChild(createStyleSheet(new URL(style, baseURL).toString()));
			}
			el.appendChild(createScript(new URL("js/base.js", baseURL).toString()));
		} else {
			if (docClass) {
				el.appendChild(createStyleSheet(docClass.constructor.css));
			}
			for (const style of this._options.styles) {
				el.appendChild(createStyleSheet(style));
			}
			el.appendChild(createScript("js/base.js"));
		}

		return el;
	}

	/**
	 * @return DocumentFragment, the full page without stylesheets or scripts
	 */
	public domFragment(): DocumentFragment {
		const el = document.createDocumentFragment();
		el.appendChild(this.create(this.block, this._dom, "body"));
		const marginPars = this._marginpars;
		if (marginPars.length) {
			el.appendChild(
				this.create(
					this.block,
					this.create(this.block, marginPars, "marginpar"),
					"margin-right",
				),
			);
		}
		return el;
	}

	/**
	 * write the TeX lengths and page geometry to the DOM
	 */
	public applyLengthsAndGeometryToDom(el: HTMLElement): void {
		interface LengthValue {
			value: string;
			ratio(other: LengthValue): number;
			add(other: LengthValue): LengthValue;
		}
		const lengthValue = (name: string) => this.length(name) as LengthValue;
		const createLength = (value: number, unit: string): LengthValue => {
			if (!this.Length) {
				throw new Error("Length class not initialized");
			}
			const len: unknown = new this.Length(value, unit);
			return len as LengthValue;
		};

		el.style.setProperty("--size", lengthValue("@@size").value);
		const twp = 100 * lengthValue("textwidth").ratio(lengthValue("paperwidth"));
		const mlwp =
			100 *
			lengthValue("oddsidemargin")
				.add(createLength(1, "in"))
				.ratio(lengthValue("paperwidth"));
		const mrwp = Math.max(100 - twp - mlwp, 0);
		el.style.setProperty("--textwidth", `${this.round(twp)}%`);
		el.style.setProperty("--marginleftwidth", `${this.round(mlwp)}%`);
		el.style.setProperty("--marginrightwidth", `${this.round(mrwp)}%`);

		if (mrwp > 0) {
			const mpwp =
				(100 *
					100 *
					lengthValue("marginparwidth").ratio(lengthValue("paperwidth"))) /
				mrwp;
			el.style.setProperty("--marginparwidth", `${this.round(mpwp)}%`);
		} else {
			el.style.setProperty("--marginparwidth", "0px");
		}

		el.style.setProperty("--marginparsep", lengthValue("marginparsep").value);
		el.style.setProperty("--marginparpush", lengthValue("marginparpush").value);
	}

	public createDocument(fs: unknown): void {
		if (!this._dom) {
			throw new Error("DOM not initialized");
		}
		appendChildren(this._dom, fs);
	}

	public create(
		type: string | (() => Element),
		children?: unknown,
		classes: string = "",
	): Element {
		let el: Element;

		if (typeof type === "function") {
			el = type();
			if (el.hasAttribute("class")) {
				classes = `${el.getAttribute("class")} ${classes}`;
			}
		} else {
			el = document.createElement(type);
		}

		if (this.alignment()) {
			classes += ` ${this.alignment()}`;
		}

		if (
			typeof this._continue === "number" &&
			this.location().end.offset > this._continue
		) {
			classes = `${classes} continue`;
			this.break();
		}

		if (classes.trim()) {
			el.setAttribute("class", classes.replace(/\s+/g, " ").trim());
		}

		return appendChildren(el, children) as Element;
	}

	public createText(t: string): Text | undefined {
		if (!t) {
			return;
		}
		return this.addAttributes(
			document.createTextNode(
				this._options.hyphenate ? this._h?.hyphenateText(t) : t,
			),
		);
	}

	public createVerbatim(t: string): Text | undefined {
		if (!t) {
			return;
		}
		return document.createTextNode(t);
	}

	public createFragment(
		...args: unknown[]
	): DocumentFragment | Element | undefined {
		const children = compact(flattenDeep(args)) as Node[];
		if (args.length > 0 && (!children || !children.length)) {
			return;
		}

		if (children.length === 1 && (children[0] as Node).nodeType) {
			return children[0] as Element;
		}

		const f = document.createDocumentFragment();
		return appendChildren(f, children) as DocumentFragment;
	}

	public createImage(width: number, height: number, url: string): Element {
		return this.create(this.image(width, height, url));
	}

	public createPicture(
		size: { x: { value: string }; y: { value: string } },
		offset: {
			x: { mul(n: number): { value: string } };
			y: { mul(n: number): { value: string } };
		} | null,
		content: Node | Node[],
	): Element {
		const canvas = this.create(this.pictureCanvas);
		appendChildren(canvas, content);

		if (offset) {
			canvas.setAttribute(
				"style",
				`left:${offset.x.mul(-1).value};bottom:${offset.y.mul(-1).value}`,
			);
		}

		const pic = this.create(this.picture);
		pic.appendChild(canvas);
		pic.setAttribute("style", `width:${size.x.value};height:${size.y.value}`);
		return pic;
	}

	public createVSpaceSkip(skip: string): HTMLSpanElement {
		const span = document.createElement("span");
		span.setAttribute("class", `vspace ${skip}`);
		return span;
	}

	public createVSpaceSkipInline(skip: string): HTMLSpanElement {
		const span = document.createElement("span");
		span.setAttribute("class", `vspace-inline ${skip}`);
		return span;
	}

	public createVSpace(length: { value: string }): HTMLSpanElement {
		const span = document.createElement("span");
		span.setAttribute("class", "vspace");
		span.setAttribute("style", `margin-bottom:${length.value}`);
		return span;
	}

	public createVSpaceInline(length: { value: string }): HTMLSpanElement {
		const span = document.createElement("span");
		span.setAttribute("class", "vspace-inline");
		span.setAttribute("style", `margin-bottom:${length.value}`);
		return span;
	}

	public createBreakSpace(length: { value: string }): Element {
		const span = document.createElement("span");
		span.setAttribute("class", "breakspace");
		span.setAttribute("style", `margin-bottom:${length.value}`);
		return this.addAttributes(span);
	}

	public createHSpace(length: { value: string }): HTMLSpanElement {
		const span = document.createElement("span");
		span.setAttribute("style", `margin-right:${length.value}`);
		return span;
	}

	public parseMath(math: string, display?: boolean): DocumentFragment {
		const svg = MathJax.tex2svg(math, { display: !!display });
		const html = MathJax.startup.adaptor.outerHTML(svg);
		const div = document.createElement("div");
		div.innerHTML = html;
		const fragment = document.createDocumentFragment();
		while (div.firstChild) {
			fragment.appendChild(div.firstChild);
		}
		return fragment;
	}

	public addAttribute(el: Element, attrs: string): void {
		if (el.hasAttribute("class")) {
			attrs = `${el.getAttribute("class")} ${attrs}`;
		}
		el.setAttribute("class", attrs);
	}

	public hasAttribute(el: Element, attr: string): boolean {
		const className = el.getAttribute("class");
		return (
			el.hasAttribute("class") &&
			className !== null &&
			RegExp(`\\b${attr}\\b`).test(className)
		);
	}

	public addAttributes(nodes: Element): Element;
	public addAttributes(nodes: Text): Text;
	public addAttributes(nodes: DocumentFragment): DocumentFragment;
	public addAttributes(nodes: Node[]): Node[];
	public addAttributes(nodes: Node | Node[]): Node | Node[] {
		const attrs = this._inlineAttributes();
		if (!attrs) {
			return nodes;
		}

		if (nodes instanceof window.Element) {
			return isBlockLevel(nodes)
				? this.create(this.block, nodes, attrs)
				: this.create(this.inline, nodes, attrs);
		}
		if (
			nodes instanceof window.Text ||
			nodes instanceof window.DocumentFragment
		) {
			return this.create(this.inline, nodes, attrs);
		}
		if (Array.isArray(nodes)) {
			return nodes.map((node) => this.create(this.inline, node, attrs));
		}

		console.warn("addAttributes got an unknown/unsupported argument:", nodes);
		return nodes;
	}
}
