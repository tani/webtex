import juice from "juice";
import { runAsWorker } from "unasync";

//
//  The default options
//
const importMap = {
  "mathjax/es5/adaptors/liteDOM.js": () =>
    import("mathjax/es5/adaptors/liteDOM.js"),
  "xyjax/build/xypic.js": () => import("xyjax/build/xypic.js"),
};

// Configure MathJax
globalThis.MathJax = {
  loader: {
    source: {},
    require: (path) => importMap[path](),
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

export function tex2svg(math = "", argv = { display: true }) {
  if (!MathJax.tex2svg || !MathJax.startup.adaptor || !MathJax.svgStylesheet) {
    throw new Error("MathJax not properly initialized");
  }
  // Ensure display property is always defined
  const options = { display: argv.display ?? true };
  const node = MathJax.tex2svg(math, options);
  const adaptor = MathJax.startup.adaptor;
  const stylesheet = adaptor.textContent(MathJax.svgStylesheet());
  const html = adaptor.outerHTML(node);
  return juice(`${html}<style>${stylesheet}</style>`);
}

async function tex2svg_wrapper(math, argv = { display: true }) {
  await import("mathjax/es5/tex-svg-full.js");
  await MathJax.startup.promise;
  return tex2svg(math, argv);
}

runAsWorker(tex2svg_wrapper);
