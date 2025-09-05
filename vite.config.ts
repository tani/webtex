import { exec } from "node:child_process";
import {
	cpSync,
	existsSync,
	mkdirSync,
	readFileSync,
	writeFileSync,
} from "node:fs";
import { promisify } from "node:util";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import ignoreInfiniteLoop from "./lib/pegjs-no-infinite-loop.mjs";
import pegjs from "./lib/vite-plugin-pegjs.mjs";

const execAsync = promisify(exec);

// Constants
const PLACEHOLDER_PACKAGES = [
	"geometry",
	"layout",
	"showframe",
	"luatextra",
	"lua-visual-debug",
];
const STATIC_ASSETS = [
	{ src: "src/css", dest: "dist/css", name: "CSS" },
	{ src: "src/fonts", dest: "dist/fonts", name: "font" },
	{ src: "src/js", dest: "dist/js", name: "JS" },
];

/**
 * Plugin to copy static assets during build
 */
function assetCopyPlugin() {
	return {
		name: "asset-copy",
		writeBundle() {
			console.log("Copying static assets...");

			// Copy standard assets
			for (const asset of STATIC_ASSETS) {
				if (existsSync(asset.src)) {
					cpSync(asset.src, asset.dest, { recursive: true });
					console.log(`Copied ${asset.name} assets`);
				}
			}

			// Copy KaTeX fonts
			copyKatexFonts();
		},
	};
}

/**
 * Plugin to compile TypeScript modules and CLI
 */
function typescriptModulesPlugin() {
	return {
		name: "typescript-modules",
		async writeBundle() {
			console.log("Building TypeScript modules...");

			try {
				await Promise.all([buildPackages(), buildDocumentClasses()]);

				await buildPackagePlaceholders();
				console.log("TypeScript modules built successfully!");
			} catch (error) {
				console.error("Error building TypeScript modules:", error);
				throw error;
			}
		},
	};
}

function copyKatexFonts() {
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
		console.warn("Could not copy KaTeX fonts:", (e as Error).message);
	}
}

async function buildPackages() {
	await execAsync(`tsc src/packages/*.ts --outDir dist/packages`);
	writeFileSync("dist/packages/.keep", "");
}

async function buildDocumentClasses() {
	await execAsync(`tsc src/documentclasses/*.ts --outDir dist/documentclasses`);
	writeFileSync("dist/documentclasses/.keep", "");
}

async function buildPackagePlaceholders() {
	const template = readFileSync("lib/package-placeholder-template.js", "utf8");
	mkdirSync("dist/packages", { recursive: true });

	for (const pkg of PLACEHOLDER_PACKAGES) {
		const className =
			pkg.charAt(0).toUpperCase() +
			pkg.slice(1).replace(/-(.)/g, (_m, c) => c.toUpperCase());
		writeFileSync(
			`dist/packages/${pkg}.js`,
			template.replace(/PACKAGE_NAME/g, className),
		);
	}
}

export default defineConfig(({ mode }) => {
	const isProd = mode === "production" || process.env.NODE_ENV === "production";

	return {
		build: {
			outDir: "dist",
			sourcemap: isProd,
			minify: isProd ? "terser" : false,
			lib: {
				entry: ["src/index.ts"],
				name: "LaTeX",
				formats: ["es"],
			},
			rollupOptions: {
				output: {
					format: "es",
					entryFileNames: "latex.js",
				},
			},
		},
		plugins: [
			pegjs({
				plugins: [ignoreInfiniteLoop],
				target: "es",
				exportVar: "parser",
				format: "bare",
				trace: false,
			}),
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
