#!/usr/bin/env tsx
import { build } from "esbuild";
import { fs, path } from "zx";

// Build configuration
const srcDir = "src";
const distDir = "dist";
const publicDir = "public";

console.log("🔨 Building WebTeX App...");

// Clean dist directory
console.log("🧹 Cleaning distribution directory...");
await fs.remove(distDir);
await fs.ensureDir(distDir);

// Copy HTML file and process it
console.log("📄 Processing HTML file...");
const htmlContent = await fs.readFile(path.join(srcDir, "index.html"), "utf-8");
const processedHtml = htmlContent
  .replace(/src="\.\/main\.js"/g, 'src="./assets/main.js"')
  .replace(/href="\.\/styles\.css"/g, 'href="./assets/styles.css"');

await fs.writeFile(path.join(distDir, "index.html"), processedHtml);

// Bundle JavaScript with code splitting
console.log("📦 Bundling JavaScript with code splitting...");
await build({
  entryPoints: [path.join(srcDir, "main.js")],
  bundle: true,
  outdir: path.join(distDir, "assets"),
  format: "esm",
  target: "es2020",
  minify: true,
  sourcemap: true,
  splitting: true,
  chunkNames: "chunks/[name]-[hash]",
  external: [],
  define: {
    "process.env.NODE_ENV": '"production"',
  },
});

// Bundle CSS
console.log("🎨 Processing CSS...");
await build({
  entryPoints: [path.join(srcDir, "styles.css")],
  bundle: true,
  outfile: path.join(distDir, "assets", "styles.css"),
  minify: true,
  sourcemap: true,
});

// Copy public assets
console.log("📁 Copying public assets...");
if (await fs.pathExists(publicDir)) {
  await fs.copy(publicDir, distDir, { overwrite: true });
}

console.log("✅ Build completed successfully!");
