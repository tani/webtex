import { $ } from "bun";

await $`bun x latex.js --pretty example.tex > example_latexjs.html`;
await $`bun ../bin/webtex --pretty example.tex > example_webtex.html`;
