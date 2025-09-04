#!/usr/bin/env node
import { createHTMLWindow } from "svgdom";
import util from "node:util";
import path from "node:path";
import fsExtra from "fs-extra";
import stdin from "stdin";
import { cli } from "gunshi";
import prettier from "prettier";
import { he, parse as latexParse, HtmlGenerator } from "../dist/latex.js";
import en from "hyphenation.en-us";
import de from "hyphenation.de";
import { readFileSync } from "node:fs";

const info = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));

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
			type: 'string' as const,
			short: 'o',
			description: 'specify output file, otherwise STDOUT will be used'
		},
		assets: {
			type: 'string' as const,
			short: 'a',
			optional: true,
			description: 'copy CSS and fonts to the directory of the output file, unless dir is given (default: no assets are copied)'
		},
		url: {
			type: 'string' as const,
			short: 'u',
			description: 'set the base URL to use for the assets (default: use relative URLs)'
		},
		body: {
			type: 'boolean' as const,
			short: 'b',
			description: "don't include HTML boilerplate and CSS, only output the contents of body"
		},
		entities: {
			type: 'boolean' as const,
			short: 'e',
			description: 'encode HTML entities in the output instead of using UTF-8 characters'
		},
		pretty: {
			type: 'boolean' as const,
			short: 'p',
			description: 'beautify the html (this may add/remove spaces unintentionally)'
		},
		class: {
			type: 'string' as const,
			short: 'c',
			default: 'article',
			description: 'set a default documentclass for documents without a preamble'
		},
		macros: {
			type: 'string' as const,
			short: 'm',
			description: 'load a JavaScript file with additional custom macros'
		},
		stylesheet: {
			type: 'string' as const,
			short: 's',
			description: 'specify additional style sheets to use (comma-separated for multiple)'
		},
		hyphenation: {
			type: 'boolean' as const,
			short: 'n',
			default: true,
			description: 'insert soft hyphens (enables automatic hyphenation in the browser)'
		},
		language: {
			type: 'string' as const,
			short: 'l',
			default: 'en',
			description: 'set hyphenation language'
		}
	},
	run: main
};

async function main(ctx: any) {
	const options = ctx.values;
	const files = ctx.positionals;
	let CustomMacros: any;
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

	const getLanguagePatterns = (language: string) => {
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
		styles: options.stylesheet ? options.stylesheet.split(',').map((s: string) => s.trim()) : [],
	};
	
	const readFile = util.promisify(fsExtra.readFile);
	const input = files.length
		? Promise.all(files.map((file: string) => readFile(file, 'utf8')))
		: new Promise<string>((resolve) => {
				stdin((str: string) => {
					resolve(str);
				});
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

			let html: string;
			if (options.body) {
				const div = document.createElement("div");
				div.appendChild(generator.domFragment().cloneNode(true));
				html = div.innerHTML;
			} else {
				html = generator.htmlDocument(options.url).documentElement.outerHTML;
			}

			if (options.entities) {
				html = he.encode(html, {
					allowUnsafeSymbols: true,
				});
			}

			if (options.pretty) {
				// Fix void element closing tags before formatting
				html = html.replace(/<(meta|link|br)([^>]*)><\/\1>/g, '<$1$2>');
				
				try {
					html = await prettier.format(html, {
						parser: "html",
						printWidth: 120,
						htmlWhitespaceSensitivity: "ignore",
						singleAttributePerLine: false,
					});
				} catch (error) {
					console.warn("Warning: Could not format HTML with prettier, using unformatted output");
				}
			}

			if (options.output) {
				fsExtra.writeFileSync(options.output, html);
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
	} else if (fsExtra.existsSync(dir) && !fsExtra.statSync(dir).isDirectory()) {
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
		fsExtra.mkdirpSync(css);
		fsExtra.mkdirpSync(fonts);
		fsExtra.mkdirpSync(js);
		fsExtra.copySync(path.join(__dirname, "../dist/css"), css);
		fsExtra.copySync(path.join(__dirname, "../dist/fonts"), fonts);
		fsExtra.copySync(path.join(__dirname, "../dist/js"), js);
	}
}

// Run the CLI
await cli(process.argv.slice(2), command, {
	name: info.name,
	version: info.version,
	description: info.description
}).catch((error) => {
	console.error("Error:", error);
	process.exit(1);
});
