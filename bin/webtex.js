#!/usr/bin/env node
import {
	cpSync,
	existsSync,
	readFile as fsReadFile,
	mkdirSync,
	readFileSync,
	statSync,
	writeFileSync,
} from "node:fs";
import path from "node:path";
import util from "node:util";
import { cli } from "gunshi";
import de from "hyphenation.de";
import en from "hyphenation.en-us";
import prettier from "prettier";
import { createHTMLWindow } from "svgdom";
import { HtmlGenerator, he, parse as latexParse } from "../dist/webtex.js";

const info = JSON.parse(
	readFileSync(new URL("../package.json", import.meta.url), "utf8"),
);

global.window = createHTMLWindow();
global.document = window.document;
he.encode.options.strict = true;
he.encode.options.useNamedReferences = true;
const command = {
	name: info.name,
	description: info.description,
	usage: "[options] [files...]",
	args: {
		output: {
			type: "string",
			short: "o",
			description: "specify output file, otherwise STDOUT will be used",
		},
		assets: {
			type: "string",
			short: "a",
			optional: true,
			description:
				"copy CSS and fonts to the directory of the output file, unless dir is given (default: no assets are copied)",
		},
		url: {
			type: "string",
			short: "u",
			description:
				"set the base URL to use for the assets (default: use relative URLs)",
		},
		body: {
			type: "boolean",
			short: "b",
			description:
				"don't include HTML boilerplate and CSS, only output the contents of body",
		},
		entities: {
			type: "boolean",
			short: "e",
			description:
				"encode HTML entities in the output instead of using UTF-8 characters",
		},
		pretty: {
			type: "boolean",
			short: "p",
			description:
				"beautify the html (this may add/remove spaces unintentionally)",
		},
		class: {
			type: "string",
			short: "c",
			default: "article",
			description:
				"set a default documentclass for documents without a preamble",
		},
		macros: {
			type: "string",
			short: "m",
			description: "load a JavaScript file with additional custom macros",
		},
		stylesheet: {
			type: "string",
			short: "s",
			description:
				"specify additional style sheets to use (comma-separated for multiple)",
		},
		hyphenation: {
			type: "boolean",
			short: "n",
			default: true,
			description:
				"insert soft hyphens (enables automatic hyphenation in the browser)",
		},
		language: {
			type: "string",
			short: "l",
			default: "en",
			description: "set hyphenation language",
		},
	},
	run: main,
};

async function main(ctx) {
	const options = ctx.values;
	const files = ctx.positionals;
	let CustomMacros;
	if (options.macros) {
		const macros = path.resolve(process.cwd(), options.macros);
		const macroModule = await import(macros);
		CustomMacros = macroModule.default || macroModule[path.parse(macros).name];
	}
	if (options.body && (options.stylesheet || options.url)) {
		console.error(
			"error: conflicting options: 'url' and 'stylesheet' cannot be used with 'body'!",
		);
		process.exit(1);
	}

	const getLanguagePatterns = (language) => {
		switch (language) {
			case "en":
				return en;
			case "de":
				return de;
			default:
				console.error(`error: language '${language}' is not supported yet`);
				process.exit(1);
		}
	};

	const htmlOptions = {
		hyphenate: options.hyphenation,
		languagePatterns: getLanguagePatterns(options.language),
		documentClass: options.class,
		CustomMacros: CustomMacros,
		styles: options.stylesheet
			? options.stylesheet.split(",").map((s) => s.trim())
			: [],
	};

	const readFile = util.promisify(fsReadFile);
	const input = files.length
		? Promise.all(files.map((file) => readFile(file, "utf8")))
		: new Promise((resolve) => {
				let data = "";
				process.stdin.setEncoding("utf8");
				process.stdin.on("data", (chunk) => {
					data += chunk;
				});
				process.stdin.on("end", () => {
					resolve(data);
				});
				process.stdin.resume();
			});

	const processInput = async () => {
		try {
			let text = await input;

			if (Array.isArray(text)) {
				text = text.join("\n\n");
			}

			const generator = latexParse(text, {
				generator: new HtmlGenerator(htmlOptions),
			});

			let html;
			if (options.body) {
				const div = document.createElement("div");
				div.appendChild(generator.domFragment().cloneNode(true));
				html = div.innerHTML;
			} else {
				html = generator.htmlDocumentString(options.url);
			}

			if (options.entities) {
				html = he.encode(html, {
					allowUnsafeSymbols: true,
				});
			}

			if (options.pretty) {
				// Fix void element closing tags before formatting
				html = html.replace(/<(meta|link|br)([^>]*)><\/\1>/g, "<$1$2>");

				try {
					html = await prettier.format(html, {
						parser: "html",
						printWidth: 120,
						htmlWhitespaceSensitivity: "ignore",
						singleAttributePerLine: false,
					});
				} catch (_error) {
					console.warn(
						"Warning: Could not format HTML with prettier, using unformatted output",
					);
				}
			}

			if (options.output) {
				writeFileSync(options.output, html);
			} else {
				process.stdout.write(`${html}\n`);
			}
		} catch (err) {
			console.error(err.toString());
			process.exit(1);
		}
	};

	await processInput();

	let dir = options.assets;
	if (options.assets === true) {
		if (!options.output) {
			console.error("assets error: either a directory has to be given, or -o");
			process.exit(1);
		} else {
			dir = path.posix.dirname(path.resolve(options.output));
		}
	} else if (existsSync(dir) && !statSync(dir).isDirectory()) {
		console.error(
			"assets error: the given path exists but is not a directory: ",
			dir,
		);
		process.exit(1);
	}
	if (dir) {
		const __dirname = path.dirname(new URL(import.meta.url).pathname);
		const css = path.join(dir, "css");
		const fonts = path.join(dir, "fonts");
		const js = path.join(dir, "js");
		mkdirSync(css, { recursive: true });
		mkdirSync(fonts, { recursive: true });
		mkdirSync(js, { recursive: true });
		cpSync(path.join(__dirname, "../dist/css"), css, { recursive: true });
		cpSync(path.join(__dirname, "../dist/fonts"), fonts, { recursive: true });
		cpSync(path.join(__dirname, "../dist/js"), js, { recursive: true });
	}
}

// Run the CLI
await cli(process.argv.slice(2), command, {
	name: info.name,
	version: info.version,
	description: info.description,
	renderHeader: null, // Suppress automatic header printing
}).catch((error) => {
	console.error("Error:", error);
	process.exit(1);
});
