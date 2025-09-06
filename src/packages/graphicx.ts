import type { GraphicxGenerator } from "../interfaces";

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

	private g: GraphicxGenerator;
	options?: any;

	constructor(generator: GraphicxGenerator, options?: any) {
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

	includegraphics(
		_s: unknown,
		kvl: Map<string, unknown>,
		_kvl2: unknown,
		file: unknown,
	): unknown[] {
		const width = (kvl.get("width") as number) ?? 100;
		const height = (kvl.get("height") as number) ?? 100;
		const filename = (file as string) ?? "";
		return [this.g.createImage(width, height, filename)];
	}
}
