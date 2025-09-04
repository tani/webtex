interface Generator {
	createImage(width: any, height: any, file: any): any;
}

export class Graphicx {
	static displayName = "Graphicx";
	static args: Record<string, any[]> = {
		rotatebox: ["H", "kv?", "n", "hg"],
		scalebox: ["H", "n", "n?", "g"],
		reflectbox: ["H", "g"],
		resizebox: ["H", "s", "l", "l", "g"],
		graphicspath: ["HV", "gl"],
		includegraphics: ["H", "s", "kv?", "kv?", "k"],
	};

	private g: Generator;
	options?: any;

	constructor(generator: Generator, options?: any) {
		this.g = generator;
		this.options = options;
	}

	rotatebox(_kvl: any, _angle: any, _text: any): any[] {
		return [];
	}

	scalebox(_hsc: any, _vsc?: any, _text?: any): any[] {
		return [];
	}

	reflectbox(text: any): any[] {
		return this.scalebox(-1, 1, text);
	}

	resizebox(_s: any, _hl: any, _vl: any, _text: any): any[] {
		return [];
	}

	graphicspath(_paths: any): any[] {
		return [];
	}

	includegraphics(_s: any, kvl: any, _kvl2: any, file: any): any[] {
		return [this.g.createImage(kvl.get("width"), kvl.get("height"), file)];
	}
}
