interface Generator {
	error(message: string): any;
}

export class XColor {
	static displayName = "XColor";
	static args: Record<string, any[]> = {
		definecolorset: ["P", "i?", "c-ml", "ie", "ie", "c-ssp"],
		definecolor: ["P", "i?", "i", "c-ml", "c-spl"],
		color: ["HV", [["c-ml?", "c-spl"], ["c"]]],
		textcolor: ["HV", [["c-ml?", "c-spl"], ["c"]], "g"],
		colorbox: ["H", "i?", "c", "g"],
		fcolorbox: ["H", "i?", "c", "c", "g"],
	};

	static colors = new Map([
		["red", {}],
		["green", {}],
		["blue", {}],
		["cyan", {}],
		["magenta", {}],
		["yellow", {}],
		["black", {}],
		["gray", {}],
		["white", {}],
		["darkgray", {}],
		["lightgray", {}],
		["brown", {}],
		["lime", {}],
		["olive", {}],
		["orange", {}],
		["pink", {}],
		["purple", {}],
		["teal", {}],
		["violet", {}],
	]);

	static symbols = new Map<string, string>();

	private g: Generator;
	private options?: any;

	constructor(generator: Generator, options?: any) {
		this.g = generator;
		this.options = options;

		if (this.options?.forEach) {
			this.options.forEach((_value: any, key: string) => {
				switch (key) {
					case "natural":
					case "rgb":
					case "cmy":
					case "cmyk":
					case "hsb":
					case "gray":
					case "RGB":
					case "HTML":
					case "HSB":
					case "Gray":
					case "monochrome":
					case "dvipsnames":
					case "dvipsnames*":
					case "svgnames":
					case "svgnames*":
					case "x11names":
					case "x11names*":
						// Color model options - not implemented yet
						break;
					default:
						// Unknown option
						break;
				}
			});
		}
	}
	definecolorset(
		type: any,
		models: any,
		hd: string = "",
		tl: string = "",
		setspec: any[],
	): void {
		if (type !== null && type !== "named" && type !== "ps") {
			this.g.error("unknown color type");
		}

		for (const spec of setspec) {
			this.definecolor(type, hd + spec.name + tl, models, spec.speclist);
		}
	}

	definecolor(type: any, name: string, models: any, colorspec: any[]): void {
		if (type !== null && type !== "named" && type !== "ps") {
			this.g.error("unknown color type");
		}
		if (models.models.length !== colorspec.length) {
			this.g.error("color models and specs don't match");
		}

		const color: Record<string, any> = {};
		for (let i = 0; i < models.models.length; i++) {
			const model = models.models[i];
			color[model] = colorspec[i];
		}
		XColor.colors.set(name, color);
	}

	color(...args: any[]): any[] {
		if (args.length === 1) {
			// Handle color expression
			return [];
		} else {
			// Handle model/color spec
			return [];
		}
	}

	textcolor(...args: any[]): any[] {
		if (args.length === 2) {
			// Return the text content without color styling for now
			return [args[1]];
		}
		// For 3 arguments (model, color, text)
		if (args.length === 3) {
			return [args[2]];
		}
		return [];
	}

	colorbox(_model: any, _color: any, _text: any): any[] {
		return [];
	}

	fcolorbox(_model: any, _color: any, _text: any): any[] {
		return [];
	}
}
