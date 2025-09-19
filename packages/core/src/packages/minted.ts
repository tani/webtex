// Core Shiki imports

import type { Highlighter } from "shiki";
import {
  bundledLanguages,
  bundledLanguagesAlias,
  bundledThemes,
  createHighlighter,
} from "shiki/bundle/full";

// Project imports
import { document } from "#window";
import type { PackageGenerator } from "../interfaces";

interface MintedGenerator extends PackageGenerator {
  create(
    element: string | ((...args: unknown[]) => unknown),
    content?: unknown,
    className?: string,
  ): Element;
  createFragment(...args: unknown[]): DocumentFragment | Element;
  createText(text: string): Text | undefined;
  verbatim?: string;
}

interface ResolvedOptions {
  theme: string;
  linenos: boolean;
}

let highlighterInstance: Highlighter | null = null;

// Initialize highlighter immediately when module loads
createHighlighter({
  themes: Object.keys(bundledThemes),
  langs: Object.keys(bundledLanguages),
})
  .then((hl) => {
    highlighterInstance = hl;
  })
  .catch((error) => {
    console.error("Failed to initialize syntax highlighter:", error);
  });

// Cache for resolved languages to improve performance
const languageCache = new Map<string, string>();
const themeCache = new Map<string, string>();

// Try to get highlighter if ready, otherwise return null
function getHighlighterSync(): Highlighter | null {
  return highlighterInstance;
}

// Check if language is supported in bundled languages
function isLanguageSupported(lang: string): boolean {
  return lang === "text" || lang in bundledLanguages;
}

// Check if theme is supported in bundled themes
function isThemeSupported(theme: string): boolean {
  return theme in bundledThemes;
}

export class Minted {
  static displayName = "Minted";
  static args: Record<string, unknown[]> = {
    minted: ["HV", "kv?", "g"],
    "minted*": ["HV", "kv?", "g"],
  };

  private packageOptions?: Map<string, unknown> | Record<string, unknown>;

  constructor(_generator: MintedGenerator, options?: unknown) {
    if (options && typeof options === "object") {
      if (options instanceof Map) {
        this.packageOptions = options;
      } else {
        this.packageOptions = options as Record<string, unknown>;
      }
    }
  }

  minted(
    options: Map<string, unknown> | undefined,
    language: unknown,
    content: string,
  ): unknown[] {
    return this.render(options, language, content, false);
  }

  "minted*"(
    options: Map<string, unknown> | undefined,
    language: unknown,
    content: string,
  ): unknown[] {
    return this.render(options, language, content, true);
  }

  private render(
    options: Map<string, unknown> | undefined,
    language: unknown,
    content: string,
    starred: boolean,
  ): unknown[] {
    const resolvedOptions = this.resolveOptions(options, starred);
    const resolvedLanguage = this.resolveLanguage(language);
    const normalizedContent = this.normalizeContent(content);

    // Check if language and theme are supported
    if (
      !isLanguageSupported(resolvedLanguage) ||
      !isThemeSupported(resolvedOptions.theme)
    ) {
      return [this.createPlainBlock(resolvedLanguage, normalizedContent)];
    }

    // Try to use highlighter if it's ready
    const highlighter = getHighlighterSync();
    if (highlighter) {
      try {
        // Check if the language and theme are loaded in the highlighter
        const loadedLangs = highlighter.getLoadedLanguages();
        const loadedThemes = highlighter.getLoadedThemes();

        if (
          (resolvedLanguage === "text" ||
            loadedLangs.includes(resolvedLanguage)) &&
          loadedThemes.includes(resolvedOptions.theme)
        ) {
          const highlightedHtml = highlighter.codeToHtml(normalizedContent, {
            lang: resolvedLanguage,
            theme: resolvedOptions.theme,
          });

          const element = this.createHighlightedElement(
            highlightedHtml,
            resolvedLanguage,
            resolvedOptions.linenos,
          );

          return [element];
        }
      } catch (error) {
        console.warn(
          "minted: syntax highlighting failed, falling back to plain text:",
          error,
        );
      }
    }

    // Highlighter not ready or language/theme not loaded, return plain block
    return [this.createPlainBlock(resolvedLanguage, normalizedContent)];
  }

  private resolveOptions(
    envOptions: Map<string, unknown> | undefined,
    starred: boolean,
  ): ResolvedOptions {
    const themeOption =
      this.getOption(envOptions, "theme") ?? this.getOptionFromPackage("theme");
    const theme = this.resolveTheme(themeOption);

    const packageLinenos = this.getBooleanOption(
      this.getOptionFromPackage("linenos"),
    );
    const envLinenos = this.getBooleanOption(
      this.getOption(envOptions, "linenos"),
    );

    let linenos = packageLinenos ?? false;
    if (envLinenos !== undefined) {
      linenos = envLinenos;
    } else if (starred) {
      linenos = false;
    }

    return { theme, linenos };
  }

