import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import terser from "@rollup/plugin-terser";
import typescript from "@rollup/plugin-typescript";
import { visualizer } from "rollup-plugin-visualizer";
import ignoreInfiniteLoop from "./lib/pegjs-no-infinite-loop.mjs";
import pegjs from "./lib/rollup-plugin-pegjs.mjs";

const prod = process.env.NODE_ENV === "production";

export default [
	{
		input: "src/index.ts",
		plugins: [
			// TypeScript compilation first
			typescript({
				tsconfig: "./tsconfig.json",
				include: ["src/**/*"],
				exclude: ["**/*.test.*", "**/*.spec.*", "test/**/*"],
				declaration: true,
				declarationDir: "dist/types",
			}),
			// resolve before pegjs so that the filter in pegjs has less left to do
			resolve({ extensions: [".ts", ".js", ".mjs"], preferBuiltins: true }),
			pegjs({
				plugins: [ignoreInfiniteLoop],
				target: "commonjs",
				exportVar: "parser",
				format: "bare",
				trace: false,
			}),
			commonjs({ ignoreDynamicRequires: true }),
			visualizer({
				filename: "dist/latex.stats.html",
				sourcemap: prod,
				// template: 'network'
			}),
		],
		output: [
			{
				file: "dist/latex.mjs",
				format: "es",
				sourcemap: prod,
				plugins: [...(prod ? [terser()] : [])],
			},
			{
				file: "dist/latex.js",
				format: "umd",
				name: "latexjs",
				sourcemap: prod,
				plugins: [
					{
						name: "import-meta-to-umd",
						resolveImportMeta(property) {
							if (property === "url") {
								return `document.currentScript && document.currentScript.src`;
							}
							return null;
						},
					},
					...(prod ? [terser()] : []),
				],
			},
		],
	},
];
