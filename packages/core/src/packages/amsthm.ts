import type { AmsthrmGenerator } from "../interfaces";

type FontWeight = "normal" | "bold";
type FontStyle = "normal" | "italic";

type HeadSpacing =
  | { type: "text"; value: string }
  | { type: "length"; value: string }
  | { type: "linebreak" };

interface FontSpec {
  weight?: FontWeight;
  style?: FontStyle;
  variant?: string;
  family?: string;
}

interface TheoremStyle {
  name: string;
  headerClasses: string[];
  bodyClasses: string[];
  headFont?: FontSpec;
  bodyFont?: FontSpec;
  headPunctuation: string;
  afterHeadSpacing: HeadSpacing;
  renderNote: (generator: AmsthrmGenerator, title: unknown) => unknown[];
  numberFirst?: boolean;
  indent?: string;
  spaceAbove?: string;
  spaceBelow?: string;
}

interface TheoremEnvironment {
  name: string;
  displayName: string;
  counter?: string;
  parentCounter?: string;
  numbered: boolean;
  styleName: string;
  style: TheoremStyle;
  sharedWith?: string;
  numberFirst?: boolean;
}

interface ProofState {
  container: Element;
  explicitQED: boolean;
}

export class Amsthm {
  static displayName = "Amsthm";
  static args: Record<string, unknown[]> = {
    newtheorem: ["P", "s", "g", "o?", "g", "o?"],
    newtheoremstyle: ["P", "g", "g", "g", "g", "g", "g", "g", "g", "g"],
    swapnumbers: ["P"],
    noswapnumbers: ["P"],
    theoremstyle: ["P", "g"],
    qed: ["H"],
    qedhere: ["H"],
    proof: ["HV", "o?"],
    theorem: ["HV", "o?"],
    lemma: ["HV", "o?"],
    corollary: ["HV", "o?"],
    proposition: ["HV", "o?"],
    definition: ["HV", "o?"],
    example: ["HV", "o?"],
    remark: ["HV", "o?"],
    note: ["HV", "o?"],
    observation: ["HV", "o?"],
    claim: ["HV", "o?"],
    fact: ["HV", "o?"],
    conjecture: ["HV", "o?"],
  };

  static environments: Record<string, unknown[]> = {
    proof: ["HV", "o?"],
    theorem: ["HV", "o?"],
    lemma: ["HV", "o?"],
    corollary: ["HV", "o?"],
    proposition: ["HV", "o?"],
    definition: ["HV", "o?"],
    example: ["HV", "o?"],
    remark: ["HV", "o?"],
    note: ["HV", "o?"],
    observation: ["HV", "o?"],
    claim: ["HV", "o?"],
    fact: ["HV", "o?"],
    conjecture: ["HV", "o?"],
  };

  private g: AmsthrmGenerator;
  private theoremStyles: Map<string, TheoremStyle> = new Map();
  private currentStyle: string = "plain";
  private theoremEnvironments: Record<string, TheoremEnvironment> = {};
  private counterInitialized: Record<string, boolean> = {};
  private swapNumbersDeclaration = false;
  private proofStack: ProofState[] = [];

  constructor(generator: AmsthrmGenerator, _options?: unknown) {
    this.g = generator;

    this.theoremStyles.set("plain", {
      name: "plain",
      headerClasses: ["amsthm-plain-header"],
      bodyClasses: ["amsthm-plain-body"],
      headPunctuation: ".",
      afterHeadSpacing: { type: "text", value: " " },
      renderNote: this.defaultNoteRenderer,
    });

    this.theoremStyles.set("definition", {
      name: "definition",
      headerClasses: ["amsthm-definition-header"],
      bodyClasses: ["amsthm-definition-body"],
      headPunctuation: ".",
      afterHeadSpacing: { type: "text", value: " " },
      renderNote: this.defaultNoteRenderer,
    });

    this.theoremStyles.set("remark", {
      name: "remark",
      headerClasses: ["amsthm-remark-header"],
      bodyClasses: ["amsthm-remark-body"],
      headPunctuation: ".",
      afterHeadSpacing: { type: "text", value: " " },
      renderNote: this.defaultNoteRenderer,
    });
  }

