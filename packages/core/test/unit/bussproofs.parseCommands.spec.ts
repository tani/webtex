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

  test("extracts label commands correctly", () => {
    const content = String.raw`
      \AxiomC{A}
      \RightLabel{MP}
      \LeftLabel{Cut}
      \RL{$\to_E$}
      \LL{Hyp}
      \UnaryInfC{B}
    `;
    const result = parseCommands(content);

    const expected: BussproofsCommand[] = [
      { type: "axiom", command: "AxiomC", content: "A" },
      { type: "label", command: "RightLabel", content: "MP" },
      { type: "label", command: "LeftLabel", content: "Cut" },
      {
        type: "label",
        command: "RightLabel",
        abbreviated: true,
        content: String.raw`$\to_E$`,
      },
      {
        type: "label",
        command: "LeftLabel",
        abbreviated: true,
        content: "Hyp",
      },
      { type: "inference", command: "UnaryInfC", arity: 1, content: "B" },
    ];

    expect(result).toEqual(expected);
  });
});
