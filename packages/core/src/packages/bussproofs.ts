import P from "parsimmon";
import type { PackageGenerator } from "../interfaces";

// Type definitions
export type CommandType = "axiom" | "inference" | "label";
export type InferenceArity = 1 | 2 | 3 | 4 | 5;
export type LabelType = "left" | "right";

export interface BussproofsCommand {
  type: CommandType;
  command: string;
  arity?: InferenceArity;
  abbreviated?: boolean;
  content: string;
}

// Parser configuration constants
const PARSER_PATTERNS = {
  WHITESPACE: /\s*/,
  NON_BRACE_CHAR: /[^{}]/,
  NON_COMMAND_CHUNK: /[^\\]+/,
  ESCAPED_OR_NON_COMMAND: /\\[^A-Za-z]/,
  UNKNOWN_WORD_COMMAND: /\\[A-Za-z]+/,
  LATEX_COMMANDS: /\\[a-zA-Z]+/,
  INLINE_MATH_DOLLAR: /^\$(.+?)\$$/,
  INLINE_MATH_PAREN: /^\\\((.+?)\\\)$/,
  DISPLAY_MATH_BRACKET: /^\\\[(.+?)\\\]$/,
} as const;

const MATH_PATTERNS: readonly { regex: RegExp; display: boolean }[] = [
  { regex: PARSER_PATTERNS.INLINE_MATH_DOLLAR, display: false },
  { regex: PARSER_PATTERNS.INLINE_MATH_PAREN, display: false },
  { regex: PARSER_PATTERNS.DISPLAY_MATH_BRACKET, display: true },
];

const INFERENCE_ARITY: Partial<Record<string, InferenceArity>> = {
  UnaryInfC: 1,
  BinaryInfC: 2,
  TrinaryInfC: 3,
  QuaternaryInfC: 4,
  QuinaryInfC: 5,
};

const LABEL_TARGET: Partial<Record<string, LabelType>> = {
  LeftLabel: "left",
  RightLabel: "right",
};

// CSS class names
const CSS_CLASSES = {
  GRID: "bussproofs-grid",
  OUTER_WRAPPER: "bussproofs-outer-wrapper",
  INNER_WRAPPER: "bussproofs-inner-wrapper",
  LEFT_LABEL: "bussproofs-left-label",
  RIGHT_LABEL: "bussproofs-right-label",
  PREMISE: "bussproofs-premise",
  CONCLUSION: "bussproofs-conclusion",
  PROOF_COLUMN: "bussproofs-proof-column",
  PREMISES_ROW: "bussproofs-premises-row",
} as const;

// Command definitions for better maintainability
interface CommandDefinition {
  name: string;
  abbrev: string | null;
  type: CommandType;
  arity?: InferenceArity;
}

const COMMAND_DEFINITIONS: readonly CommandDefinition[] = [
  { name: "AxiomC", abbrev: "AXC", type: "axiom" },
  { name: "UnaryInfC", abbrev: "UIC", type: "inference", arity: 1 },
  { name: "BinaryInfC", abbrev: "BIC", type: "inference", arity: 2 },
  { name: "TrinaryInfC", abbrev: "TIC", type: "inference", arity: 3 },
  { name: "QuaternaryInfC", abbrev: null, type: "inference", arity: 4 },
  { name: "QuinaryInfC", abbrev: null, type: "inference", arity: 5 },
  { name: "RightLabel", abbrev: "RL", type: "label" },
  { name: "LeftLabel", abbrev: "LL", type: "label" },
] as const;

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
  type: CommandType,
  command: string,
  content: string,
  arity?: InferenceArity,
  abbreviated?: boolean,
): BussproofsCommand => ({
  type,
  command,
  content,
  ...(arity !== undefined && { arity }),
  ...(abbreviated !== undefined && { abbreviated }),
});

// Basic parser components
const whitespace = P.regexp(PARSER_PATTERNS.WHITESPACE);
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
  arity?: InferenceArity,
  type?: CommandType,
) => {
  const isAbbreviated = commandName !== fullName;
  const commandType = type || (arity === undefined ? "axiom" : "inference");

  return P.seq(P.string(`\\${commandName}`), whitespace, bracedContent).map(
    ([, , content]) =>
      createCommand(
        commandType,
        fullName,
        content,
        arity,
        isAbbreviated || undefined,
      ),
  );
};

// Generate command parsers from configuration
const allCommandParsers: P.Parser<BussproofsCommand>[] =
  COMMAND_DEFINITIONS.flatMap((def) => {
    const fullNameParser = commandParser(
      def.name,
      def.name,
      def.arity,
      def.type,
    );
    if (!def.abbrev) {
      return [fullNameParser];
    }

    return [
      fullNameParser,
      commandParser(def.abbrev, def.name, def.arity, def.type),
    ];
  });

const bussproofsCommand = P.alt(...allCommandParsers);

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

interface CommandToken {
  type: "command";
  value: BussproofsCommand;
}

interface TextToken {
  type: "text";
}

type ContentToken = CommandToken | TextToken;

const isCommandToken = (token: ContentToken): token is CommandToken =>
  token.type === "command";

const createContentParser = (): P.Parser<ContentToken[]> => {
  // Match one or more non-backslash characters to ensure progress
  const nonCommandChunk = P.regexp(PARSER_PATTERNS.NON_COMMAND_CHUNK);
  const escapedOrNonCommand = P.alt(
    // escaped backslash \\ or backslash followed by non-letter command, treat as text
    P.string("\\\\"),
    P.regexp(PARSER_PATTERNS.ESCAPED_OR_NON_COMMAND),
  );
  // Consume unknown word-like commands (e.g., \foo) as plain text so parsing continues
  const unknownWordCommand = P.regexp(PARSER_PATTERNS.UNKNOWN_WORD_COMMAND);
  const textToken = (): TextToken => ({ type: "text" });

  return P.alt<ContentToken>(
    bussproofsCommand.map((cmd) => ({ type: "command" as const, value: cmd })),
    unknownWordCommand.map(() => textToken()),
    escapedOrNonCommand.map(() => textToken()),
    nonCommandChunk.map(() => textToken()),
  ).many();
};

