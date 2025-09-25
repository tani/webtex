import { existsSync, readFileSync } from "node:fs";
import { cp, mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";
import { build as esbuild } from "esbuild";
import peggy from "peggy";
import ignoreInfiniteLoop from "./lib/pegjs-no-infinite-loop.mjs";

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

function runCommand(command: string, args: readonly string[]): Promise<void> {
  const resolved = process.platform === "win32" ? `${command}.cmd` : command;
  return new Promise((resolve, reject) => {
    const child = spawn(resolved, args, { stdio: "inherit" });
    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(new Error(`${command} exited with code ${code}`));
    });
    child.on("error", reject);
  });
}

async function cleanDist(): Promise<void> {
  await rm(CONFIG.paths.distDir, { recursive: true, force: true });
}

async function generateParser(): Promise<void> {
  const grammar = readFileSync(CONFIG.paths.grammarFile, "utf8");
  const generatedParser = peggy.generate(grammar, {
    ...CONFIG.pegjs,
    plugins: [ignoreInfiniteLoop],
  });
  const transformedParser = transformGeneratedParser(generatedParser);
  await writeParser(transformedParser);
}

function transformGeneratedParser(generatedParser: string): string {
  let fixedParser = generatedParser
    .replace(
      /class peg\$SyntaxError extends SyntaxError/g,
      "class peg$SyntaxError extends globalThis.SyntaxError",
    )
    .replace(
      /const { Vector } = require\('\.\/types'\);/g,
      "import { Vector } from './types';",
    );

  const importMatch = fixedParser.match(/import[^;]+;\n?/);
  const importLine = importMatch ? importMatch[0] : "";

  if (importMatch) {
    fixedParser = fixedParser.replace(importMatch[0], "");
  }

  return [
    "// @ts-nocheck",
    importLine,
    `const parser = ${fixedParser};`,
    "export const parse = parser.parse;",
    "export const SyntaxError = parser.SyntaxError;",
    "export default parser;",
  ].join("\n");
}

async function writeParser(content: string): Promise<void> {
  await mkdir(path.dirname(CONFIG.paths.parserOutput), { recursive: true });
  await writeFile(CONFIG.paths.parserOutput, content);
}

async function bundleApplication(): Promise<void> {
  await esbuild({
    entryPoints: [CONFIG.paths.entrypoint],
    outdir: `${CONFIG.paths.distDir}/browser`,
    bundle: true,
    format: CONFIG.bundler.format,
    platform: "browser",
    minify: true,
    sourcemap: true,
  });

  await esbuild({
    entryPoints: [CONFIG.paths.entrypoint],
    outdir: `${CONFIG.paths.distDir}/node`,
    bundle: true,
    format: CONFIG.bundler.format,
    platform: "node",
    minify: true,
    sourcemap: true,
    banner: {
      js: "import { createRequire as __createRequire } from 'module';\nconst require = __createRequire(import.meta.url);",
    },
  });
}

async function copyStaticAssets(): Promise<void> {
  for (const asset of CONFIG.staticAssets) {
    if (!existsSync(asset.src)) {
      continue;
    }
    await mkdir(path.dirname(asset.dest), { recursive: true });
    await cp(asset.src, asset.dest, { recursive: true, force: true });
  }
}

async function generateTypeDeclarations(): Promise<void> {
  await runCommand("npx", [
    "tsc",
    "--emitDeclarationOnly",
    "--outDir",
    CONFIG.paths.typesDir,
    "--noEmit",
    "false",
  ]);
}

async function build(): Promise<void> {
  await cleanDist();
  await generateParser();
  await bundleApplication();
  await copyStaticAssets();
  await generateTypeDeclarations();
}

try {
  await build();
} catch (error) {
  console.error(error);
  process.exit(1);
}

export { build };
