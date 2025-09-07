import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { $, build as bunBuild } from "bun";
import { generate } from "peggy";
import ignoreInfiniteLoop from "./lib/pegjs-no-infinite-loop.mjs";

// Build configuration
const CONFIG = {
	paths: {
		grammarFile: "src/latex-parser.pegjs",
		parserOutput: "src/latex-parser.ts",
		distDir: "dist",
		typesDir: "dist/types",
		entrypoint: "src/index.ts",
	},
	bundler: {
		format: "esm" as const,
		target: "browser" as const,
		outputName: "webtex.js",
		external: ["svgdom"] as string[],
	},
	pegjs: {
		output: "source" as const,
		target: "es" as const,
		exportVar: "parser",
		format: "bare" as const,
		trace: false,
	},
	staticAssets: [{ src: "src/css", dest: "dist/css" }],
} as const;

// Logging utilities
const log = {
	info: (msg: string) => console.log(`ℹ️  ${msg}`),
	success: (msg: string) => console.log(`✅ ${msg}`),
	error: (msg: string) => console.error(`❌ ${msg}`),
	step: (msg: string) => console.log(`🔨 ${msg}`),
	timing: (msg: string, time: number) => console.log(`⏱️  ${msg} (${time}ms)`),
};

/**
 * Clean the distribution directory
 */
async function cleanDist(): Promise<void> {
	log.step("Cleaning distribution directory...");
	const start = Date.now();

	try {
		await $`rm -rf ${CONFIG.paths.distDir}`;
		log.timing("Cleaned distribution directory", Date.now() - start);
	} catch (error) {
		throw new Error(`Failed to clean dist directory: ${error}`);
	}
}

/**
 * Generate LaTeX parser from PegJS grammar
 */
async function generateParser(): Promise<void> {
	log.step("Generating LaTeX parser from PegJS grammar...");
	const start = Date.now();

	try {
		// Read grammar file
		const grammar = readFileSync(CONFIG.paths.grammarFile, "utf8");

		// Generate parser
		const generatedParser = generate(grammar, {
			...CONFIG.pegjs,
			plugins: [ignoreInfiniteLoop],
		});

		// Apply transformations
		const transformedParser = transformGeneratedParser(generatedParser);

		// Write parser file
		writeFileSync(CONFIG.paths.parserOutput, transformedParser);

		log.timing("Generated LaTeX parser", Date.now() - start);
	} catch (error) {
		throw new Error(`Failed to generate parser: ${error}`);
	}
}

/**
 * Apply necessary transformations to the generated parser
 */
function transformGeneratedParser(generatedParser: string): string {
	let fixedParser = generatedParser
		// Fix SyntaxError inheritance for global context
		.replace(
			/class peg\$SyntaxError extends SyntaxError/g,
			"class peg$SyntaxError extends globalThis.SyntaxError",
		)
		// Convert require to import for ES modules
		.replace(
			/const { Vector } = require\('\.\/types'\);/g,
			"import { Vector } from './types';",
		);

	// Extract and reorganize imports
	const importMatch = fixedParser.match(/import[^;]+;\n?/);
	const importLine = importMatch ? importMatch[0] : "";

	if (importMatch) {
		fixedParser = fixedParser.replace(importMatch[0], "");
	}

	// Generate final parser code with proper exports
	return [
		"// @ts-nocheck",
		importLine,
		`const parser = ${fixedParser};`,
		"export const parse = parser.parse;",
		"export const SyntaxError = parser.SyntaxError;",
		"export default parser;",
	].join("\n");
}

/**
 * Bundle the application using Bun's bundler
 */
async function bundleApplication(): Promise<void> {
	log.step("Bundling application...");
	const start = Date.now();

	try {
		await bunBuild({
			entrypoints: [CONFIG.paths.entrypoint],
			outdir: CONFIG.paths.distDir,
			format: CONFIG.bundler.format,
			target: CONFIG.bundler.target,
			naming: {
				entry: CONFIG.bundler.outputName,
			},
			external: CONFIG.bundler.external,
		});

		log.timing("Bundled application", Date.now() - start);
	} catch (error) {
		throw new Error(`Failed to bundle application: ${error}`);
	}
}

/**
 * Copy static assets to distribution directory
 */
async function copyStaticAssets(): Promise<void> {
	log.step("Copying static assets...");
	const start = Date.now();
	let copiedCount = 0;

	try {
		for (const asset of CONFIG.staticAssets) {
			if (existsSync(asset.src)) {
				await $`cp -r ${asset.src} ${asset.dest}`;
				copiedCount++;
			} else {
				log.info(`Skipping missing asset: ${asset.src}`);
			}
		}

		log.timing(`Copied ${copiedCount} static asset(s)`, Date.now() - start);
	} catch (error) {
		throw new Error(`Failed to copy static assets: ${error}`);
	}
}

/**
 * Generate TypeScript declaration files
 */
async function generateTypeDeclarations(): Promise<void> {
	log.step("Generating TypeScript declarations...");
	const start = Date.now();

	try {
		await $`bun x tsc --emitDeclarationOnly --outDir ${CONFIG.paths.typesDir} --noEmit false`;
		log.timing("Generated TypeScript declarations", Date.now() - start);
	} catch (error) {
		throw new Error(`Failed to generate type declarations: ${error}`);
	}
}

/**
 * Main build function
 */
async function build(): Promise<void> {
	const totalStart = Date.now();
	log.info("Starting WebTeX build process...");

	try {
		await cleanDist();
		await generateParser();
		await bundleApplication();
		await copyStaticAssets();
		await generateTypeDeclarations();

		const totalTime = Date.now() - totalStart;
		log.success(`Build completed successfully!`);
		log.timing("Total build time", totalTime);
	} catch (error) {
		log.error(
			`Build failed: ${error instanceof Error ? error.message : String(error)}`,
		);
		process.exit(1);
	}
}

// Execute build if this script is run directly
if (import.meta.main) {
	build();
}

export { build };
