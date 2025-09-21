import { existsSync, writeFileSync } from "node:fs";
import { build as esbuild } from "esbuild";
import inlineWorker from "esbuild-plugin-inline-worker";
import { $ } from "zx";

const CONFIG = {
  paths: {
    entrypoint: "index.ts",
    distDir: "dist",
    typesDir: "dist/types",
    workerFile: "mathjax.worker.ts",
  },
  bundler: {
    format: "esm" as const,
  },
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
    if (existsSync(CONFIG.paths.distDir)) {
      await $`rm -rf ${CONFIG.paths.distDir}`;
    }
    log.timing("Cleaned distribution directory", Date.now() - start);
  } catch (error) {
    throw new Error(`Failed to clean dist directory: ${error}`);
  }
}

/**
 * Bundle the application using esbuild with inline worker support
 */
async function bundleApplication(): Promise<void> {
  log.step("Bundling application with inline worker support...");
  const start = Date.now();

  try {
    // Browser bundle with inline worker
    await esbuild({
      entryPoints: [CONFIG.paths.entrypoint],
      outdir: `${CONFIG.paths.distDir}/browser`,
      bundle: true,
      format: CONFIG.bundler.format,
      platform: "browser",
      minify: true,
      sourcemap: true,
      target: ["es2022"],
      define: {
        "process.env.NODE_ENV": '"production"',
      },
      plugins: [
        inlineWorker(),
      ],
    });

    // Node bundle with inline worker (for server-side rendering)
    await esbuild({
      entryPoints: [CONFIG.paths.entrypoint],
      outdir: `${CONFIG.paths.distDir}/node`,
      bundle: true,
      format: CONFIG.bundler.format,
      platform: "node",
      minify: true,
      sourcemap: true,
      target: ["node22"],
      define: {
        "process.env.NODE_ENV": '"production"',
      },
      banner: {
        js: "import { createRequire as __createRequire } from 'module';\nconst require = __createRequire(import.meta.url);",
      },
      plugins: [
        inlineWorker(),
      ],
    });

    log.timing("Bundled application", Date.now() - start);
  } catch (error) {
    throw new Error(`Failed to bundle application: ${error}`);
  }
}

/**
 * Generate TypeScript declaration files
 */
async function generateTypeDeclarations(): Promise<void> {
  log.step("Generating TypeScript declarations...");
  const start = Date.now();

  try {
    await $`npx tsc --emitDeclarationOnly --outDir ${CONFIG.paths.typesDir} --declaration --declarationMap`;
    log.timing("Generated TypeScript declarations", Date.now() - start);
  } catch (error) {
    throw new Error(`Failed to generate type declarations: ${error}`);
  }
}

/**
 * Create package.json files for different output formats
 */
async function createPackageFiles(): Promise<void> {
  log.step("Creating package.json files for output formats...");
  const start = Date.now();

  try {
    // Browser package.json
    const browserPackage = {
      type: "module",
      main: "./index.js",
    };
    writeFileSync(
      `${CONFIG.paths.distDir}/browser/package.json`,
      JSON.stringify(browserPackage, null, 2)
    );

    // Node package.json  
    const nodePackage = {
      type: "module",
      main: "./index.js",
    };
    writeFileSync(
      `${CONFIG.paths.distDir}/node/package.json`, 
      JSON.stringify(nodePackage, null, 2)
    );

    log.timing("Created package.json files", Date.now() - start);
  } catch (error) {
    throw new Error(`Failed to create package files: ${error}`);
  }
}

/**
 * Main build function
 */
async function build(): Promise<void> {
  const totalStart = Date.now();
  log.info("Starting WebTeX MathJax build process...");

  try {
    await cleanDist();
    await bundleApplication();
    await generateTypeDeclarations();
    await createPackageFiles();

    const totalTime = Date.now() - totalStart;
    log.success(`Build completed successfully!`);
    log.timing("Total build time", totalTime);
  } catch (error) {
    log.error(
      `Build failed: ${error instanceof Error ? error.message : String(error)}`
    );
    process.exit(1);
  }
}

// Run build when script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  await build();
}

export { build };