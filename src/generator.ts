import { LaTeX } from "./latex.ltx";
import { symbols } from "./symbols";
import { makeLengthClass } from "./types";

type MacroFunction = (...args: unknown[]) => unknown;

interface GeneratorOptions {
	documentClass?: string;
	precision?: number;
	CustomMacros?: new (g: unknown) => Record<string, unknown>;
	[key: string]: unknown;
}

interface Location {
	start: { offset: number };
	end: { offset: number };
}

declare global {
	interface Array<T> {
		top: T;
	}
}

const Macros = LaTeX;

// Extend Array prototype with top getter/setter for stack operations
Object.defineProperty(Array.prototype, "top", {
	enumerable: false,
	configurable: true,
	get: function () {
		return this[this.length - 1];
	},
	set: function (v) {
		this[this.length - 1] = v;
	},
});

interface StackFrame<TNode = Node> {
	attrs: {
		fontFamily?: string;
		fontWeight?: string;
		fontShape?: string;
		fontSize?: string;
		textDecoration?: string;
	};
	align: string | null;
	currentlabel: {
		id: string;
		label: TNode;
	};
	lengths: Map<string, unknown>;
}

interface ArgumentFrame {
	name?: string;
	args: unknown[];
	parsed: unknown[];
}

// Modern deep equality function
const isRecord = (v: unknown): v is Record<string, unknown> => {
	return typeof v === "object" && v !== null;
};

const deepEqual = (a: unknown, b: unknown, type: string = "==="): boolean => {
	if (a == null || b == null) return a === b;
	if (a === b)
		return (a as number) !== 0 || 1 / (a as number) === 1 / (b as number);

	const className = Object.prototype.toString.call(a);
	if (Object.prototype.toString.call(b) !== className) return false;

	switch (className) {
		case "[object String]":
			return a === String(b);
		case "[object Number]": {
			const numA = a as number;
			const numB = b as number;
			return numA !== +numA
				? numB !== +numB
				: numA === 0
					? 1 / numA === 1 / numB
					: numA === +numB;
		}
		case "[object Date]":
		case "[object Boolean]":
			return +(a as number) === +(b as number);
		case "[object RegExp]":
			return (
				(a as RegExp).source === (b as RegExp).source &&
				(a as RegExp).global === (b as RegExp).global &&
				(a as RegExp).multiline === (b as RegExp).multiline &&
				(a as RegExp).ignoreCase === (b as RegExp).ignoreCase
			);
	}

	if (typeof a !== "object" || typeof b !== "object") return false;

	if (Array.isArray(a) && Array.isArray(b)) {
		if (type === "===") return a.length === b.length;
		if (type === "<==") return a.length <= b.length;
		if (type === "<<=") return a.length < b.length;

		for (let i = 0; i < Math.min(a.length, b.length); i++) {
			if (!deepEqual(a[i], b[i])) return false;
		}
		return true;
	}

	// Ensure non-array objects for safe indexing
	if (!isRecord(a) || !isRecord(b)) return false;

	const objA = a as Record<string, unknown>;
	const objB = b as Record<string, unknown>;
	const keysA = Object.keys(objA);
	const keysB = Object.keys(objB);

	if (type === "===") return keysA.length === keysB.length;
	if (type === "<==") return keysA.length <= keysB.length;
	if (type === "<<=") return keysA.length < keysB.length;

	for (const key of keysA) {
		if (!keysB.includes(key) || !deepEqual(objA[key], objB[key])) return false;
	}

	return true;
};

// Helper function to check if value is in array
const includes = <T>(value: T, array: T[]): boolean => {
	return array.includes(value);
};

// Roman numeral conversion helper
const romanize = (num: number, lookup: [string, number][]): string => {
	let roman = "";
	for (const [letter, value] of lookup) {
		while (num >= value) {
			roman += letter;
			num -= value;
		}
	}
	return roman;
};

let errorFn = (e: string) => {
	console.error(e);
	throw new Error(e);
};

export abstract class Generator<TNode extends Node = Node> {
	[key: string]: unknown;
	public documentClass: string | null = null;
	public documentTitle: string | null = null;
	public Length!: ReturnType<typeof makeLengthClass>;

