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

  prooftree(content: unknown): unknown[] {
    const proofContent = typeof content === "string" ? content : "";

    parseCommands(proofContent);

    const proof = `\\begin{prooftree}${proofContent}\\end{prooftree}`;
    return [this.g.parseMath(proof, true)];
  }
}

// Default export
export default {
  parse,
  SyntaxError: BussproofsSyntaxError,
  Bussproofs,
};