  theoremstyle(styleName: string | Node): unknown[] {
    const name = this.normalizeStyleName(this.extractText(styleName));
    if (name && this.theoremStyles.has(name)) {
      this.currentStyle = name;
    } else if (name) {
      console.warn(
        `amsthm warning: theorem style '${name}' is not defined; falling back to 'plain'.`,
      );
      this.currentStyle = "plain";
    }
    return [];
  }

  newtheorem(
    starred: boolean,
    envName: string | Node,
    sharedCounter: string | Node | undefined,
    displayName: string | Node,
    parentCounter?: string | Node,
  ): unknown[] {
    const actualEnvName = this.normalizeIdentifier(this.extractText(envName));
    if (!actualEnvName) {
      return [];
    }

    const sharedCounterName =
      this.normalizeIdentifier(this.extractText(sharedCounter)) || undefined;
    const displayNameStr =
      this.extractText(displayName) || this.capitalize(actualEnvName);
    const parentCounterName =
      this.normalizeIdentifier(this.extractText(parentCounter)) || undefined;

    const numbered = !starred;

    const counterName = sharedCounterName ?? actualEnvName;

    const envStyle = this.getStyle(this.currentStyle);
    const environment: TheoremEnvironment = {
      name: actualEnvName,
      displayName: displayNameStr,
      counter: numbered ? counterName : undefined,
      parentCounter: parentCounterName,
      numbered,
      styleName: envStyle.name,
      style: envStyle,
      sharedWith: sharedCounterName,
      numberFirst: this.swapNumbersDeclaration || envStyle.numberFirst,
    };

    this.theoremEnvironments[actualEnvName] = environment;

    if (numbered && !this.counterInitialized[counterName]) {
      try {
        this.g.newCounter(counterName, parentCounterName);
      } catch (error) {
        console.warn(
          `amsthm warning: unable to create counter '${counterName}': ${error}`,
        );
      }
      this.counterInitialized[counterName] = true;
    }

    if (sharedCounterName && !this.counterInitialized[sharedCounterName]) {
      try {
        this.g.newCounter(sharedCounterName, parentCounterName);
        this.counterInitialized[sharedCounterName] = true;
      } catch (error) {
        console.warn(
          `amsthm warning: shared counter '${sharedCounterName}' does not exist; attempting to create it failed: ${error}`,
        );
      }
    }

    this.registerEnvironmentMacro(actualEnvName);

    return [];
  }

  newtheoremstyle(
    styleName: string | Node,
    spaceAbove: string | Node,
    spaceBelow: string | Node,
    bodyFont: string | Node,
    indent: string | Node,
    headFont: string | Node,
    headPunct: string | Node,
    headSpace: string | Node,
    headSpec: string | Node,
  ): unknown[] {
    const name = this.normalizeStyleName(this.extractText(styleName));
    if (!name) {
      return [];
    }

    const style: TheoremStyle = {
      name,
      headerClasses: ["amsthm-custom-header"],
      bodyClasses: ["amsthm-custom-body"],
      headFont: this.parseFontSpec(this.extractText(headFont)),
      bodyFont: this.parseFontSpec(this.extractText(bodyFont)),
      headPunctuation: this.extractText(headPunct) || ".",
      afterHeadSpacing: this.parseHeadSpacing(this.extractText(headSpace)),
      renderNote: this.defaultNoteRenderer,
      indent: this.parseLength(this.extractText(indent)),
      spaceAbove: this.parseLength(this.extractText(spaceAbove)),
      spaceBelow: this.parseLength(this.extractText(spaceBelow)),
    };

    const headSpecText = this.extractText(headSpec);
    const { numberFirst, renderNote } = this.parseHeadSpec(headSpecText);
    if (numberFirst !== undefined) {
      style.numberFirst = numberFirst;
    }
    if (renderNote) {
      style.renderNote = renderNote;
    }

    this.theoremStyles.set(name, style);
    return [];
  }