	protected _options: GeneratorOptions | null = null;
	protected _macros: Record<string, MacroFunction> = {};
	protected _stack: StackFrame<TNode>[] = [];
	protected _groups: number[] = [];
	protected _continue: boolean | number = false;
	protected _labels: Map<string, StackFrame<TNode>["currentlabel"]> = new Map();
	protected _refs: Map<string, TNode[]> = new Map();
	protected _counters: Map<string, number> = new Map();
	protected _resets: Map<string, string[]> = new Map();
	protected _marginpars: TNode[] = [];
	protected _uid: number = 1;
	protected _curArgs: ArgumentFrame[] = [];

	constructor(options?: GeneratorOptions) {
		this._options = options ?? null;
	}

	public reset(): void {
		this.Length = makeLengthClass(this);
		this.documentClass = this._options?.documentClass || null;
		this.documentTitle = "untitled";
		this._uid = 1;
		this._macros = {};
		this._curArgs = [];
		this._stack = [
			{
				attrs: {},
				align: null,
				currentlabel: {
					id: "",
					label: document.createTextNode("") as Node as TNode,
				},
				lengths: new Map(),
			},
		];
		this._groups = [0];
		this._labels = new Map();
		this._refs = new Map();
		this._marginpars = [];
		this._counters = new Map();
		this._resets = new Map();
		this._continue = false;

		this.newCounter("enumi");
		this.newCounter("enumii");
		this.newCounter("enumiii");
		this.newCounter("enumiv");

		const generatorForMacros = this as unknown;
		const macros = new Macros(
			generatorForMacros as ConstructorParameters<typeof Macros>[0],
			this._options?.CustomMacros,
		);
		const macrosRecord = macros as unknown;
		this._macros = macrosRecord as Record<string, MacroFunction>;
	}

	public nextId(): number {
		return this._uid++;
	}

	public round(num: number): number {
		const factor = 10 ** (this._options?.precision ?? 3);
		return Math.round(num * factor) / factor;
	}

	public error(e: string): never {
		return errorFn(e);
	}

	public setErrorFn(e: (msg: string) => never): void {
		errorFn = e;
	}

	public location(): Location {
		return errorFn("location function not set!") as never;
	}

	public abstract createText(text: string): TNode;
	public abstract createFragment(...args: TNode[]): TNode;
	public abstract create(
		type: unknown,
		children?: TNode | TNode[] | null,
		classes?: string,
	): TNode;
	public abstract addAttributes(node: TNode): TNode;

	public setTitle(title: { textContent: string | null }): void {
		this.documentTitle = title.textContent;
	}

	public hasSymbol(name: string): boolean {
		return Macros.symbols.has(name);
	}

	public symbol(name: string): string {
		if (!this.hasSymbol(name)) {
			this.error(`no such symbol: ${name}`);
		}
		return Macros.symbols.get(name) as string;
	}

	public hasMacro(name: string): boolean {
		return (
			typeof this._macros[name] === "function" &&
			!deepEqual(name, "constructor", "===") &&
			(Object.hasOwn(this._macros, name) ||
				Object.hasOwn(Macros.prototype, name))
		);
	}

	public isHmode(macro: string): boolean {
		const args = Macros.args[macro] as unknown[] | undefined;
		return args?.[0] === "H" || !args;
	}

	public isVmode(macro: string): boolean {
		const args = Macros.args[macro] as unknown[] | undefined;
		return args?.[0] === "V";
	}

	public isHVmode(macro: string): boolean {
		const args = Macros.args[macro] as unknown[] | undefined;
		return args?.[0] === "HV";
	}

	public isPreamble(macro: string): boolean {
		const args = Macros.args[macro] as unknown[] | undefined;
		return args?.[0] === "P";
	}

	public macro(name: string, args: unknown[]): TNode[] | undefined {
		if (symbols.has(name)) {
			const sym = symbols.get(name);
			return sym ? [this.createText(sym)] : undefined;
		}

		const result = this._macros[name]?.apply(this._macros, args);
		return result
			?.filter((x: unknown): x is string | TNode => x !== undefined)
			.map((x: string | TNode) => {
				if (typeof x === "string" || x instanceof String) {
					return this.createText(x.toString());
				} else {
					return this.addAttributes(x as TNode);
				}
			});
	}

	public beginArgs(macro: string): void {
		const macroArgs = Macros.args[macro] as unknown[] | undefined;
		this._curArgs.push(
			macroArgs
				? {
						name: macro,
						args: macroArgs.slice(1),
						parsed: [],
					}
				: {
						args: [],
						parsed: [],
					},
		);
	}

