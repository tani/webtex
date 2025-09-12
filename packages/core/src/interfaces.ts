// Common generator interface for document classes
export interface Length {
	_value: number;
	_unit: string;
	value: string;
	px: number;
	pxpct: string | number;
	unit: string;
	toPx(): number;
	cmp(other: Length): number;
	add(other: Length): Length;
	sub(other: Length): Length;
	mul(scalar: number): Length;
	div(scalar: number): Length;
	abs(): Length;
	ratio(other: Length): number;
	norm(other: Length): Length;
}

export interface LengthConstructor {
	new (value: number, unit: string): Length;
	zero: Length;
	min(...lengths: Length[]): Length;
	max(...lengths: Length[]): Length;
}

export interface DocumentClassGenerator {
	newCounter(name: string, resetBy?: string): void;
	addToReset(counter: string, resetBy: string): void;
	setLength(name: string, value: Length): void;
	length(name: string): Length;
	Length: LengthConstructor;
	setCounter(name: string, value: number): void;
	counter(name: string): number;
	arabic(value: number): string;
	Roman(value: number): string;
	Alph(value: number): string;
	startsection(
		type: string,
		level: number,
		starred: boolean,
		toc?: unknown,
		title?: unknown,
	): Element | undefined;
	setTitle(title: unknown): void;
	create(
		element: string | ((...args: unknown[]) => unknown),
		content?: unknown,
		className?: string,
	): Element;
	createVSpace(length: Length): HTMLElement;
	macro(name: string, args?: unknown[]): unknown[] | undefined;
	title: () => HTMLElement;
	author: () => HTMLElement;
	date: () => HTMLElement;
	list: () => HTMLElement;
	startlist(): boolean;
	endlist(): void;
	quotation: () => HTMLElement;
	_toc?: HTMLElement; // Optional for base class
	setFontSize?(size: string): void; // Optional for base class
	enterGroup?(): void; // Optional for base class
	exitGroup?(): void; // Optional for base class
	setFontWeight?(weight: string): void; // Optional for base class
}

// Minimal generator interface for packages
export interface PackageGenerator {
	error(message: string): unknown;
}

// Extended package generator interfaces
export interface GraphicxGenerator extends PackageGenerator {
	createImage(width: number, height: number, file: string): Element;
}

export interface MulticolGenerator extends PackageGenerator {
	create(
		element: string | ((...args: unknown[]) => unknown),
		content?: unknown,
		className?: string,
	): Element;
	multicols(cols: number): () => HTMLElement;
}

export interface HyperrefGenerator extends PackageGenerator {
	create(
		element: string | ((...args: unknown[]) => unknown),
		content: unknown,
	): Element;
	link(url?: string): () => HTMLElement;
	createText(text: string): Text | undefined;
}

export interface StixGenerator extends PackageGenerator {}

export interface AmsthrmGenerator extends PackageGenerator {
	create(
		element: string | ((...args: unknown[]) => unknown),
		content?: unknown,
		className?: string,
	): Element;
	createText(text: string): Text | undefined;
	setCounter(name: string, value: number): void;
	counter(name: string): number;
	stepCounter(name: string): void;
	refCounter(name: string, id?: string): Node | undefined;
	newCounter(name: string, resetBy?: string): void;
	arabic(value: number): string;
}
