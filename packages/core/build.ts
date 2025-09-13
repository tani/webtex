import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { build as esbuild } from "esbuild";
import peggy from "peggy";
import { $ } from "zx";
import ignoreInfiniteLoop from "./lib/pegjs-no-infinite-loop.mjs";

// Build configuration
const CONFIG = {
  paths: {
    grammarFile: "src/latex-parser.pegjs",
    parserOutput: "src/latex-parser.ts",
    bussproofsGrammarFile: "src/bussproofs.pegjs",
    bussproofsParserOutput: "src/bussproofs.ts",
    distDir: "dist",
    typesDir: "dist/types",
    entrypoint: "src/index.ts",
  },
  bundler: {
    format: "esm" as const,
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
    const generatedParser = peggy.generate(grammar, {
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
 * Generate Bussproofs parser from PegJS grammar
 */
async function generateBussproofsParser(): Promise<void> {
  log.step("Generating Bussproofs parser from PegJS grammar...");
  const start = Date.now();

  try {
    // Check if bussproofs grammar file exists
    if (!existsSync(CONFIG.paths.bussproofsGrammarFile)) {
      log.info("Skipping bussproofs parser generation - grammar file not found");
      return;
    }

    // Read grammar file
    const grammar = readFileSync(CONFIG.paths.bussproofsGrammarFile, "utf8");

    // Generate parser
    const generatedParser = peggy.generate(grammar, {
      ...CONFIG.pegjs,
      exportVar: "bussproofsParser",
      plugins: [ignoreInfiniteLoop],
    });

    // Apply transformations for bussproofs parser
    const transformedParser = transformBussproofsParser(generatedParser);

    // Write parser file
    writeFileSync(CONFIG.paths.bussproofsParserOutput, transformedParser);

    log.timing("Generated Bussproofs parser", Date.now() - start);
  } catch (error) {
    throw new Error(`Failed to generate bussproofs parser: ${error}`);
  }
}

/**
 * Apply necessary transformations to the bussproofs parser
 */
function transformBussproofsParser(generatedParser: string): string {
  let fixedParser = generatedParser
    // Fix SyntaxError inheritance for global context
    .replace(
      /class peg\$SyntaxError extends SyntaxError/g,
      "class peg$SyntaxError extends globalThis.SyntaxError",
    )
    // Add any types to fix TypeScript errors
    .replace(/\(([^)]*)\) =>/g, (match, params) => {
      const typedParams = params.split(',').map((param: string) => {
        const trimmed = param.trim();
        if (trimmed && !trimmed.includes(':')) {
          return `${trimmed}: any`;
        }
        return trimmed;
      }).join(', ');
      return `(${typedParams}) =>`;
    })
    // Add type annotations for common variables
    .replace(/let peg\$result/g, 'let peg$result: any')
    .replace(/let bussproofsParser/g, 'let bussproofsParser: any')
    .replace(/function peg\$parse([^(]*)\(/g, 'function peg$parse$1(');

  // Add TypeScript export for the parser
  const tsExport = `
// Generated Bussproofs Parser from bussproofs.pegjs
// This file is auto-generated - do not edit manually
/* eslint-disable */
// @ts-nocheck

export interface BussproofsCommand {
  type: "axiom" | "inference";
  command: string;
  arity?: number;
  abbreviated?: boolean;
  content: string;
}

export interface BussproofsParser {
  parse(input: string): BussproofsCommand;
}

`;

  return (
    tsExport +
    fixedParser +
    "\n\nconst parser = bussproofsParser as BussproofsParser;\nexport default parser;\n"
  );
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
 * Bundle the application using esbuild
 */
async function bundleApplication(): Promise<void> {
  log.step("Bundling application...");
  const start = Date.now();

  try {
    // Browser bundle
    await esbuild({
      entryPoints: [CONFIG.paths.entrypoint],
      outfile: `${CONFIG.paths.distDir}/webtex.browser.js`,
      bundle: true,
      format: CONFIG.bundler.format,
      platform: "browser",
    });

    // Node bundle
    await esbuild({
      entryPoints: [CONFIG.paths.entrypoint],
      outfile: `${CONFIG.paths.distDir}/webtex.node.js`,
      bundle: true,
      format: CONFIG.bundler.format,
      platform: "node",
      banner: {
        js: "import { createRequire as __createRequire } from 'module';\nconst require = __createRequire(import.meta.url);",
      },
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
    await $`npx tsc --emitDeclarationOnly --outDir ${CONFIG.paths.typesDir} --noEmit false`;
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
    await generateBussproofsParser();
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

await build();

export { build };