	public selectArgsBranch(nextChar: string): boolean {
		const optArgs = ["o?", "i?", "k?", "kv?", "n?", "l?", "c-ml?", "cl?"];

		const first = this._curArgs.top.args[0];
		if (Array.isArray(first)) {
			const branches = first as unknown[][];

			for (const branch of branches) {
				if (
					(nextChar === "[" && includes(branch[0] as string, optArgs)) ||
					(nextChar === "{" && !includes(branch[0] as string, optArgs))
				) {
					this._curArgs.top.args.shift();
					this._curArgs.top.args.unshift(...branch);
					return true;
				}
			}
		}
		return false;
	}

	public nextArg(arg: string): boolean {
		if (this._curArgs.top.args[0] === arg) {
			this._curArgs.top.args.shift();
			return true;
		}
		return false;
	}

	public argError(m: string): void {
		errorFn(`macro \\${this._curArgs.top.name}: ${m}`);
	}

	public addParsedArg(a: unknown): void {
		this._curArgs.top.parsed.push(a);
	}

	public parsedArgs(): unknown[] {
		return this._curArgs.top.parsed;
	}

	public preExecMacro(): void {
		this.macro(this._curArgs.top.name as string, this.parsedArgs());
	}

	public endArgs(): unknown[] {
		const frame = this._curArgs.pop();
		if (!frame) {
			throw new Error("No argument frame to pop");
		}
		if (frame.args.length !== 0) {
			errorFn(
				"grammar error: arguments for " +
					frame.name +
					" have not been parsed: " +
					frame.args,
			);
		}
		return frame.parsed;
	}

	public begin(env_id: string): void {
		if (!this.hasMacro(env_id)) {
			errorFn(`unknown environment: ${env_id}`);
		}
		this.startBalanced();
		this.enterGroup();
		this.beginArgs(env_id);
	}

	public end(id: string, end_id: string): TNode[] | undefined {
		if (id !== end_id) {
			errorFn(
				"environment '" +
					id +
					"' is missing its end, found '" +
					end_id +
					"' instead",
			);
		}

		let endResult: TNode[] | undefined;
		if (this.hasMacro(`end${id}`)) {
			endResult = this.macro(`end${id}`, []);
		}

		this.exitGroup();
		if (!this.isBalanced()) {
			errorFn(`${id}: groups need to be balanced in environments!`);
		}
		this.endBalanced();
		return endResult;
	}

	public enterGroup(copyAttrs: boolean = false): void {
		this._stack.push({
			attrs: copyAttrs ? Object.assign({}, this._stack.top.attrs) : {},
			align: null,
			currentlabel: Object.assign({}, this._stack.top.currentlabel),
			lengths: new Map(this._stack.top.lengths),
		});
		++this._groups.top;
	}

	public exitGroup(): void {
		if (--this._groups.top < 0) {
			errorFn("there is no group to end here");
		}
		this._stack.pop();
	}

	public startBalanced(): void {
		this._groups.push(0);
	}

	public endBalanced(): number {
		this._groups.pop();
		return this._groups.length;
	}

	public isBalanced(): boolean {
		return this._groups.top === 0;
	}

	public continue(): void {
		this._continue = this.location().end.offset;
	}

	public break(): void {
		if (
			typeof this._continue === "number" &&
			this.location().end.offset > this._continue
		) {
			this._continue = false;
		}
	}

	public setAlignment(align: string): void {
		this._stack.top.align = align;
	}

	public alignment(): string | null {
		return this._stack.top.align;
	}

	public setFontFamily(family: string): void {
		this._stack.top.attrs.fontFamily = family;
	}

	public setFontWeight(weight: string): void {
		this._stack.top.attrs.fontWeight = weight;
	}

	public setFontShape(shape: string): void {
		if (shape === "em") {
			if (this._activeAttributeValue("fontShape") === "it") {
				shape = "up";
			} else {
				shape = "it";
			}
		}
		this._stack.top.attrs.fontShape = shape;
	}

	public setFontSize(size: string): void {
		this._stack.top.attrs.fontSize = size;
	}

	public setTextDecoration(decoration: string): void {
		this._stack.top.attrs.textDecoration = decoration;
	}

	public _inlineAttributes(): string {
		const cur = this._stack.top.attrs;
		return [
			cur.fontFamily,
			cur.fontWeight,
			cur.fontShape,
			cur.fontSize,
			cur.textDecoration,
		]
			.join(" ")
			.replace(/\s+/g, " ")
			.trim();
	}

