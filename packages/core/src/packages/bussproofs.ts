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

// CSS constants
const CSS_CONSTANTS = {
  GRID_GAP: "0 0.5em",
  LABEL_PADDING_BOTTOM: "0.8em",
  CONCLUSION_PADDING: "0 1em",
  BORDER_STYLE: "1px solid #000",
  WRAPPER_MARGIN: "0 0.5em",
  COLUMN_SPAN: 2,
} as const;

// CSS class names
const CSS_CLASSES = {
  GRID: "bussproofs-grid",
  OUTER_WRAPPER: "bussproofs-outer-wrapper",
  INNER_WRAPPER: "bussproofs-inner-wrapper",
  LEFT_LABEL: "bussproofs-left-label",
  RIGHT_LABEL: "bussproofs-right-label",
  PREMISE: "bussproofs-premise",
  CONCLUSION: "bussproofs-conclusion",
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
const createCommandParsers = () => {
  const parsers: P.Parser<BussproofsCommand>[] = [];

  for (const def of COMMAND_DEFINITIONS) {
    // Full name parser
    parsers.push(commandParser(def.name, def.name, def.arity, def.type));

    // Abbreviated parser (if available)
    if (def.abbrev) {
      parsers.push(commandParser(def.abbrev, def.name, def.arity, def.type));
    }
  }

  return parsers;
};

const allCommandParsers = createCommandParsers();

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

const createContentParser = () => {
  // Match one or more non-backslash characters to ensure progress
  const nonCommandChunk = P.regexp(PARSER_PATTERNS.NON_COMMAND_CHUNK);
  const escapedOrNonCommand = P.alt(
    // escaped backslash \\ or backslash followed by non-letter command, treat as text
    P.string("\\\\"),
    P.regexp(PARSER_PATTERNS.ESCAPED_OR_NON_COMMAND),
  );
  // Consume unknown word-like commands (e.g., \foo) as plain text so parsing continues
  const unknownWordCommand = P.regexp(PARSER_PATTERNS.UNKNOWN_WORD_COMMAND);

  return P.alt(
    bussproofsCommand.map((cmd) => ({ type: "command" as const, value: cmd })),
    unknownWordCommand.map(() => ({ type: "text" as const, value: null })),
    escapedOrNonCommand.map(() => ({ type: "text" as const, value: null })),
    nonCommandChunk.map(() => ({ type: "text" as const, value: null })),
  ).many();
};

// Exported for unit testing
export const parseCommands = (content: string): BussproofsCommand[] => {
  if (!content || typeof content !== "string") {
    return [];
  }

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
    } else {
      console.warn(
        "Failed to parse content for bussproofs commands:",
        result.expected,
      );
    }
  } catch (error) {
    console.warn("Failed to parse content for bussproofs commands:", error);
  }

  return commands;
};

// CSS styling utilities

const applyStyles = (element: HTMLElement, styles: string): void => {
  element.style.cssText = styles;
};

const calculateGridColumns = (
  premiseCount: number,
  hasLeftLabel: boolean,
  hasRightLabel: boolean,
): string => {
  const premiseColumns = premiseCount * CSS_CONSTANTS.COLUMN_SPAN;
  const parts: string[] = [];

  if (hasLeftLabel) parts.push("auto");
  parts.push(`repeat(${premiseColumns}, auto)`);
  if (hasRightLabel) parts.push("auto");

  return parts.join(" ");
};

// Style generators
const createGridStyles = (columns: string): string =>
  `display: grid;
   grid-template-columns: ${columns};
   grid-template-rows: auto auto;
   gap: ${CSS_CONSTANTS.GRID_GAP};
   width: fit-content;`;

const createLabelStyles = (
  column: string | number,
  alignment: "left" | "right",
): string =>
  `grid-column: ${column};
   grid-row: 1 / span 2;
   display: flex;
   align-items: end;
   justify-content: ${alignment === "left" ? "flex-end" : "flex-start"};
   padding-bottom: ${CSS_CONSTANTS.LABEL_PADDING_BOTTOM};`;

const createPremiseStyles = (columnStart: number): string =>
  `grid-column: ${columnStart} / span ${CSS_CONSTANTS.COLUMN_SPAN};
   grid-row: 1;
   justify-content: center;
   display: flex;
   align-items: end;`;

const createConclusionStyles = (start: number, end: number): string =>
  `grid-column: ${start} / ${end};
   grid-row: 2;
   text-align: center;
   border-top: ${CSS_CONSTANTS.BORDER_STYLE};
   padding: ${CSS_CONSTANTS.CONCLUSION_PADDING};`;

const createWrapperStyles = (): string =>
  `display: flex;
   justify-content: center;
   align-items: end;`;

const createInnerWrapperStyles = (): string =>
  `display: inline-block; margin: ${CSS_CONSTANTS.WRAPPER_MARGIN};`;

