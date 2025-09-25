#!/usr/bin/env tsx
import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { build } from "esbuild";

const srcDir = "src";
const distDir = "dist";
const publicDir = "public";

async function cleanDist(): Promise<void> {
  await rm(distDir, { recursive: true, force: true });
  await mkdir(distDir, { recursive: true });
}

async function writeHtml(): Promise<void> {
  const htmlPath = path.join(srcDir, "index.html");
  const htmlContent = await readFile(htmlPath, "utf8");
  const processedHtml = htmlContent
    .replace(/src="\.\/main\.js"/g, 'src="./assets/main.js"')
    .replace(/href="\.\/styles\.css"/g, 'href="./assets/styles.css"');
  await writeFile(path.join(distDir, "index.html"), processedHtml);
}

async function bundleScripts(): Promise<void> {
  await build({
    entryPoints: [path.join(srcDir, "main.js")],
    bundle: true,
    outdir: path.join(distDir, "assets"),
    format: "esm",
    target: "es2024",
    minify: true,
    sourcemap: true,
    define: {
      "process.env.NODE_ENV": '"production"',
    },
  });
}

async function bundleStyles(): Promise<void> {
  await build({
    entryPoints: [path.join(srcDir, "styles.css")],
    bundle: true,
    outfile: path.join(distDir, "assets", "styles.css"),
    minify: true,
    sourcemap: true,
  });
}

async function copyPublicAssets(): Promise<void> {
  try {
    await cp(publicDir, distDir, { recursive: true });
  } catch (error) {
    const err = error as NodeJS.ErrnoException;
    if (err.code !== "ENOENT") {
      throw error;
    }
  }
}

async function buildApp(): Promise<void> {
  await cleanDist();
  await writeHtml();
  await bundleScripts();
  await bundleStyles();
  await copyPublicAssets();
}

await buildApp();