	public _activeAttributeValue(attr: string): string | undefined {
		for (let i = this._stack.length - 1; i >= 0; i--) {
			const frame = this._stack[i];
			const value =
				frame?.attrs[attr as keyof (typeof this._stack)[0]["attrs"]];
			if (value) {
				return value;
			}
		}
		return undefined;
	}

	public startsection(
		sec: string,
		level: number,
		star: boolean,
		toc?: TNode,
		ttl?: TNode,
	): TNode | undefined {
		if (toc === ttl && ttl === undefined) {
			if (!star && this.counter("secnumdepth") >= level) {
				this.stepCounter(sec);
				this.refCounter(sec, `sec-${this.nextId()}`);
			}
			return undefined;
		}

		let el: TNode;
		if (!star && this.counter("secnumdepth") >= level) {
			if (sec === "chapter") {
				const chaphead = this.create(
					this.block,
					(this.macro("chaptername", []) ?? []).concat(
						this.createText(this.symbol("space")),
						...(this.macro(`the${sec}`, []) ?? []),
					),
				);
				const kids = (ttl ? [chaphead, ttl] : [chaphead]) as TNode[];
				el = this.create(this[sec], kids);
			} else {
				el = this.create(
					this[sec],
					(this.macro(`the${sec}`, []) ?? []).concat(
						this.createText(this.symbol("quad")),
						...(ttl ? [ttl] : []),
					),
				);
			}

			const currentId = this._stack.top.currentlabel.id;
			if (currentId != null) {
				(el as Node as Element).id = currentId;
			}
		} else {
			el = this.create(this[sec], ttl);
		}

		return el;
	}

	public startlist(): boolean {
		this.stepCounter("@listdepth");
		if (this.counter("@listdepth") > 6) {
			errorFn("too deeply nested");
		}
		return true;
	}

	public endlist(): void {
		this.setCounter("@listdepth", this.counter("@listdepth") - 1);
		this.continue();
	}

	public newLength(l: string): void {
		if (this.hasLength(l)) {
			errorFn(`length ${l} already defined!`);
		}
		this._stack.top.lengths.set(l, this.Length?.zero);
	}

	public hasLength(l: string): boolean {
		return this._stack.top.lengths.has(l);
	}

	public setLength(id: string, length: unknown): void {
		if (!this.hasLength(id)) {
			errorFn(`no such length: ${id}`);
		}
		this._stack.top.lengths.set(id, length);
	}

	public length(l: string): unknown {
		if (!this.hasLength(l)) {
			errorFn(`no such length: ${l}`);
		}
		return this._stack.top.lengths.get(l);
	}

	public theLength(id: string): TNode {
		const l = this.create(this.inline, undefined, "the");
		(l as Node as Element).setAttribute("display-var", id);
		return l;
	}

	public newCounter(c: string, parent?: string): void {
		if (this.hasCounter(c)) {
			errorFn(`counter ${c} already defined!`);
		}
		this._counters.set(c, 0);
		this._resets.set(c, []);

		if (parent) {
			this.addToReset(c, parent);
		}

		if (this.hasMacro(`the${c}`)) {
			errorFn(`macro \\the${c} already defined!`);
		}

		this._macros[`the${c}`] = function (this: { g: Generator<TNode> }) {
			return [this.g.arabic(this.g.counter(c))];
		} as MacroFunction;
	}

	public hasCounter(c: string): boolean {
		return this._counters.has(c);
	}

	public setCounter(c: string, v: number): void {
		if (!this.hasCounter(c)) {
			errorFn(`no such counter: ${c}`);
		}
		this._counters.set(c, v);
	}

	public stepCounter(c: string): void {
		this.setCounter(c, this.counter(c) + 1);
		this.clearCounter(c);
	}

	public counter(c: string): number {
		if (!this.hasCounter(c)) {
			errorFn(`no such counter: ${c}`);
		}
		const value = this._counters.get(c);
		if (value === undefined) {
			throw new Error(`Counter ${c} not found`);
		}
		return value;
	}

	public refCounter(c: string, id?: string): TNode | undefined {
		let el: TNode | undefined;
		if (!id) {
			id = `${c}-${this.nextId()}`;
			const anchor = (
				this as Record<string, ((i?: string) => unknown) | undefined>
			).anchor;
			if (typeof anchor === "function") {
				el = this.create(anchor(id));
			}
		}

		this._stack.top.currentlabel = {
			id: id,
			label: this.createFragment(
				...((this.hasMacro(`p@${c}`) ? this.macro(`p@${c}`, []) : []) ?? []),
				...((this.macro(`the${c}`, []) ?? []) as TNode[]),
			),
		};

		return el;
	}

