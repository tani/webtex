import { exec } from "node:child_process";
import {
	cpSync,
	existsSync,
	mkdirSync,
	readFileSync,
	writeFileSync,
} from "node:fs";
import { promisify } from "node:util";
import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import { visualizer } from "rollup-plugin-visualizer";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import ignoreInfiniteLoop from "./lib/pegjs-no-infinite-loop.mjs";
import pegjs from "./lib/rollup-plugin-pegjs.mjs";

const execAsync = promisify(exec);

// Custom plugin to copy static assets
function assetCopyPlugin() {
	return {
		name: "asset-copy",
		configResolved() {
			mkdirSync("bin", { recursive: true });
		},
		writeBundle() {
			console.log("Copying static assets...");
			// Copy static assets
			if (existsSync("src/css")) {
				cpSync("src/css", "dist/css", { recursive: true });
				console.log("Copied CSS assets");
			}
			if (existsSync("src/fonts")) {
				cpSync("src/fonts", "dist/fonts", { recursive: true });
				console.log("Copied font assets");
			}
			if (existsSync("src/js")) {
				cpSync("src/js", "dist/js", { recursive: true });
				console.log("Copied JS assets");
			}

			// Copy KaTeX fonts
			try {
				const katexFonts = "node_modules/katex/dist/fonts";
				if (existsSync(katexFonts)) {
					mkdirSync("dist/fonts", { recursive: true });
					cpSync(katexFonts, "dist/fonts", {
						recursive: true,
						filter: (src) => src.endsWith(".woff2"),
					});
					console.log("Copied KaTeX fonts");
				}
			} catch (e) {
				console.warn("Could not copy KaTeX fonts:", e.message);
			}
		},
	};
}

// Custom plugin to compile TypeScript modules
function typescriptModulesPlugin() {
	return {
		name: "typescript-modules",
		async closeBundle() {
			console.log("Building TypeScript modules...");

			try {
				// Build packages
				await execAsync(
					"tsc src/packages/*.ts --outDir dist/packages --target ES2022 --module CommonJS --esModuleInterop --allowSyntheticDefaultImports --skipLibCheck",
				);

				// Build package placeholders
				const template = readFileSync(
					"lib/package-placeholder-template.js",
					"utf8",
				);
				const placeholderPackages = [
					"geometry",
					"layout",
					"showframe",
					"luatextra",
					"lua-visual-debug",
				];

				mkdirSync("dist/packages", { recursive: true });
				for (const pkg of placeholderPackages) {
					const className =
						pkg.charAt(0).toUpperCase() +
						pkg.slice(1).replace(/-(.)/g, (_m, c) => c.toUpperCase());
					writeFileSync(
						`dist/packages/${pkg}.js`,
						template.replace(/PACKAGE_NAME/g, className),
					);
				}
				writeFileSync("dist/packages/.keep", "");

				// Build documentclasses
				await execAsync(
					"tsc src/documentclasses/*.ts --outDir dist/documentclasses --target ES2022 --module CommonJS --esModuleInterop --allowSyntheticDefaultImports --skipLibCheck",
				);
				writeFileSync("dist/documentclasses/.keep", "");

				// Build CLI
				await execAsync(
					"tsc src/cli.ts --outDir bin --target ES2022 --module CommonJS --esModuleInterop --allowSyntheticDefaultImports --skipLibCheck --resolveJsonModule",
				);

				// Rename and make executable
				cpSync("bin/cli.js", "bin/latex.js");
				await execAsync("chmod +x bin/latex.js");

				console.log("TypeScript modules built successfully!");
			} catch (error) {
				console.error("Error building TypeScript modules:", error);
				throw error;
			}
		},
	};
}

export default defineConfig(({ mode }) => {
	const prod = mode === "production" || process.env.NODE_ENV === "production";

	return {
		build: {
			outDir: "dist",
			sourcemap: prod,
			minify: prod ? "terser" : false,
			lib: {
				entry: "src/index.ts",
			},
			rollupOptions: {
				plugins: [
					// Ensure resolution before PEG.js so its filter sees resolved paths
					resolve({ extensions: [".ts", ".js", ".mjs"], preferBuiltins: true }),
					pegjs({
						plugins: [ignoreInfiniteLoop],
						target: "commonjs",
						exportVar: "parser",
						format: "bare",
						trace: false,
					}),
					commonjs({ ignoreDynamicRequires: true }),
					visualizer({ filename: "dist/latex.stats.html", sourcemap: prod }),
				],
				output: [
					{
						format: "es",
						entryFileNames: "latex.mjs",
					},
					{
						format: "cjs",
						entryFileNames: "latex.js",
					},
				],
			},
		},
		plugins: [
			assetCopyPlugin(),
			typescriptModulesPlugin(),
			dts({
				tsconfigPath: "./tsconfig.json",
				include: ["src"],
				exclude: ["test", "**/*.test.*", "**/*.spec.*"],
				outDir: "dist/types",
				copyDtsFiles: true,
			}),
		],
	};
});
