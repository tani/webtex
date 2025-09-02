import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import pegjs from "./lib/rollup-plugin-pegjs.mjs";
import terser from "@rollup/plugin-terser";
import { visualizer } from "rollup-plugin-visualizer";
import ignoreInfiniteLoop from "./lib/pegjs-no-infinite-loop.mjs";

const prod = process.env.NODE_ENV === "production"

export default [{
    input: "src/index.mjs",
    plugins: [
        // resolve before pegjs so that the filter in pegjs has less left to do
        resolve({extensions: [".js", ".mjs"], preferBuiltins: true}),
        pegjs({plugins: [ignoreInfiniteLoop], target: "commonjs", exportVar: "parser", format: "bare", trace: false}),
        commonjs({ ignoreDynamicRequires: true }),
        visualizer({
            filename: 'dist/latex.stats.html',
            sourcemap: prod,
            // template: 'network'
        })
    ],
    output: [{
        file: "dist/latex.mjs",
        format: "es",
        sourcemap: prod,
        plugins: [...(prod ? [terser()] : [])]
    }, {
        file: "dist/latex.js",
        format: "umd",
        name: "latexjs",
        sourcemap: prod,
        plugins: [
            {
                name: 'import-meta-to-umd',
                resolveImportMeta(property) {
                    if (property === 'url') {
                      return `document.currentScript && document.currentScript.src`;
                    }
                    return null;
                }
            },
            ...(prod ? [terser()] : [])
        ]
    }]
}]
