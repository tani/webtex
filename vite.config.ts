import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import { visualizer } from "rollup-plugin-visualizer";
import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import pegjs from "./lib/rollup-plugin-pegjs.mjs";
import ignoreInfiniteLoop from "./lib/pegjs-no-infinite-loop.mjs";

export default defineConfig(({ mode }) => {
  const prod = mode === "production" || process.env.NODE_ENV === "production";

  return {
    build: {
      outDir: "dist",
      sourcemap: prod,
      minify: prod ? "terser" : false,
      lib: {
        entry: "src/index.ts",
        // UMD global name
        name: "latexjs",
      },
      rollupOptions: {
        // Keep bundling deps similar to current Rollup setup (no externals)
        plugins: [
          // Ensure resolution before PEG.js so its filter sees resolved paths
          resolve({ extensions: [".ts", ".js", ".mjs"], preferBuiltins: true }),
          pegjs({
            plugins: [ignoreInfiniteLoop],
            target: "commonjs",
            exportVar: "parser",
            format: "bare",
            trace: false,
          }),
          commonjs({ ignoreDynamicRequires: true }),
          visualizer({ filename: "dist/latex.stats.html", sourcemap: prod }),
        ],
        output: [
          {
            format: "es",
            entryFileNames: "latex.mjs",
          },
          {
            format: "umd",
            name: "latexjs",
            entryFileNames: "latex.js",
            plugins: [
              {
                name: "import-meta-to-umd",
                resolveImportMeta(property: string) {
                  if (property === "url") {
                    return "document.currentScript && document.currentScript.src";
                  }
                  return null as any;
                },
              },
            ],
          },
        ],
      },
    },
    plugins: [
      dts({
        tsconfigPath: "./tsconfig.json",
        include: ["src"],
        exclude: ["test", "**/*.test.*", "**/*.spec.*"],
        outDir: "dist/types",
        // Keep type output colocated but do not alter publish config here
        copyDtsFiles: true,
        // Silence diagnostics to avoid noisy TS overwrites in current sources
        skipDiagnostics: true,
      }),
    ],
  };
});
