import { spawn as spawnProcess } from "node:child_process";
import { promises as fs } from "node:fs";
import { EOL } from "node:os";
import path from "node:path";
import { describe, expect, test } from "vitest";

describe("LaTeX.js API test", () => {
	test("node module API", async () => {
		const node = spawnProcess("node", [path.join(__dirname, "api/node.js")], {
			env: {
				PATH: process.env.PATH,
			},
		});

		const result = await new Promise<string>((resolve, reject) => {
			let stdout = "";
			let stderr = "";
			node.stdout.on("data", (data) => {
				stdout += data.toString();
			});
			node.stderr.on("data", (data) => {
				stderr += data.toString();
			});
			node.on("exit", (code, _signal) => {
				if (code === 0) {
					resolve(stdout);
				} else {
					reject(stderr);
				}
			});
			node.on("error", (err) => {
				node.removeAllListeners("exit");
				reject(err);
			});
		});

		expect(result).toBe(
			'<html style="--size: 13.284px; --textwidth: 56.162%; --marginleftwidth: 21.919%; --marginrightwidth: 21.919%; --marginparwidth: 48.892%; --marginparsep: 14.612px; --marginparpush: 6.642px;"><head><title>untitled</title><meta charset="UTF-8"></meta><link type="text/css" rel="stylesheet" href="css/mathjax.css"><link type="text/css" rel="stylesheet" href="css/article.css"><script src="js/base.js"></script></head><body><div class="body"><p>Hi, this is a line of text.</p></div></body></html>' +
				EOL,
		);
	});

	test("node ES6 module API", async () => {
		const node = spawnProcess("node", [path.join(__dirname, "api/node.mjs")], {
			env: {
				PATH: process.env.PATH,
			},
		});

		const result = await new Promise<string>((resolve, reject) => {
			let stdout = "";
			let stderr = "";
			node.stdout.on("data", (data) => {
				stdout += data.toString();
			});
			node.stderr.on("data", (data) => {
				stderr += data.toString();
			});
			node.on("exit", (code, _signal) => {
				if (code === 0) {
					resolve(stdout);
				} else {
					reject(stderr);
				}
			});
			node.on("error", (err) => {
				node.removeAllListeners("exit");
				reject(err);
			});
		});

		expect(result).toBe(
			'<html style="--size: 13.284px; --textwidth: 56.162%; --marginleftwidth: 21.919%; --marginrightwidth: 21.919%; --marginparwidth: 48.892%; --marginparsep: 14.612px; --marginparpush: 6.642px;"><head><title>untitled</title><meta charset="UTF-8"></meta><link type="text/css" rel="stylesheet" href="css/mathjax.css"><link type="text/css" rel="stylesheet" href="css/article.css"><script src="js/base.js"></script></head><body><div class="body"><p>Hi, this is a line of text.</p></div></body></html>' +
				EOL,
		);
	});

	test("fs document API", async () => {
		const file = await fs.readFile(path.join(__dirname, "api/file.html"));
		expect(file.toString()).toBe(
			'<html style="--size: 13.284px; --textwidth: 56.162%; --marginleftwidth: 21.919%; --marginrightwidth: 21.919%; --marginparwidth: 48.892%; --marginparsep: 14.612px; --marginparpush: 6.642px;"><head><title>untitled</title><meta charset="UTF-8"></meta><link type="text/css" rel="stylesheet" href="css/mathjax.css"><link type="text/css" rel="stylesheet" href="css/article.css"><script src="js/base.js"></script></head><body><div class="body"><p>Hi, this is a line of text.</p></div></body></html>' +
				EOL,
		);
	});

	test("fs DOM API", async () => {
		const file = await fs.readFile(path.join(__dirname, "api/dom.html"));
		expect(file.toString()).toBe(
			`<div class="body"><p>Hi, this is a line of text.</p></div>${EOL}`,
		);
	});
});
