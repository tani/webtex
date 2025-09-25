import { existsSync } from "node:fs";
import { cp, mkdir, readdir, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as esbuild from "esbuild";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

interface BuildOptions {
  clean?: boolean;
  watch?: boolean;
  production?: boolean;
}

async function copyWebTexFiles(): Promise<void> {
  const coreDistPath = path.join(__dirname, "..", "core", "dist");
  const localWebtexPath = path.join(__dirname, "webtex");

  if (!existsSync(coreDistPath)) {
    throw new Error(
      "Core package dist directory not found. Run the core build first.",
    );
  }

  await mkdir(localWebtexPath, { recursive: true });
  const entries = await readdir(coreDistPath);
  for (const entry of entries) {
    const source = path.join(coreDistPath, entry);
    const target = path.join(localWebtexPath, entry);
    await cp(source, target, { recursive: true, force: true });
  }
}

function getExtensionConfig(production: boolean): esbuild.BuildOptions {
  return {
    entryPoints: ["./src/extension.ts"],
    outdir: "./out",
    platform: "node",
    format: "cjs",
    bundle: true,
    minify: production,
    sourcemap: production ? false : "inline",
    external: ["vscode", "mocha", "@vscode/test-electron", "@vscode/test-cli"],
    define: {
      "process.env.NODE_ENV": production ? '"production"' : '"development"',
    },
  };
}

function getPreviewConfig(production: boolean): esbuild.BuildOptions {
  return {
    entryPoints: ["./src/preview.ts"],
    outfile: "./media/preview.js",
    platform: "browser",
    format: "iife",
    bundle: true,
    minify: production,
    sourcemap: production ? false : "inline",
    define: {
      "process.env.NODE_ENV": production ? '"production"' : '"development"',
    },
  };
}

async function buildExtension(options: BuildOptions = {}): Promise<void> {
  const { clean = false, watch = false, production = false } = options;

  if (clean) {
    await Promise.all([
      rm("out", { recursive: true, force: true }),
      rm("webtex", { recursive: true, force: true }),
    ]);
    return;
  }

  await copyWebTexFiles();

  const extensionConfig = getExtensionConfig(production);
  const previewConfig = getPreviewConfig(production);

  if (watch) {
    const extensionCtx = await esbuild.context(extensionConfig);
    const previewCtx = await esbuild.context(previewConfig);
    await Promise.all([extensionCtx.watch(), previewCtx.watch()]);
    process.on("SIGINT", () => {
      void extensionCtx.dispose();
      void previewCtx.dispose();
      process.exit(0);
    });
    await new Promise(() => {});
    return;
  }

  await Promise.all([
    esbuild.build(extensionConfig),
    esbuild.build(previewConfig),
  ]);
}

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

const options = parseArgs();
void buildExtension(options).catch((error) => {
  console.error(error);
  process.exit(1);
});

export { buildExtension };