// Label storage interface
interface LabelStorage {
  left: unknown | null;
  right: unknown | null;
}

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
    leftLabel?: unknown,
    rightLabel?: unknown,
  ): Element {
    const hasLeftLabel = Boolean(leftLabel);
    const hasRightLabel = Boolean(rightLabel);
    const premiseColumns = premiseCount * CSS_CONSTANTS.COLUMN_SPAN;
    const totalColumns =
      (hasLeftLabel ? 1 : 0) + premiseColumns + (hasRightLabel ? 1 : 0);

    // Create the main grid container
    const gridContainer = this.g.create(
      "div",
      undefined,
      `${CSS_CLASSES.GRID} ${CSS_CLASSES.GRID}-${premiseCount}`,
    );

    const gridTemplateColumns = calculateGridColumns(
      premiseCount,
      hasLeftLabel,
      hasRightLabel,
    );
    applyStyles(
      gridContainer as HTMLElement,
      createGridStyles(gridTemplateColumns),
    );

    // Add left label (spans both rows)
    if (leftLabel) {
      const leftLabelCell = this.g.create(
        "div",
        leftLabel,
        CSS_CLASSES.LEFT_LABEL,
      );
      applyStyles(leftLabelCell as HTMLElement, createLabelStyles(1, "left"));
      gridContainer.appendChild(leftLabelCell);
    }

    // Add premise cells (top row)
    premises.forEach((premise, index) => {
      const premiseCell = this.g.create("div", premise, CSS_CLASSES.PREMISE);
      const columnStart =
        (hasLeftLabel ? 1 : 0) + index * CSS_CONSTANTS.COLUMN_SPAN + 1;
      applyStyles(premiseCell as HTMLElement, createPremiseStyles(columnStart));
      gridContainer.appendChild(premiseCell);
    });

    // Add right label (spans both rows)
    if (rightLabel) {
      const rightLabelCell = this.g.create(
        "div",
        rightLabel,
        CSS_CLASSES.RIGHT_LABEL,
      );
      applyStyles(
        rightLabelCell as HTMLElement,
        createLabelStyles(totalColumns, "right"),
      );
      gridContainer.appendChild(rightLabelCell);
    }

    // Add conclusion cell (bottom row, spanning premise columns only)
    const conclusionCell = this.g.create(
      "div",
      conclusion,
      CSS_CLASSES.CONCLUSION,
    );
    const conclusionStart = hasLeftLabel ? 2 : 1;
    const conclusionEnd = conclusionStart + premiseColumns;
    applyStyles(
      conclusionCell as HTMLElement,
      createConclusionStyles(conclusionStart, conclusionEnd),
    );
    gridContainer.appendChild(conclusionCell);

    return gridContainer;
  }

  /**
   * Process an inference command with the given arity
   */
  private processInference(
    stack: unknown[],
    conclusionElement: unknown,
    arity: number,
    labels: LabelStorage,
  ): void {
    if (stack.length >= arity) {
      const premises: unknown[] = [];
      for (let i = 0; i < arity; i++) {
        const premise = stack.pop();
        if (premise !== undefined) {
          premises.unshift(premise);
        }
      }
      const proofTree = this.createProofTree(
        premises,
        conclusionElement,
        arity,
        labels.left,
        labels.right,
      );
      stack.push(proofTree);
    } else {
      console.warn(
        `${this.getInferenceName(arity)}: not enough premises in stack`,
      );
      stack.push(conclusionElement);
    }
    // Reset labels after use
    labels.left = null;
    labels.right = null;
  }

  /**
   * Get the name of an inference command based on its arity
   */
  private getInferenceName(arity: number): string {
    const names = [
      "",
      "UnaryInfC",
      "BinaryInfC",
      "TrinaryInfC",
      "QuaternaryInfC",
      "QuinaryInfC",
    ];
    return names[arity] || `${arity}-aryInfC`;
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
      // Handle label commands
      if (command.type === "label") {
        const processedLabelContent = this.processLatexContent(command.content);
        const labelElement =
          processedLabelContent.length > 0
            ? this.g.createFragment(...processedLabelContent)
            : this.g.createText?.(command.content) || command.content;

        if (command.command === "RightLabel") {
          labels.right = labelElement;
        } else if (command.command === "LeftLabel") {
          labels.left = labelElement;
        }
        continue;
      }

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
          this.processInference(stack, conclusionElement, 1, labels);
          break;

        case "BinaryInfC":
          this.processInference(stack, conclusionElement, 2, labels);
          break;

        case "TrinaryInfC":
          this.processInference(stack, conclusionElement, 3, labels);
          break;

        case "QuaternaryInfC":
          this.processInference(stack, conclusionElement, 4, labels);
          break;

        case "QuinaryInfC":
          this.processInference(stack, conclusionElement, 5, labels);
          break;

        default:
          console.warn(`Unknown bussproofs command: ${command.command}`);
          stack.push(conclusionElement);
          break;
      }
    }

    // Return all remaining elements in the stack, wrapped in a single block div
    if (stack.length > 0) {
      const wrapper = this.g.create(
        "div",
        undefined,
        CSS_CLASSES.OUTER_WRAPPER,
      );
      applyStyles(wrapper as HTMLElement, createWrapperStyles());

      for (const element of stack) {
        const inlineBlock = this.g.create(
          "div",
          undefined,
          CSS_CLASSES.INNER_WRAPPER,
        );
        applyStyles(inlineBlock as HTMLElement, createInnerWrapperStyles());
        inlineBlock.appendChild(element as Node);
        wrapper.appendChild(inlineBlock);
      }

      return [wrapper];
    }

    return [];
  }
}

// Default export
export default {
  parse,
  SyntaxError: BussproofsSyntaxError,
  Bussproofs,
};
