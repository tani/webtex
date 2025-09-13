import { randomUUID } from "node:crypto";
import fs from "node:fs";
import { EOL, tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, test } from "vitest";
import pkg from "../package.json";
import { create as cmd } from "./lib/cmd";

const binFile = path.resolve(pkg.bin[pkg.name]);
const latexjs = cmd(binFile);

// Helper function to create temporary files
function createTempFile(postfix: string = ""): {
  name: string;
  removeCallback: () => void;
} {
  const fileName = path.join(tmpdir(), `test-${randomUUID()}${postfix}`);
  return {
    name: fileName,
    removeCallback: () => {
      try {
        if (fs.existsSync(fileName)) {
          fs.unlinkSync(fileName);
        }
      } catch (_error) {
        // Ignore cleanup errors
      }
    },
  };
}

describe("LaTeX.js CLI test", () => {
  test("get version", async () => {
    const result = await latexjs.execute(["-v"]);
    expect(result.stdout).toContain(pkg.version);
  });

  test("get help", async () => {
    const result = await latexjs.execute(["-h"]);
    expect(result).toBeDefined();
    expect(result.stdout).toContain("USAGE:");
    expect(result.stdout).toContain("OPTIONS:");
  });

  test("compile without output", async () => {
    const result = await latexjs.execute(["--version"]);
    expect(result.stdout).toContain(pkg.version + EOL);
  });

  test("compile with macro error", async () => {
    const tmpFile = createTempFile(".tex");
    fs.writeFileSync(tmpFile.name, "\\invalidcommand{test}");

    try {
      await latexjs.execute([tmpFile.name]);
      expect.fail("Should have thrown an error");
    } catch (result: unknown) {
      const err = result as { stderr: string };
      expect(err.stderr).toContain("unknown macro");
    } finally {
      tmpFile.removeCallback();
    }
  });

  test("compile with syntax error", async () => {
    const tmpFile = createTempFile(".tex");
    fs.writeFileSync(tmpFile.name, "This is text with { unmatched braces");

    try {
      await latexjs.execute([tmpFile.name]);
      expect.fail("Should have thrown an error");
    } catch (result: unknown) {
      const err = result as { stderr: string };
      expect(err.stderr).toContain("groups need to be balanced");
    } finally {
      tmpFile.removeCallback();
    }
  });

  test("compile to HTML", async () => {
    const tmpFile = createTempFile(".tex");
    const outputFile = createTempFile(".html");
    fs.writeFileSync(tmpFile.name, "Hello \\LaTeX{}!");

    const result = await latexjs.execute([tmpFile.name, "-o", outputFile.name]);
    try {
      // Successful execution won't have a code property
      expect(result.stdout).toBeDefined();
      const output = fs.readFileSync(outputFile.name, "utf8");
      expect(output).toContain("Hello");
      expect(output).toContain(
        '<span data-source-line="1" data-source-column="8" class="latex">L<span class="a" data-source-line="1" data-source-column="8">a</span>T<span class="e" data-source-line="1" data-source-column="8">e</span>X</span>',
      );
    } finally {
      tmpFile.removeCallback();
      outputFile.removeCallback();
    }
  });
});