  swapnumbers(): unknown[] {
    this.swapNumbersDeclaration = true;
    return [];
  }

  noswapnumbers(): unknown[] {
    this.swapNumbersDeclaration = false;
    return [];
  }

  proof(label?: unknown): unknown[] {
    const headerFragments: unknown[] = [];
    this.appendText(headerFragments, "Proof");
    if (label) {
      headerFragments.push(...this.defaultNoteRenderer(this.g, label));
    }
    this.appendText(headerFragments, ". ");
    const header = this.g.create("em", headerFragments, "amsthm-proof-header");

    const container = this.g.create("div", [header], "amsthm-proof");
    const element = container as unknown as Element;
    this.proofStack.push({ container: element, explicitQED: false });
    return [container];
  }

  endproof(): unknown[] {
    const state = this.proofStack.pop();
    if (!state) {
      return [];
    }

    if (!state.explicitQED) {
      const qedSpan = this.createQedSpan("block");
      state.container.appendChild(qedSpan);
    }

    return [];
  }

  qed(): unknown[] {
    const span = this.createQedSpan("inline");
    this.markExplicitProofQed();
    return [span];
  }

  qedhere(): unknown[] {
    const span = this.createQedSpan("inline");
    this.markExplicitProofQed();
    return [span];
  }

  theorem(title?: unknown): unknown[] {
    return this.createTheoremContainer("theorem", title);
  }

  lemma(title?: unknown): unknown[] {
    return this.createTheoremContainer("lemma", title);
  }

  corollary(title?: unknown): unknown[] {
    return this.createTheoremContainer("corollary", title);
  }

  proposition(title?: unknown): unknown[] {
    return this.createTheoremContainer("proposition", title);
  }

  definition(title?: unknown): unknown[] {
    return this.createTheoremContainer("definition", title);
  }

  example(title?: unknown): unknown[] {
    return this.createTheoremContainer("example", title);
  }

  remark(title?: unknown): unknown[] {
    return this.createTheoremContainer("remark", title);
  }

  note(title?: unknown): unknown[] {
    return this.createTheoremContainer("note", title);
  }

  observation(title?: unknown): unknown[] {
    return this.createTheoremContainer("observation", title);
  }

  claim(title?: unknown): unknown[] {
    return this.createTheoremContainer("claim", title);
  }

  fact(title?: unknown): unknown[] {
    return this.createTheoremContainer("fact", title);
  }

  conjecture(title?: unknown): unknown[] {
    return this.createTheoremContainer("conjecture", title);
  }

