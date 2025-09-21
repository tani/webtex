import juice from "juice";

// MathJax type definitions
interface MathJaxConfig {
  loader: {
    source: Record<string, unknown>;
    require: (path: string) => Promise<unknown>;
    load: string[];
    paths: Record<string, string>;
  };
  tex: {
    packages: string[];
  };
  svg: {
    fontCache: string;
  };
  startup: {
    typeset: boolean;
    promise?: Promise<void>;
    adaptor?: {
      textContent: (node: unknown) => string;
      outerHTML: (node: unknown) => string;
    };
  };
  tex2svg?: (math: string, argv: { display: boolean }) => unknown;
  svgStylesheet?: () => unknown;
}

declare global {
  var MathJax: MathJaxConfig;
}

//
//  The default options
//
const importMap = {
  "mathjax/es5/adaptors/liteDOM.js": () =>
    import("mathjax/es5/adaptors/liteDOM.js"),
  "xyjax/build/xypic.js": () => import("xyjax/build/xypic.js"),
} as Record<string, () => Promise<unknown>>;

// Configure MathJax
globalThis.MathJax = {
  loader: {
    source: {},
    require: (path: string) => importMap[path](),
    load: ["adaptors/liteDOM", "[custom]/xypic"],
    paths: {
      mathjax: "mathjax/es5",
      custom: "xyjax/build",
    },
  },
  tex: {
    packages: [
      "base",
      "verb",
      "upgreek",
      "unicode",
      "textmacros",
      "textcomp",
      "tagformat",
      "setoptions",
      "require",
      "physics",
      "noundefined",
      "noerrors",
      "newcommand",
      "mhchem",
      "mathtools",
      "html",
      "gensymb",
      "extpfeil",
      "enclose",
      "empheq",
      "configmacros",
      "colorv2",
      "colortbl",
      "color",
      "centernot",
      "cases",
      "cancel",
      "bussproofs",
      "braket",
      "boldsymbol",
      "bbox",
      "autoload",
      "amscd",
      "ams",
      "action",
      "xyjax",
    ],
  },
  svg: {
    fontCache: "none",
  },
  startup: {
    typeset: false,
  },
};

//  Load the MathJax startup module
await import("mathjax/es5/tex-svg-full.js");

//  Wait for MathJax to start up
await MathJax.startup.promise;

export function tex2svg(math = "", argv = { display: true }) {
  if (!MathJax.tex2svg || !MathJax.startup.adaptor || !MathJax.svgStylesheet) {
    throw new Error("MathJax not properly initialized");
  }
  const node = MathJax.tex2svg(math, argv);
  const adaptor = MathJax.startup.adaptor;
  const stylesheet = adaptor.textContent(MathJax.svgStylesheet());
  const html = adaptor.outerHTML(node);
  return juice(`${html}<style>${stylesheet}</style>`);
}

// console.log(tex2svg("\\frac{a}{b}"));