	public addToReset(c: string, parent: string): void {
		if (!this.hasCounter(parent)) {
			errorFn(`no such counter: ${parent}`);
		}
		if (!this.hasCounter(c)) {
			errorFn(`no such counter: ${c}`);
		}
		this._resets.get(parent)?.push(c);
	}

	public clearCounter(c: string): void {
		const resets = this._resets.get(c);
		if (resets) {
			for (const r of resets) {
				this.clearCounter(r);
				this.setCounter(r, 0);
			}
		}
	}

	public alph(num: number): string {
		return String.fromCharCode(96 + num);
	}

	public Alph(num: number): string {
		return String.fromCharCode(64 + num);
	}

	public arabic(num: number): string {
		return String(num);
	}

	public roman(num: number): string {
		const lookup: [string, number][] = [
			["m", 1000],
			["cm", 900],
			["d", 500],
			["cd", 400],
			["c", 100],
			["xc", 90],
			["l", 50],
			["xl", 40],
			["x", 10],
			["ix", 9],
			["v", 5],
			["iv", 4],
			["i", 1],
		];
		return romanize(num, lookup);
	}

	public Roman(num: number): string {
		const lookup: [string, number][] = [
			["M", 1000],
			["CM", 900],
			["D", 500],
			["CD", 400],
			["C", 100],
			["XC", 90],
			["L", 50],
			["XL", 40],
			["X", 10],
			["IX", 9],
			["V", 5],
			["IV", 4],
			["I", 1],
		];
		return romanize(num, lookup);
	}

	public fnsymbol(num: number): string {
		switch (num) {
			case 1:
				return this.symbol("textasteriskcentered");
			case 2:
				return this.symbol("textdagger");
			case 3:
				return this.symbol("textdaggerdbl");
			case 4:
				return this.symbol("textsection");
			case 5:
				return this.symbol("textparagraph");
			case 6:
				return this.symbol("textbardbl");
			case 7:
				return (
					this.symbol("textasteriskcentered") +
					this.symbol("textasteriskcentered")
				);
			case 8:
				return this.symbol("textdagger") + this.symbol("textdagger");
			case 9:
				return this.symbol("textdaggerdbl") + this.symbol("textdaggerdbl");
			default:
				return errorFn("fnsymbol value must be between 1 and 9");
		}
	}

	public setLabel(label: string): void {
		if (this._labels.has(label)) {
			errorFn(`label ${label} already defined!`);
		}

		if (!this._stack.top.currentlabel.id) {
			console.warn(`warning: no \\@currentlabel available for label ${label}!`);
		}

		this._labels.set(label, this._stack.top.currentlabel);

		if (this._refs.has(label)) {
			const refs = this._refs.get(label);
			if (!refs) {
				throw new Error(`References for label ${label} not found`);
			}
			for (const r of refs) {
				while (r.firstChild) {
					r.removeChild(r.firstChild);
				}
				r.appendChild(this._stack.top.currentlabel.label.cloneNode(true));
				(r as Node as Element).setAttribute(
					"href",
					`#${this._stack.top.currentlabel.id}`,
				);
			}
			this._refs.delete(label);
		}
	}

	public ref(label: string): TNode {
		const labelData = this._labels.get(label);
		const link = (this as Record<string, unknown>).link as (
			href: string,
		) => unknown;
		if (labelData) {
			return this.create(
				link(`#${labelData.id}`),
				labelData.label.cloneNode(true) as TNode,
			);
		}

		const el = this.create(link("#"), this.createText("??"));
		if (!this._refs.has(label)) {
			this._refs.set(label, [el]);
		} else {
			this._refs.get(label)?.push(el);
		}
		return el;
	}

	public logUndefinedRefs(): void {
		if (this._refs.size === 0) {
			return;
		}

		for (const [key] of this._refs) {
			console.warn(`warning: reference '${key}' undefined`);
		}
		console.warn("There were undefined references.");
	}

	public marginpar(txt: TNode): TNode {
		const id = this.nextId();
		const marginPar = this.create(this.block, [
			this.create(this.inline, null, "mpbaseline"),
			txt,
		]);
		Object.assign(marginPar, { id });
		this._marginpars.push(marginPar);

		const marginRef = this.create(this.inline, null, "mpbaseline");
		Object.assign(marginRef, { id: `marginref-${id}` });
		return marginRef;
	}
}
