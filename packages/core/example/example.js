import { spawn } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";

async function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: ["ignore", "pipe", "inherit"],
    });
    const chunks = [];
    child.stdout.on("data", (data) => {
      chunks.push(data);
    });
    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) {
        resolve(Buffer.concat(chunks).toString("utf8"));
      } else {
        reject(new Error(`${command} exited with code ${code}`));
      }
    });
  });
}

await mkdir("latexjs", { recursive: true });
await mkdir("webtex", { recursive: true });

const latexJsOutput = await run("npx", [
  "latex.js",
  "--pretty",
  "example.tex",
  "--assets=latexjs",
]);
await writeFile("latexjs/index.html", latexJsOutput, "utf8");

const webtexOutput = await run("node", [
  "../bin/webtex",
  "--pretty",
  "example.tex",
  "--assets=webtex",
]);
await writeFile("webtex/index.html", webtexOutput, "utf8");