  private resolveLanguage(language: unknown): string {
    const raw = this.extractText(language).toLowerCase();
    if (!raw) {
      return "text";
    }

    // Check cache first for performance
    const cached = languageCache.get(raw);
    if (cached !== undefined) {
      return cached;
    }

    let resolved: string;

    // Check direct match in bundled languages
    if (raw in bundledLanguages) {
      resolved = raw;
    } else {
      // Check common aliases (inlined for performance)
      const commonAliases: Record<string, string> = {
        js: "javascript",
        ts: "typescript",
        py: "python",
        sh: "bash",
        shell: "bash",
        htm: "html",
      };

      const aliased = commonAliases[raw];
      if (aliased && aliased in bundledLanguages) {
        resolved = aliased;
      } else {
        // Fallback: check bundledLanguagesAlias for any other aliases
        resolved = "text"; // Default fallback
        if (raw in bundledLanguagesAlias) {
          const aliasedLang =
            bundledLanguagesAlias[raw as keyof typeof bundledLanguagesAlias];
          // Find canonical name in bundled languages
          for (const [key, value] of Object.entries(bundledLanguages)) {
            if (value === aliasedLang) {
              resolved = key;
              break;
            }
          }
        }
      }
    }

    // Cache the result for future lookups
    languageCache.set(raw, resolved);
    return resolved;
  }

  private resolveTheme(theme: unknown): string {
    if (typeof theme === "string") {
      const normalized = theme.trim().toLowerCase();

      // Check cache first
      const cached = themeCache.get(normalized);
      if (cached !== undefined) {
        return cached;
      }

      const resolved = isThemeSupported(normalized)
        ? normalized
        : "github-light";
      themeCache.set(normalized, resolved);
      return resolved;
    }
    return "github-light";
  }

  private getOption(
    options: Map<string, unknown> | undefined,
    key: string,
  ): unknown {
    if (!options) {
      return undefined;
    }

    return options.get(key) ?? options.get(key.toLowerCase());
  }

  private getOptionFromPackage(key: string): unknown {
    if (!this.packageOptions) {
      return undefined;
    }

    if (this.packageOptions instanceof Map) {
      return (
        this.packageOptions.get(key) ??
        this.packageOptions.get(key.toLowerCase())
      );
    }

    const record = this.packageOptions as Record<string, unknown>;
    return record[key] ?? record[key.toLowerCase()];
  }

  private getBooleanOption(value: unknown): boolean | undefined {
    if (value === undefined) {
      return undefined;
    }

    if (typeof value === "boolean") {
      return value;
    }

    if (typeof value === "number") {
      return value !== 0;
    }

    if (typeof value === "string") {
      const normalized = value.trim().toLowerCase();
      if (
        normalized === "" ||
        normalized === "true" ||
        normalized === "yes" ||
        normalized === "on" ||
        normalized === "1"
      ) {
        return true;
      }
      if (
        normalized === "false" ||
        normalized === "no" ||
        normalized === "off" ||
        normalized === "0"
      ) {
        return false;
      }
      return Boolean(normalized);
    }

    if (value instanceof Map) {
      return value.size > 0;
    }

    return Boolean(value);
  }

  private extractText(value: unknown): string {
    if (typeof value === "string") {
      return value.trim();
    }

    if (
      value &&
      typeof (value as { textContent?: string }).textContent === "string"
    ) {
      return ((value as { textContent?: string }).textContent ?? "").trim();
    }

    return "";
  }

  private normalizeContent(content: string): string {
    let normalized = content.replace(/\r\n/g, "\n");
    if (normalized.startsWith("\n")) {
      normalized = normalized.slice(1);
    }
    if (normalized.endsWith("\n")) {
      normalized = normalized.slice(0, -1);
    }
    return normalized;
  }

  private createHighlightedElement(
    highlightedHtml: string,
    language: string,
    linenos: boolean,
  ): Element {
    const container = document.createElement("div");
    container.innerHTML = highlightedHtml;

    const pre = container.firstElementChild as HTMLElement | null;
    if (!pre) {
      return this.createPlainBlock(language, highlightedHtml);
    }

    this.addClass(pre, "minted-block");
    pre.setAttribute("data-language", language);

    if (linenos) {
      this.applyLineNumbers(pre);
    }

    container.removeChild(pre);
    return pre;
  }

  private applyLineNumbers(pre: HTMLElement): void {
    const codeElement = pre.querySelector("code");
    if (!codeElement) {
      return;
    }

    const lineElements = Array.from(
      codeElement.querySelectorAll<HTMLElement>(".line"),
    );
    let lineNumber = 1;
    for (const lineElement of lineElements) {
      lineElement.setAttribute("data-line-number", String(lineNumber));
      lineNumber++;
    }

    this.addClass(pre, "minted-with-line-numbers");
  }

  private createPlainBlock(language: string, content: string): Element {
    const pre = document.createElement("pre");
    pre.setAttribute("class", "minted-plain");
    pre.setAttribute("data-language", language);

    const codeElement = document.createElement("code");
    codeElement.textContent = content;
    pre.appendChild(codeElement);

    return pre;
  }

  private addClass(node: Element, className: string): void {
    const element = node as HTMLElement;
    if (typeof element.classList !== "undefined" && element.classList) {
      element.classList.add(className);
      return;
    }

    const existing = node.getAttribute("class");
    node.setAttribute(
      "class",
      existing ? `${existing} ${className}`.trim() : className,
    );
  }
}
