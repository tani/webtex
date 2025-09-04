import fs from "node:fs";
import { EOL } from "node:os";
import path from "node:path";
import tmp from "tmp";
import { describe, expect, test } from "vitest";
import pkg from "../package.json";
import { create as cmd } from "./lib/cmd";

const binFile = path.resolve(pkg.bin[pkg.name]);
const latexjs = cmd(binFile);

describe("LaTeX.js CLI test", () => {
	test("get version", async () => {
		const result = await latexjs.execute(["-V"]);
		expect(result.stdout).toContain(pkg.version + EOL);
	});

	test("get help", async () => {
		const result = await latexjs.execute(["-h"]);
		expect(result).toBeDefined();
		expect(result.stdout).toContain(pkg.description);
	});

	test("compile without output", async () => {
		const result = await latexjs.execute(["--version"]);
		expect(result.stdout).toContain(pkg.version + EOL);
	});

	test("compile with macro error", async () => {
		const tmpFile = tmp.fileSync({ postfix: ".tex" });
		fs.writeFileSync(tmpFile.name, "\\invalidcommand{test}");

		try {
			await latexjs.execute([tmpFile.name]);
			expect.fail("Should have thrown an error");
		} catch (result: any) {
			expect(result.stderr).toContain("unknown macro");
		} finally {
			tmpFile.removeCallback();
		}
	});

	test("compile with syntax error", async () => {
		const tmpFile = tmp.fileSync({ postfix: ".tex" });
		fs.writeFileSync(tmpFile.name, "This is text with { unmatched braces");

		try {
			await latexjs.execute([tmpFile.name]);
			expect.fail("Should have thrown an error");
		} catch (result: any) {
			expect(result.stderr).toContain("groups need to be balanced");
		} finally {
			tmpFile.removeCallback();
		}
	});

	test("compile to HTML", async () => {
		const tmpFile = tmp.fileSync({ postfix: ".tex" });
		const outputFile = tmp.fileSync({ postfix: ".html" });
		fs.writeFileSync(tmpFile.name, "Hello \\LaTeX{}!");

		const result = await latexjs.execute([tmpFile.name, "-o", outputFile.name]);
		try {
			// Successful execution won't have a code property
			expect(result.stdout).toBeDefined();
			const output = fs.readFileSync(outputFile.name, "utf8");
			expect(output).toContain("Hello");
			expect(output).toContain(
				'<span class="latex">L<span class="a">a</span>T<span class="e">e</span>X</span>',
			);
		} finally {
			tmpFile.removeCallback();
			outputFile.removeCallback();
		}
	});
});
