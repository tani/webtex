#!/usr/bin/env bun

/**
 * Build script for VSCode extension using Bun's build API
 * Optimized for small VSCode packages with minimal dependencies
 */

import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
// Type declaration for Bun build API
import { $, build } from "bun";

// Handle __dirname in ES modules (with Bun compatibility)
interface ImportMeta {
  dir?: string;
}

const __dirname =
  typeof (import.meta as ImportMeta).dir !== "undefined"
    ? ((import.meta as ImportMeta).dir as string)
    : path.dirname(fileURLToPath(import.meta.url));

interface BuildOptions {
  clean?: boolean;
  watch?: boolean;
  production?: boolean;
}

async function copyWebTexFiles() {
  console.log("📦 Copying WebTeX core files...");

  const coreDistPath = path.join(__dirname, "..", "core", "dist");
  const localWebtexPath = path.join(__dirname, "webtex");

  if (!existsSync(coreDistPath)) {
    throw new Error(
      "Core package dist directory not found. Please build the core package first with 'bun run compile:core'",
    );
  }

  // Create local webtex directory and copy files
  await $`mkdir -p ${localWebtexPath}`;
  await $`cp -r ${coreDistPath}/* ${localWebtexPath}/`;

  console.log("✅ WebTeX core files copied successfully");
}

async function buildExtension(options: BuildOptions = {}) {
  const { clean = false, watch = false, production = false } = options;

  console.log(
    `🔨 Building VSCode extension${production ? " (production)" : ""}${watch ? " (watch mode)" : ""}...`,
  );

  // Clean output and WebTeX directories if requested
  if (clean) {
    console.log("🧹 Cleaning directories...");
    await $`rm -rf out webtex`;
  }

  // Copy WebTeX core files
  await copyWebTexFiles();

  const buildConfig = {
    entrypoints: ["./src/extension.ts"],
    outdir: "./out",
    target: "node" as const,
    format: "cjs" as const, // VSCode extensions need CommonJS
    minify: production,
    sourcemap: production ? ("none" as const) : ("inline" as const),
    external: [
      "vscode", // Always external - provided by VSCode runtime
      "mocha", // Test dependencies
      "@vscode/test-electron",
      "@vscode/test-cli",
    ],
    define: {
      "process.env.NODE_ENV": production ? '"production"' : '"development"',
    },
    compile: true,
  };

  try {
    if (watch) {
      console.log("👀 Starting watch mode...");
      // Note: Bun's watch API might evolve, this is a basic implementation
      const watcher = require("node:fs").watch(
        path.join(__dirname, "src"),
        { recursive: true },
        async (_eventType: string, filename: string) => {
          if (filename?.endsWith(".ts") || filename?.endsWith(".js")) {
            console.log(`📝 File changed: ${filename}, rebuilding...`);
            await buildOnce();
          }
        },
      );

      // Initial build
      await buildOnce();

      console.log("✅ Watch mode started. Press Ctrl+C to stop.");

      // Keep process alive
      process.on("SIGINT", () => {
        console.log("\n👋 Stopping watch mode...");
        watcher.close();
        process.exit(0);
      });

      // Keep the process running
      await new Promise(() => {});
    } else {
      await buildOnce();
    }
  } catch (error) {
    console.error("❌ Build failed:", error);
    process.exit(1);
  }

  async function buildOnce() {
    const startTime = performance.now();

    const result = await build(buildConfig);

    if (result.success) {
      const duration = Math.round(performance.now() - startTime);
      const outputCount = result.outputs.length;
      console.log(
        `✅ Build completed successfully in ${duration}ms (${outputCount} files)`,
      );

      if (!production) {
        console.log("📁 Output files:");
        for (const output of result.outputs) {
          const relativePath = path.relative(__dirname, output.path);
          console.log(`   ${relativePath}`);
        }
      }
    } else {
      console.error("❌ Build failed");
      if (result.logs.length > 0) {
        for (const log of result.logs) {
          console.error(log.message);
        }
      }
      process.exit(1);
    }
  }
}

// CLI argument parsing
function parseArgs(): BuildOptions {
  const args = process.argv.slice(2);
  return {
    clean: args.includes("--clean") || args.includes("-c"),
    watch: args.includes("--watch") || args.includes("-w"),
    production:
      args.includes("--production") ||
      args.includes("--prod") ||
      args.includes("-p"),
  };
}

// Run if called directly
if (import.meta.main) {
  const options = parseArgs();
  await buildExtension(options);
}

export { buildExtension };
