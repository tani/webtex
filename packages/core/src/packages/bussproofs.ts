import P from "parsimmon";
import type { PackageGenerator } from "../interfaces";

export interface BussproofsCommand {
  type: "axiom" | "inference";
  command: string;
  arity?: number;
  abbreviated?: boolean;
  content: string;
}

export interface Location {
  start: { offset: number; line: number; column: number };
  end: { offset: number; line: number; column: number };
}

export class BussproofsSyntaxError extends Error {
  public expected: string[];
  public found: string;
  public location: Location;

  constructor(
    message: string,
    expected: string[],
    found: string,
    location: Location,
  ) {
    super(message);
    this.name = "BussproofsSyntaxError";
    this.expected = expected;
    this.found = found;
    this.location = location;
  }
}

const createCommand = (
  type: "axiom" | "inference",
  command: string,
  content: string,
  arity?: number,
  abbreviated?: boolean,
): BussproofsCommand => ({
  type,
  command,
  content,
  ...(arity !== undefined && { arity }),
  ...(abbreviated !== undefined && { abbreviated }),
});

const whitespace = P.regexp(/\s*/);
const openBrace = P.string("{");
const closeBrace = P.string("}");

const rawBraceContent: P.Parser<string> = P.lazy(() => {
  const nonBraceChar = P.regexp(/[^{}]/);
  const nestedBraces = P.seq(openBrace, rawBraceContent, closeBrace).map(
    ([open, content, close]) => open + content + close,
  );

  return P.alt(nonBraceChar, nestedBraces)
    .many()
    .map((chars) => chars.join(""));
});

const bracedContent = P.seq(openBrace, rawBraceContent, closeBrace).map(
  ([, content]) => content,
);

const commandParser = (
  commandName: string,
  fullName: string,
  arity?: number,
) => {
  const isAbbreviated = commandName !== fullName;
  const type = arity === undefined ? "axiom" : "inference";

  return P.seq(P.string(`\\${commandName}`), whitespace, bracedContent).map(
    ([, , content]) =>
      createCommand(
        type as "axiom" | "inference",
        fullName,
        content,
        arity,
        isAbbreviated || undefined,
      ),
  );
};

const axiomCommand = commandParser("AxiomC", "AxiomC");
const unaryInfCommand = commandParser("UnaryInfC", "UnaryInfC", 1);
const binaryInfCommand = commandParser("BinaryInfC", "BinaryInfC", 2);
const trinaryInfCommand = commandParser("TrinaryInfC", "TrinaryInfC", 3);
const quaternaryInfCommand = commandParser(
  "QuaternaryInfC",
  "QuaternaryInfC",
  4,
);
const quinaryInfCommand = commandParser("QuinaryInfC", "QuinaryInfC", 5);

const axiomAbbreviated = commandParser("AXC", "AxiomC");
const unaryInfAbbreviated = commandParser("UIC", "UnaryInfC", 1);
const binaryInfAbbreviated = commandParser("BIC", "BinaryInfC", 2);
const trinaryInfAbbreviated = commandParser("TIC", "TrinaryInfC", 3);

const bussproofsCommand = P.alt(
  axiomCommand,
  unaryInfCommand,
  binaryInfCommand,
  trinaryInfCommand,
  quaternaryInfCommand,
  quinaryInfCommand,
  axiomAbbreviated,
  unaryInfAbbreviated,
  binaryInfAbbreviated,
  trinaryInfAbbreviated,
);

export const parse = (input: string): BussproofsCommand => {
  const result = bussproofsCommand.parse(input);

  if (result.status) {
    return result.value;
  }

  const location: Location = {
    start: {
      offset: result.index?.offset || 0,
      line: result.index?.line || 1,
      column: result.index?.column || 1,
    },
    end: {
      offset: result.index?.offset || 0,
      line: result.index?.line || 1,
      column: (result.index?.column || 1) + 1,
    },
  };

  throw new BussproofsSyntaxError(
    "Parse error: expected bussproofs command",
    result.expected || ["bussproofs command"],
    input.slice(result.index?.offset || 0, (result.index?.offset || 0) + 10),
    location,
  );
};

