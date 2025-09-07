import { $ } from "bun";

await $`mkdir latexjs webtex`
await $`bun x latex.js --pretty example.tex --assets=latexjs > latexjs/index.html`;
await $`bun ../bin/webtex --pretty example.tex --assets=webtex > webtex/index.html`;
