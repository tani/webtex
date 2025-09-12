import type { GraphicxGenerator } from "../interfaces";

export class Graphicx {
  static displayName = "Graphicx";
  static args: Record<string, unknown[]> = {
    rotatebox: ["H", "kv?", "n", "hg"],
    scalebox: ["H", "n", "n?", "g"],
    reflectbox: ["H", "g"],
    resizebox: ["H", "s", "l", "l", "g"],
    graphicspath: ["HV", "gl"],
    includegraphics: ["H", "s", "kv?", "kv?", "k"],
  };

  private g: GraphicxGenerator;
  options?: unknown;

  constructor(generator: GraphicxGenerator, options?: unknown) {
    this.g = generator;
    this.options = options;
  }

  rotatebox(_kvl: unknown, _angle: unknown, _text: unknown): unknown[] {
    return [];
  }

  scalebox(_hsc: unknown, _vsc?: unknown, _text?: unknown): unknown[] {
    return [];
  }

  reflectbox(text: unknown): unknown[] {
    return this.scalebox(-1, 1, text);
  }

  resizebox(
    _s: unknown,
    _hl: unknown,
    _vl: unknown,
    _text: unknown,
  ): unknown[] {
    return [];
  }

  graphicspath(_paths: unknown): unknown[] {
    return [];
  }

  includegraphics(
    _s: unknown,
    kvl: Map<string, unknown>,
    _kvl2: unknown,
    file: unknown,
  ): unknown[] {
    const width = (kvl.get("width") as number) ?? 100;
    const height = (kvl.get("height") as number) ?? 100;
    const filename = (file as string) ?? "";
    return [this.g.createImage(width, height, filename)];
  }
}