// biome-ignore lint/suspicious/noShadowRestrictedNames: intentional export alias
export const SyntaxError = BussproofsSyntaxError;

export interface BussproofsGenerator extends PackageGenerator {
  create(
    type: string | ((...args: unknown[]) => unknown),
    content?: unknown,
    className?: string,
  ): Element;
  createText(text: string): Text | undefined;
  createFragment(...args: unknown[]): unknown;
  parseMath(math: string, display?: boolean): unknown;
}

const createContentParser = () => {
  // Match one or more non-backslash characters to ensure progress
  const nonCommandChunk = P.regexp(/[^\\]+/);
  const escapedOrNonCommand = P.alt(
    // escaped backslash \\ or backslash followed by non-letter command, treat as text
    P.string("\\\\"),
    P.regexp(/\\[^A-Za-z]/),
  );
  // Consume unknown word-like commands (e.g., \foo) as plain text so parsing continues
  const unknownWordCommand = P.regexp(/\\[A-Za-z]+/);

  return P.alt(
    bussproofsCommand.map((cmd) => ({ type: "command" as const, value: cmd })),
    unknownWordCommand.map(() => ({ type: "text" as const, value: null })),
    escapedOrNonCommand.map(() => ({ type: "text" as const, value: null })),
    nonCommandChunk.map(() => ({ type: "text" as const, value: null })),
  ).many();
};

// Exported for unit testing
export const parseCommands = (content: string): BussproofsCommand[] => {
  const commands: BussproofsCommand[] = [];
  const contentParser = createContentParser();

  try {
    const result = contentParser.parse(content);
    if (result.status) {
      for (const item of result.value) {
        if (item.type === "command" && item.value) {
          commands.push(item.value);
        }
      }
    }
  } catch {
    console.warn("Failed to parse content for bussproofs commands");
  }

  return commands;
};

export class Bussproofs {
  static displayName = "Bussproofs";
  static environments: Record<string, unknown[]> = {
    prooftree: ["HV"],
  };

  private g: BussproofsGenerator;

  constructor(generator: BussproofsGenerator, _options?: unknown) {
    this.g = generator;
  }

  /**
   * Re-process LaTeX content with webtex to get HTML elements
   * Properly handles math expressions like $x$ and LaTeX commands
   */
  private processLatexContent(content: string): unknown[] {
    if (!content.trim()) {
      return [];
    }

    try {
      // Handle different types of math delimiters and convert them to the format MathJax expects
      const inlineMathMatch = content.match(/^\$(.+?)\$$/);
      const inlineParenMathMatch = content.match(/^\\\((.+?)\\\)$/);
      const displayMathMatch = content.match(/^\\\[(.+?)\\\]$/);
      const containsLatexCommands =
        /\\[a-zA-Z]+/.test(content) && !/^\$.*\$$/.test(content);

      if (inlineMathMatch) {
        // Inline math with $ delimiters - extract content and pass just the math content
        const mathContent = inlineMathMatch[1];
        const mathResult = this.g.parseMath(mathContent, false);
        return mathResult ? [mathResult] : [];
      } else if (inlineParenMathMatch) {
        // Inline math with \( \) delimiters - extract content and pass just the math content
        const mathContent = inlineParenMathMatch[1];
        const mathResult = this.g.parseMath(mathContent, false);
        return mathResult ? [mathResult] : [];
      } else if (displayMathMatch) {
        // Display math with \[ \] delimiters - extract content and pass just the math content
        const mathContent = displayMathMatch[1];
        const mathResult = this.g.parseMath(mathContent, true);
        return mathResult ? [mathResult] : [];
      } else if (containsLatexCommands) {
        // Process as LaTeX content (may contain other commands)
        const mathResult = this.g.parseMath(content, false);
        return mathResult ? [mathResult] : [];
      } else {
        // Process as plain text
        const textNode = this.g.createText?.(content);
        return textNode ? [textNode] : [];
      }
    } catch (error) {
      console.warn(
        "Failed to process LaTeX content, falling back to text:",
        content,
        error,
      );
      // Fallback: return the content as text
      const textNode = this.g.createText?.(content);
      return textNode ? [textNode] : [content];
    }
  }