// Exported for unit testing
export const parseCommands = (content: string): BussproofsCommand[] => {
  if (typeof content !== "string" || content.length === 0) {
    return [];
  }

  try {
    const result = createContentParser().parse(content);
    if (!result.status) {
      console.warn(
        "Failed to parse content for bussproofs commands:",
        result.expected,
      );
      return [];
    }

    return result.value.filter(isCommandToken).map((item) => item.value);
  } catch (error) {
    console.warn("Failed to parse content for bussproofs commands:", error);
    return [];
  }
};

// Label storage interface
type LabelStorage = Record<LabelType, unknown | null>;

export class Bussproofs {
  static displayName = "Bussproofs";
  static environments: Record<string, unknown[]> = {
    prooftree: ["HV"],
  };

  private g: BussproofsGenerator;

  constructor(generator: BussproofsGenerator, _options?: unknown) {
    this.g = generator;
  }

  private renderLatexSegments(content: string): unknown[] {
    const trimmed = content.trim();
    if (trimmed.length === 0) {
      return [];
    }

    try {
      for (const { regex, display } of MATH_PATTERNS) {
        const match = trimmed.match(regex);
        if (match) {
          const mathResult = this.g.parseMath(match[1], display);
          return mathResult ? [mathResult] : [];
        }
      }

      if (PARSER_PATTERNS.LATEX_COMMANDS.test(trimmed)) {
        const mathResult = this.g.parseMath(trimmed, false);
        return mathResult ? [mathResult] : [];
      }
    } catch (error) {
      console.warn(
        "Failed to process LaTeX content, falling back to text:",
        content,
        error,
      );
    }

    return [];
  }

  private createContentNode(content: string): unknown {
    const fragments = this.renderLatexSegments(content);
    if (fragments.length > 0) {
      return this.g.createFragment(...fragments);
    }

    return this.g.createText?.(content) ?? content;
  }

  private createDiv(className: string, content?: unknown): Element {
    return this.g.create("div", content, className);
  }

  private createProofTree(
    premises: unknown[],
    conclusion: unknown,
    premiseCount: number,
    labels: LabelStorage,
  ): Element {
    const grid = this.createDiv(
      `${CSS_CLASSES.GRID} ${CSS_CLASSES.GRID}-${premiseCount}`,
    );

    if (labels.left != null) {
      grid.appendChild(this.createDiv(CSS_CLASSES.LEFT_LABEL, labels.left));
    }

    const column = this.createDiv(CSS_CLASSES.PROOF_COLUMN);
    const premisesRow = this.createDiv(CSS_CLASSES.PREMISES_ROW);

    for (const premise of premises) {
      premisesRow.appendChild(this.createDiv(CSS_CLASSES.PREMISE, premise));
    }

    column.appendChild(premisesRow);
    column.appendChild(this.createDiv(CSS_CLASSES.CONCLUSION, conclusion));
    grid.appendChild(column);

    if (labels.right != null) {
      grid.appendChild(this.createDiv(CSS_CLASSES.RIGHT_LABEL, labels.right));
    }

    return grid;
  }

  /**
   * Process an inference command with the given arity
   */
  private processInference(
    stack: unknown[],
    conclusionElement: unknown,
    arity: number,
    labels: LabelStorage,
    commandName: string,
  ): void {
    if (stack.length < arity) {
      console.warn(`${commandName}: not enough premises in stack`);
      stack.push(conclusionElement);
    } else {
      const premises = stack.splice(-arity);
      const proofTree = this.createProofTree(
        premises,
        conclusionElement,
        arity,
        labels,
      );
      stack.push(proofTree);
    }

    labels.left = null;
    labels.right = null;
  }

  prooftree(content: unknown): unknown[] {
    const proofContent = typeof content === "string" ? content : "";

    const commands = parseCommands(proofContent);
    const stack: unknown[] = [];

    // Label storage - labels apply to the next inference rule
    const labels: LabelStorage = {
      left: null,
      right: null,
    };

    for (const command of commands) {
      if (command.type === "label") {
        const labelType = LABEL_TARGET[command.command];
        if (labelType) {
          labels[labelType] = this.createContentNode(command.content);
        }
        continue;
      }

      const conclusionElement = this.createContentNode(command.content);

      if (command.type === "axiom") {
        stack.push(conclusionElement);
        continue;
      }

      const arity = INFERENCE_ARITY[command.command];
      if (arity !== undefined) {
        this.processInference(
          stack,
          conclusionElement,
          arity,
          labels,
          command.command,
        );
        continue;
      }

      console.warn(`Unknown bussproofs command: ${command.command}`);
      stack.push(conclusionElement);
    }

    if (stack.length === 0) {
      return [];
    }

    const wrapper = this.createDiv(CSS_CLASSES.OUTER_WRAPPER);

    for (const element of stack) {
      const inlineBlock = this.createDiv(CSS_CLASSES.INNER_WRAPPER);
      inlineBlock.appendChild(element as Node);
      wrapper.appendChild(inlineBlock);
    }

    return [wrapper];
  }
}

// Default export
export default {
  parse,
  SyntaxError: BussproofsSyntaxError,
  Bussproofs,
};
