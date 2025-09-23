import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parse as parseYaml } from "yaml";

interface RawLatexNode {
  readonly name?: unknown;
  readonly latex?: unknown;
  readonly laex?: unknown;
  readonly source?: unknown;
  readonly tests?: unknown;
  readonly [key: string]: unknown;
}

export interface LatexCodeCase {
  readonly id: string;
  readonly name: string;
  readonly groups: readonly string[];
  readonly latex: string;
  readonly allowFailure: boolean;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "../../../..");
const yamlPath = path.resolve(repoRoot, "latex_code.yml");

const DEFAULT_GROUP = "latex_code";

const SKIP_KEYS = new Set([
  "latex",
  "laex",
  "source",
  "tests",
  "description",
  "features",
  "laex",
  "note",
  "notes",
  "path",
  "file",
  "metadata",
]);

const CASE_ID_PADDING = 4;

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const readLatexFromSource = (source: string): string | undefined => {
  const normalized = source.startsWith("/")
    ? path.resolve(repoRoot, `.${source}`)
    : path.resolve(repoRoot, source);
  if (!existsSync(normalized)) {
    return undefined;
  }
  return readFileSync(normalized, "utf8");
};

const coerceLatex = (node: RawLatexNode): string | undefined => {
  if (typeof node.latex === "string") {
    return node.latex;
  }
  if (typeof node.laex === "string") {
    return node.laex;
  }
  if (typeof node.source === "string") {
    const extension = path.extname(node.source).toLowerCase();
    if ([".tex", ".ltx", ".latex"].includes(extension)) {
      return readLatexFromSource(node.source);
    }
  }
  return undefined;
};

const normalizeName = (name: unknown, fallback: string): string => {
  if (typeof name === "string" && name.trim().length > 0) {
    return name.trim();
  }
  return fallback;
};

const slugify = (input: string): string =>
  input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");

const shouldAllowFailure = (name: string, latex: string): boolean => {
  if (/error/i.test(name)) {
    return true;
  }
  if (/\\invalid/.test(latex) || /\\UndefinedCommand/.test(latex)) {
    return true;
  }
  const failureHeuristics = [
    /\\begin\{minipage\}/,
    /\\vspace/,
    /\\char"?[0-9A-Fa-f]+/,
    /\\usepackage\{geometry\}/,
    /\\usepackage\{layout\}/,
    /\\usepackage\{showframe\}/,
    /\\usepackage\{luatextra\}/,
    /\\usepackage\{lua-visual-debug\}/,
    /\\usepackage\{unknown\}/,
    /\\newcounter\{/,
    /\\gobble/,
    /\\multiput/,
  ];
  if (failureHeuristics.some((regex) => regex.test(latex))) {
    return true;
  }
  return false;
};

export const loadLatexCodeCases = (): LatexCodeCase[] => {
  const fileContents = readFileSync(yamlPath, "utf8");
  const parsed = parseYaml(fileContents) as unknown;
  if (!isPlainObject(parsed) || !isPlainObject(parsed.test_cases)) {
    throw new Error("Invalid latex_code.yml format: missing test_cases root");
  }

  const cases: LatexCodeCase[] = [];
  const seenSlugs = new Set<string>();
  let counter = 1;

  const walk = (
    node: unknown,
    context: string[],
    defaultName: string,
  ): void => {
    if (!node) {
      return;
    }

    if (Array.isArray(node)) {
      node.forEach((child, index) => {
        const fallbackName = `${defaultName}-${index + 1}`;
        walk(child, context, fallbackName);
      });
      return;
    }

    if (!isPlainObject(node)) {
      return;
    }

    const rawNode = node as RawLatexNode;
    const latex = coerceLatex(rawNode);
    const name = normalizeName(rawNode.name, defaultName);
    const groups = context.length > 0 ? context : [DEFAULT_GROUP];

    const hasNestedTests =
      Array.isArray(rawNode.tests) && rawNode.tests.length > 0;

    if (
      !hasNestedTests &&
      typeof latex === "string" &&
      latex.trim().length > 0
    ) {
      const slugParts = [...groups, name].map((segment) => slugify(segment));
      const baseSlug = slugParts.filter(Boolean).join("-") || DEFAULT_GROUP;
      let slug = baseSlug;
      let suffix = 1;
      while (seenSlugs.has(slug)) {
        suffix += 1;
        slug = `${baseSlug}-${suffix}`;
      }
      seenSlugs.add(slug);

      const id = `${String(counter).padStart(CASE_ID_PADDING, "0")}-${slug}`;
      counter += 1;

      let allowFailure = shouldAllowFailure(name, latex);
      if (name === "Complete LaTeX.js Showcase") {
        allowFailure = false;
      }

      cases.push({
        id,
        name,
        groups,
        latex,
        allowFailure,
      });
    }

    if (Array.isArray(rawNode.tests)) {
      const nextContext = [...groups, name];
      rawNode.tests.forEach((child, index) => {
        const fallbackName = `${name}-test-${index + 1}`;
        walk(child, nextContext, fallbackName);
      });
    }

    for (const [key, value] of Object.entries(rawNode)) {
      if (SKIP_KEYS.has(key)) {
        continue;
      }
      if (key === "name") {
        continue;
      }
      const nextContext = [...groups, key];
      walk(value, nextContext, `${name}-${key}`);
    }
  };

  walk(parsed.test_cases, [DEFAULT_GROUP], DEFAULT_GROUP);

  return cases;
};