  private createTheoremContainer(envName: string, title?: unknown): unknown[] {
    if (!this.theoremEnvironments[envName]) {
      const defaultStyle = this.getDefaultStyle(envName);
      const style = this.getStyle(defaultStyle);
      this.theoremEnvironments[envName] = {
        name: envName,
        displayName: this.capitalize(envName),
        counter: envName,
        numbered: true,
        styleName: style.name,
        style,
        numberFirst: style.numberFirst,
      };
    }

    const env = this.theoremEnvironments[envName];
    const style = this.getStyle(env.styleName);
    env.style = style;

    const headerFragments: unknown[] = [];

    let counterId: string | undefined;
    let counterDisplay: string | undefined;

    if (env.numbered && env.counter) {
      const counterInfo = this.stepCounter(env);
      if (counterInfo) {
        counterDisplay = counterInfo.display;
        counterId = counterInfo.id;
      }
    }

    const numberFirst = env.numberFirst ?? style.numberFirst ?? false;
    const nameFragment = this.g.createText(env.displayName);

    if (counterDisplay && numberFirst) {
      this.appendText(headerFragments, `${counterDisplay} `);
      if (nameFragment) {
        headerFragments.push(nameFragment);
      }
    } else {
      if (nameFragment) {
        headerFragments.push(nameFragment);
      }
      if (counterDisplay) {
        this.appendText(headerFragments, ` ${counterDisplay}`);
      }
    }

    if (title) {
      headerFragments.push(...style.renderNote(this.g, title));
    }

    if (style.headPunctuation) {
      this.appendText(headerFragments, style.headPunctuation);
    }

    this.applyHeadSpacing(headerFragments, style.afterHeadSpacing);

    const headerClasses = this.combineClasses(
      [`amsthm-${style.name}-header`],
      style.headerClasses,
    );
    const header = this.g.create("span", headerFragments, headerClasses);

    const containerClasses = this.combineClasses(
      ["amsthm-environment", `amsthm-${style.name}`],
      style.bodyClasses,
    );
    const container = this.g.create("div", [header], containerClasses);
    const element = container as unknown as HTMLElement;

    if (counterId) {
      element.id = counterId;
    }

    this.applyFontSpec(element, style.bodyFont);
    this.applyFontSpec(header as unknown as HTMLElement, style.headFont);
    this.applyBoxSpacing(element, style);

    return [container];
  }

  private stepCounter(
    env: TheoremEnvironment,
  ): { display: string; id: string } | null {
    const targetCounter = env.sharedWith ?? env.counter;
    if (!targetCounter) {
      return null;
    }

    if (!this.counterInitialized[targetCounter]) {
      try {
        this.g.newCounter(targetCounter, env.parentCounter);
      } catch (error) {
        console.warn(
          `amsthm warning: counter '${targetCounter}' was not initialized and could not be created: ${error}`,
        );
        return null;
      }
      this.counterInitialized[targetCounter] = true;
    }

    this.g.stepCounter(targetCounter);
    const current = this.g.counter(targetCounter);
    const parts: string[] = [];

    if (env.parentCounter) {
      try {
        const parentValue = this.g.counter(env.parentCounter);
        parts.push(this.g.arabic(parentValue));
      } catch {
        // ignore
      }
    }

    parts.push(this.g.arabic(current));
    const display = parts.join(".");

    const labelId = `${targetCounter}-${display.replace(/\./g, "-")}`;
    this.g.refCounter(targetCounter, labelId);

    return { display, id: labelId };
  }

  private registerEnvironmentMacro(envName: string): void {
    const generatorWithMacros = this.g as unknown as {
      _macros: Record<string, (...args: unknown[]) => unknown>;
    };

    if (!generatorWithMacros._macros) {
      return;
    }

    const macroKey = envName;
    generatorWithMacros._macros[macroKey] = (title?: unknown) => {
      return this.createTheoremContainer(envName, title);
    };

    const macrosCtor = generatorWithMacros._macros.constructor as unknown as {
      args: Record<string, unknown[]>;
    };
    macrosCtor.args[macroKey] = ["HV", "o?"];
    Amsthm.args[macroKey] = ["HV", "o?"];
    Amsthm.environments[macroKey] = ["HV", "o?"];
  }

  private getStyle(name: string): TheoremStyle {
    const style = this.theoremStyles.get(name);
    const fallback = this.theoremStyles.get("plain");
    if (style) {
      return style;
    }
    if (!fallback) {
      throw new Error("amsthm: missing default 'plain' style definition");
    }
    return fallback;
  }

  private getDefaultStyle(envName: string): string {
    const definitionLike = new Set([
      "definition",
      "example",
      "problem",
      "exercise",
    ]);
    const remarkLike = new Set(["remark", "note", "case", "observation"]);

    if (definitionLike.has(envName)) {
      return "definition";
    }
    if (remarkLike.has(envName)) {
      return "remark";
    }
    return "plain";
  }

