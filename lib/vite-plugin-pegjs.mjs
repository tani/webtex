import { accessSync, R_OK, readFileSync } from "node:fs";
import { dirname, resolve as resolvePath } from "node:path";
import pegjs from "peggy";

const { generate } = pegjs;

export default (options = {}) => {
	return {
		name: "vite-pegjs-loader",

		resolveId(id, importer) {
			// Handle .pegjs files directly
			if (id.endsWith(".pegjs")) {
				if (importer) {
					const basedir = dirname(importer);
					const resolved = resolvePath(basedir, id);

					try {
						accessSync(resolved, R_OK);
						return resolved;
					} catch {
						return null;
					}
				}
				return id;
			}

			// Handle relative imports that might be pegjs files
			if (id.startsWith("./") || id.startsWith("../")) {
				if (importer) {
					const basedir = dirname(importer);
					const withExtension = `${id}.pegjs`;
					const resolved = resolvePath(basedir, withExtension);

					try {
						accessSync(resolved, R_OK);
						return resolved;
					} catch {
						return null;
					}
				}
			}

			return null;
		},

		load(id) {
			if (!id.endsWith(".pegjs")) {
				return null;
			}

			try {
				const grammar = readFileSync(id, "utf8");
				const generatedParser = generate(
					grammar,
					Object.assign({ output: "source" }, options),
				);

				// Fix naming conflict with global SyntaxError and CommonJS requires
				let fixedParser = generatedParser.replace(
					/class peg\$SyntaxError extends SyntaxError/g,
					"class peg$SyntaxError extends globalThis.SyntaxError",
				);

				// Convert CommonJS require to import for ES modules
				fixedParser = fixedParser.replace(
					/const { Vector } = require\('\.\/types'\);/g,
					"import { Vector } from './types';",
				);

				// Generate ES module exports
				const code = `
${fixedParser.includes("import") ? `${fixedParser.split("\n").find((line) => line.includes("import"))}\n` : ""}
const parser = ${fixedParser.replace(/import.*\n/, "")};
export const parse = parser.parse;
export const SyntaxError = parser.SyntaxError;
export default parser;
`;

				return {
					code,
					map: null,
				};
			} catch (error) {
				this.error(`Failed to process PegJS grammar: ${error.message}`, id);
			}
		},
	};
};
