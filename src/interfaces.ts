// Common generator interface for document classes
export interface DocumentClassGenerator {
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
	_toc?: any; // Optional for base class
	setFontSize?(size: string): void; // Optional for base class
	enterGroup?(): void; // Optional for base class
	exitGroup?(): void; // Optional for base class
	setFontWeight?(weight: string): void; // Optional for base class
}

// Minimal generator interface for packages
export interface PackageGenerator {
	error(message: string): any;
}

// Extended package generator interfaces
export interface GraphicxGenerator extends PackageGenerator {
	createImage(width: any, height: any, file: any): any;
}

export interface MulticolGenerator extends PackageGenerator {
	create(element: any): any;
	multicols(cols: number): any;
}

export interface HyperrefGenerator extends PackageGenerator {
	create(element: any, content: any): any;
	link(url?: string): any;
	createText(text: string): any;
}

export interface StixGenerator extends PackageGenerator {
	KaTeX: {
		__defineSymbol(
			mode: string,
			group: string,
			type: string,
			symbol: string,
			command: string,
			replace?: boolean,
		): void;
	};
}
