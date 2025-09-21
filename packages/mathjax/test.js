import assert from "node:assert";
import { test } from "node:test";
import { tex2svg } from "./index.js";

test("tex2svg should convert simple LaTeX to SVG", async () => {
  const result = await tex2svg("x = y");
  assert(typeof result === "string", "Result should be a string");
  assert(result.includes("<svg"), "Result should contain SVG element");
});

test("tex2svg should handle display mode", async () => {
  const inline = await tex2svg("x = y", { display: false });
  const display = await tex2svg("x = y", { display: true });

  assert(typeof inline === "string", "Inline result should be a string");
  assert(typeof display === "string", "Display result should be a string");
  assert(inline.includes("<svg"), "Inline result should contain SVG");
  assert(display.includes("<svg"), "Display result should contain SVG");
});

test("tex2svg should handle empty input", async () => {
  const result = await tex2svg("");
  assert(typeof result === "string", "Result should be a string");
});

test("tex2svg should handle complex LaTeX expressions", async () => {
  const result = await tex2svg("\\frac{x^2 + y^2}{z}");
  assert(typeof result === "string", "Result should be a string");
  assert(result.includes("<svg"), "Result should contain SVG element");
});

test.after(() => {
  tex2svg[Symbol.dispose]();
});
