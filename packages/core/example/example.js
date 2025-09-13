import { $ } from "zx";

await $`mkdir -p latexjs webtex`;
await $`npx latex.js --pretty example.tex --assets=latexjs > latexjs/index.html`;
await $`node ../bin/webtex --pretty example.tex --assets=webtex > webtex/index.html`;