  private applyFontSpec(element: HTMLElement, font?: FontSpec): void {
    if (!font) {
      return;
    }
    if (font.weight) {
      element.style.fontWeight = font.weight;
    }
    if (font.style) {
      element.style.fontStyle = font.style;
    }
    if (font.variant) {
      element.style.fontVariant = font.variant;
    }
    if (font.family) {
      element.style.fontFamily = font.family;
    }
  }

  private applyBoxSpacing(element: HTMLElement, style: TheoremStyle): void {
    if (style.indent) {
      element.style.marginLeft = style.indent;
    }
    if (style.spaceAbove) {
      element.style.marginTop = style.spaceAbove;
    }
    if (style.spaceBelow) {
      element.style.marginBottom = style.spaceBelow;
    }
  }

  private parseHeadSpec(spec: string): {
    numberFirst?: boolean;
    renderNote?: (generator: AmsthrmGenerator, title: unknown) => unknown[];
  } {
    if (!spec) {
      return {};
    }

    const normalized = spec.replace(/\s+/g, " ");
    const nameIndex = normalized.indexOf("\\thmname");
    const numberIndex = normalized.indexOf("\\thmnumber");
    const result: {
      numberFirst?: boolean;
      renderNote?: (generator: AmsthrmGenerator, title: unknown) => unknown[];
    } = {};

    if (nameIndex >= 0 && numberIndex >= 0) {
      result.numberFirst = numberIndex < nameIndex;
    }

    const noteMatch = normalized.match(/\\thmnote\{([^}]*)\}/);
    if (noteMatch) {
      const template = noteMatch[1];
      const renderer = this.createNoteRenderer(template);
      if (renderer) {
        result.renderNote = renderer;
      }
    }

