import { describe, expect, test } from "vitest";
import {
  type BussproofsCommand,
  parseCommands,
} from "../../src/packages/bussproofs";

describe("bussproofs.parseCommands", () => {
  test("extracts a single AxiomC command", () => {
    const content = String.raw`Some text before \AxiomC{P \land Q} and after.`;
    const result = parseCommands(content);

    const expected: BussproofsCommand[] = [
      {
        type: "axiom",
        command: "AxiomC",
        content: String.raw`P \land Q`,
      },
    ];

    expect(result).toEqual(expected);
  });

  test("extracts multiple commands including abbreviations and arities", () => {
    const content = String.raw`
      \AxiomC{A}
      not a command: \% and \, and \\
      \BinaryInfC{B {C}}
      \AXC{D}
      \UIC{E}
      \TrinaryInfC{F}
      \unknown{X} % should be ignored
      \QuinaryInfC{G}
    `;

    const result = parseCommands(content);

    const expected: BussproofsCommand[] = [
      { type: "axiom", command: "AxiomC", content: "A" },
      { type: "inference", command: "BinaryInfC", arity: 2, content: "B {C}" },
      { type: "axiom", command: "AxiomC", abbreviated: true, content: "D" },
      {
        type: "inference",
        command: "UnaryInfC",
        arity: 1,
        abbreviated: true,
        content: "E",
      },
      { type: "inference", command: "TrinaryInfC", arity: 3, content: "F" },
      { type: "inference", command: "QuinaryInfC", arity: 5, content: "G" },
    ];

    expect(result).toEqual(expected);
  });

  test("handles nested braces in content", () => {
    const content = String.raw`\BinaryInfC{Outer {Inner {Deep}} content}`;
    const result = parseCommands(content);
    expect(result).toEqual([
      {
        type: "inference",
        command: "BinaryInfC",
        arity: 2,
        content: "Outer {Inner {Deep}} content",
      },
    ]);
  });

  test("returns empty when no known commands exist", () => {
    const content = String.raw`Just text, escapes like \\ and \% and unknown \Foo{bar}.`;
    const result = parseCommands(content);
    expect(result).toEqual([]);
  });
});