  /**
   * Create a CSS grid-based proof tree layout
   */
  private createProofTree(
    premises: unknown[],
    conclusion: unknown,
    premiseCount: number,
  ): Element {
    // Create the main grid container
    const gridContainer = this.g.create(
      "div",
      undefined,
      `bussproofs-grid bussproofs-grid-${premiseCount}`,
    );

    // Set CSS grid properties
    const gridColumns = premiseCount * 2;
    (gridContainer as HTMLElement).style.cssText = `
      display: grid;
      grid-template-columns: repeat(${gridColumns}, auto);
      grid-template-rows: auto auto;
      gap: 0;
      border: 1px dotted #ccc; /* Debug border */
    `;

    // Add premise cells (top row)
    premises.forEach((premise, index) => {
      const premiseCell = this.g.create("div", premise, "bussproofs-premise");
      (premiseCell as HTMLElement).style.cssText = `
        grid-column: ${index * 2 + 1} / span 2;
        grid-row: 1;
        text-align: center;
        border: 1px dotted #999; /* Debug border for each cell */
      `;
      gridContainer.appendChild(premiseCell);
    });

    // Add conclusion cell (bottom row, spanning all columns)
    const conclusionCell = this.g.create(
      "div",
      conclusion,
      "bussproofs-conclusion",
    );
    (conclusionCell as HTMLElement).style.cssText = `
      grid-column: 1 / -1;
      grid-row: 2;
      text-align: center;
      border: 1px dotted #999; /* Debug border */
      border-top: 2px solid #000; /* Rule line */
    `;
    gridContainer.appendChild(conclusionCell);

    return gridContainer;
  }

  prooftree(content: unknown): unknown[] {
    const proofContent = typeof content === "string" ? content : "";

    const commands = parseCommands(proofContent);
    const stack: unknown[] = [];

    for (const command of commands) {
      // Process the command's content with webtex
      const processedContent = this.processLatexContent(command.content);
      const conclusionElement =
        processedContent.length > 0
          ? this.g.createFragment(...processedContent)
          : this.g.createText?.(command.content) || command.content;

      switch (command.command) {
        case "AxiomC":
          // Push the processed content to stack
          stack.push(conclusionElement);
          break;

        case "UnaryInfC":
          if (stack.length >= 1) {
            const premise1 = stack.pop();
            const proofTree = this.createProofTree(
              [premise1],
              conclusionElement,
              1,
            );
            stack.push(proofTree);
          } else {
            console.warn("UnaryInfC: not enough premises in stack");
            stack.push(conclusionElement);
          }
          break;

        case "BinaryInfC":
          if (stack.length >= 2) {
            const premise2 = stack.pop();
            const premise1 = stack.pop();
            const proofTree = this.createProofTree(
              [premise1, premise2],
              conclusionElement,
              2,
            );
            stack.push(proofTree);
          } else {
            console.warn("BinaryInfC: not enough premises in stack");
            stack.push(conclusionElement);
          }
          break;

        case "TrinaryInfC":
          if (stack.length >= 3) {
            const premise3 = stack.pop();
            const premise2 = stack.pop();
            const premise1 = stack.pop();
            const proofTree = this.createProofTree(
              [premise1, premise2, premise3],
              conclusionElement,
              3,
            );
            stack.push(proofTree);
          } else {
            console.warn("TrinaryInfC: not enough premises in stack");
            stack.push(conclusionElement);
          }
          break;

        case "QuaternaryInfC":
          if (stack.length >= 4) {
            const premise4 = stack.pop();
            const premise3 = stack.pop();
            const premise2 = stack.pop();
            const premise1 = stack.pop();
            const proofTree = this.createProofTree(
              [premise1, premise2, premise3, premise4],
              conclusionElement,
              4,
            );
            stack.push(proofTree);
          } else {
            console.warn("QuaternaryInfC: not enough premises in stack");
            stack.push(conclusionElement);
          }
          break;

        default:
          console.warn(`Unknown bussproofs command: ${command.command}`);
          stack.push(conclusionElement);
          break;
      }
    }

    // Return all remaining elements in the stack
    return stack.length > 0 ? stack : [];
  }
}

// Default export
export default {
  parse,
  SyntaxError: BussproofsSyntaxError,
  Bussproofs,
};