    return result;
  }

  private createNoteRenderer(
    template: string,
  ): ((generator: AmsthrmGenerator, title: unknown) => unknown[]) | undefined {
    if (!template.includes("#3")) {
      return undefined;
    }

    const segments = template.split("#3");
    return (generator: AmsthrmGenerator, title: unknown) => {
      const fragments: unknown[] = [];
      segments.forEach((segment, index) => {
        const text = segment.replace(/\{\}/g, "{}");
        if (text.trim().length > 0) {
          const node = generator.createText(text);
          if (node) {
            fragments.push(node);
          }
        }
        if (index < segments.length - 1) {
          fragments.push(title);
        }
      });
      return fragments.length > 0
        ? fragments
        : this.defaultNoteRenderer(generator, title);
    };
  }

  private parseFontSpec(spec: string): FontSpec | undefined {
    if (!spec) {
      return undefined;
    }

    const tokens = spec
      .split(/\\/)
      .map((value) => value.replace(/[{}]/g, "").trim())
      .filter((value) => value.length > 0);

    if (tokens.length === 0) {
      return undefined;
    }

    const font: FontSpec = {};
    for (const token of tokens) {
      const normalized = token.toLowerCase();
      switch (normalized) {
        case "itshape":
        case "slshape":
          font.style = "italic";
          break;
        case "upshape":
        case "normalfont":
          font.style = "normal";
          font.weight = "normal";
          break;
        case "bfseries":
          font.weight = "bold";
          break;
        case "mdseries":
          font.weight = "normal";
          break;
        case "scshape":
          font.variant = "small-caps";
          break;
        case "rmfamily":
          font.family = "serif";
          break;
        case "sffamily":
          font.family = "sans-serif";
          break;
        case "ttfamily":
          font.family = "monospace";
          break;
        default:
          break;
      }
    }

    return Object.keys(font).length > 0 ? font : undefined;
  }

  private parseLength(value: string): string | undefined {
    if (!value || value === "0" || value === "0pt") {
      return undefined;
    }

    const trimmed = value.trim();
    const lengthPattern = /^-?[0-9]+(?:\.[0-9]+)?(pt|px|em|ex|rem|ch|vh|vw|%)$/;
    if (lengthPattern.test(trimmed)) {
      return trimmed;
    }

    return undefined;
  }

  private parseHeadSpacing(value: string): HeadSpacing {
    if (!value) {
      return { type: "text", value: " " };
    }

    const trimmed = value.trim();
    if (!trimmed) {
      return { type: "text", value: " " };
    }

    if (/^\\newline$/.test(trimmed)) {
      return { type: "linebreak" };
    }

    const lengthPattern = /^-?[0-9]+(?:\.[0-9]+)?(pt|px|em|ex|rem|ch|vh|vw|%)$/;
    if (lengthPattern.test(trimmed)) {
      return { type: "length", value: trimmed };
    }

    return { type: "text", value: trimmed };
  }

  private applyHeadSpacing(target: unknown[], spacing: HeadSpacing): void {
    switch (spacing.type) {
      case "text":
        this.appendText(target, spacing.value);
        break;
      case "length": {
        const spacer = this.g.create("span", undefined, "amsthm-head-spacer");
        const element = spacer as unknown as HTMLElement;
        element.style.display = "inline-block";
        element.style.width = spacing.value;
        target.push(spacer);
        break;
      }
      case "linebreak":
        target.push(this.g.create("br"));
        break;
      default:
        break;
    }
  }

  private appendText(target: unknown[], text: string): void {
    if (!text) {
      return;
    }
    const node = this.g.createText(text);
    if (node) {
      target.push(node);
    }
  }

  private defaultNoteRenderer(
    generator: AmsthrmGenerator,
    title: unknown,
  ): unknown[] {
    const fragments: unknown[] = [];
    const open = generator.createText(" (");
    if (open) {
      fragments.push(open);
    }
    fragments.push(title);
    const close = generator.createText(")");
    if (close) {
      fragments.push(close);
    }
    return fragments;
  }

  private createQedSpan(kind: "inline" | "block"): Element {
    const classes =
      kind === "inline"
        ? "amsthm-qed amsthm-qed-inline"
        : "amsthm-qed amsthm-qed-block";
    return this.g.create("span", this.g.createText("◻"), classes);
  }

  private markExplicitProofQed(): void {
    const current = this.proofStack[this.proofStack.length - 1];
    if (current) {
      current.explicitQED = true;
    }
  }

  private combineClasses(initial: string[], extra: string[]): string {
    const classes = new Set<string>();
    for (const value of initial.concat(extra)) {
      if (value && value.trim().length > 0) {
        classes.add(value.trim());
      }
    }
    return Array.from(classes).join(" ");
  }

  private capitalize(value: string): string {
    if (!value) {
      return value;
    }
    return value.charAt(0).toUpperCase() + value.slice(1);
  }

  private normalizeStyleName(value: string): string {
    const trimmed = this.replaceLigatures(value).trim().toLowerCase();
    if (!trimmed) {
      return "";
    }
    return trimmed.replace(/[^a-z0-9_-]+/g, "-");
  }

  private extractText(value: string | Node | undefined): string {
    if (value == null) {
      return "";
    }

    if (typeof value === "string") {
      return value;
    }

    if (value.nodeValue) {
      return value.nodeValue;
    }

    if ((value as { textContent?: string }).textContent) {
      return (value as { textContent?: string }).textContent ?? "";
    }

    return "";
  }

  private normalizeIdentifier(value: string): string {
    if (!value) {
      return "";
    }
    const replaced = this.replaceLigatures(value);
    return replaced.replace(/[^a-zA-Z0-9_-]+/g, "");
  }

  private replaceLigatures(value: string): string {
    const replacements: Record<string, string> = {
      ﬃ: "ffi",
      ﬄ: "ffl",
      ﬀ: "ff",
      ﬁ: "fi",
      ﬂ: "fl",
      ﬅ: "ft",
      ﬆ: "st",
    };

    let normalized = value;
    for (const [ligature, replacement] of Object.entries(replacements)) {
      normalized = normalized.split(ligature).join(replacement);
    }
    return normalized;
  }
}
