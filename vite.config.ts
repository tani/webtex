import {
	cpSync,
	existsSync,
	mkdirSync,
	readFileSync,
	writeFileSync,
} from "node:fs";
import path from "node:path";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import ignoreInfiniteLoop from "./lib/pegjs-no-infinite-loop.mjs";
import pegjs from "./lib/vite-plugin-pegjs.mjs";

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
		},
	};
}

/**
 * Plugin to generate package placeholders
 */
function packagePlaceholdersPlugin() {
	return {
		name: "package-placeholders",
		async writeBundle() {
			console.log("Building package placeholders...");

			try {
				await buildPackagePlaceholders();
				console.log("Package placeholders built successfully!");
			} catch (error) {
				console.error("Error building package placeholders:", error);
				throw error;
			}
		},
	};
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
			target: "esnext",
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
			packagePlaceholdersPlugin(),
			dts({
				tsconfigPath: "./tsconfig.json",
				include: ["src"],
				exclude: ["test", "**/*.test.*", "**/*.spec.*"],
				outDir: "dist/types",
				copyDtsFiles: true,
			}),
		],
		test: {
			environment: "node",
			include: ["test/**/*.ts", "test/**/*.js"],
			exclude: [
				"**/node_modules/**",
				"**/dist/**",
				"test/api/**/*.js",
				"test/api/**/*.mjs",
				"test/api/**/*.html",
				"test/lib/**",
				"test/types/**",
				"test/fixtures/**",
				"test/screenshots/**",
				"test/html/**",
				"test/**/__snapshots__/**",
			],
			setupFiles: ["test/lib/setup.ts"],
			pool: "threads",
			poolOptions: {
				threads: {
					singleThread: false,
				},
			},
			resolveSnapshotPath: (testPath: string, snapExtension: string) => {
				const dir = path.dirname(testPath);
				const filename = path
					.basename(testPath)
					.replace(/\.(test|spec)\.(js|ts)$/, "");
				return path.join(dir, "__snapshots__", `${filename}${snapExtension}`);
			},
		},
	};
});
