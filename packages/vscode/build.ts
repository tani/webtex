/**
 * Build script for VSCode extension using esbuild
 * Optimized for small VSCode packages with minimal dependencies
 */

import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { build as esbuild } from "esbuild";
import { $ } from "zx";

// Handle __dirname in ES modules
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
      "Core package dist directory not found. Please build the core package first with 'npm run compile:core'",
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
    console.log("✅ Clean completed successfully");
    return;
  }

  // Copy WebTeX core files
  await copyWebTexFiles();

  const buildConfig = {
    entryPoints: ["./src/extension.ts"],
    outdir: "./out",
    platform: "node" as const,
    format: "cjs" as const, // VSCode extensions need CommonJS
    bundle: true,
    minify: production,
    sourcemap: production ? false : "inline",
    external: [
      "vscode", // Always external - provided by VSCode runtime
      "mocha", // Test dependencies
      "@vscode/test-electron",
      "@vscode/test-cli",
    ],
    define: {
      "process.env.NODE_ENV": production ? '"production"' : '"development"',
    },
    metafile: !production,
  } as const;

  try {
    if (watch) {
      console.log("👀 Starting watch mode...");
      const ctx = await esbuild.context(buildConfig);
      await ctx.watch();
      console.log("✅ Watch mode started. Press Ctrl+C to stop.");
      process.on("SIGINT", () => {
        console.log("\n👋 Stopping watch mode...");
        ctx.dispose();
        process.exit(0);
      });
      await new Promise(() => {});
    } else {
      const startTime = performance.now();
      const result = await esbuild(buildConfig);
      const duration = Math.round(performance.now() - startTime);
      console.log(`✅ Build completed successfully in ${duration}ms`);
      if (!production && result.metafile) {
        console.log("📁 Output files:");
        for (const output of Object.keys(result.metafile.outputs)) {
          const relativePath = path.relative(__dirname, output);
          console.log(`   ${relativePath}`);
        }
      }
    }
  } catch (error) {
    console.error("❌ Build failed:", error);
    process.exit(1);
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
const options = parseArgs();
(async () => {
  await buildExtension(options);
})();

export { buildExtension };
