import { cpSync, existsSync } from "node:fs";
import path from "node:path";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import ignoreInfiniteLoop from "./lib/pegjs-no-infinite-loop.mjs";
import pegjs from "./lib/vite-plugin-pegjs.mjs";

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
				name: "WebTeX",
				formats: ["es"],
			},
			rollupOptions: {
				external: ["mathjax"],
				output: {
					format: "es",
					entryFileNames: "webtex.js",
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
