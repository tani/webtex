#!/usr/bin/env node
const { createHTMLWindow, config } = require('svgdom');
const util = require('util');
const path = require('path');
const fs = require('fs-extra');
const stdin = require('stdin');
const program = require('commander');
const beautifyHtml = require('js-beautify').html;
const { he, parse, HtmlGenerator } = require('../dist/latex.js');
const en = require('hyphenation.en-us');
const de = require('hyphenation.de');
const info = require('../package.json');

let options: any, macros: string, CustomMacros: any, htmlOptions: any, readFile: any, input: Promise<any>, dir: string | boolean, css: string, fonts: string, js: string;
global.window = createHTMLWindow();
global.document = window.document;
he.encode.options.strict = true;
he.encode.options.useNamedReferences = true;
const addStyle = (url: string, styles?: string[]) => {
  if (!styles) {
    return [url];
  } else {
    return Array.from(styles).concat([url]);
  }
};
program.name(info.name).version(info.version).description(info.description).usage('[options] [files...]').option('-o, --output <file>', 'specify output file, otherwise STDOUT will be used').option('-a, --assets [dir]', 'copy CSS and fonts to the directory of the output file, unless dir is given (default: no assets are copied)').option('-u, --url <base URL>', 'set the base URL to use for the assets (default: use relative URLs)').option('-b, --body', 'don\'t include HTML boilerplate and CSS, only output the contents of body').option('-e, --entities', 'encode HTML entities in the output instead of using UTF-8 characters').option('-p, --pretty', 'beautify the html (this may add/remove spaces unintentionally)').option('-c, --class <class>', 'set a default documentclass for documents without a preamble', 'article').option('-m, --macros <file>', 'load a JavaScript file with additional custom macros').option('-s, --stylesheet <url>', 'specify an additional style sheet to use (can be repeated)', addStyle).option('-n, --no-hyphenation', 'don\'t insert soft hyphens (disables automatic hyphenation in the browser)').option('-l, --language <lang>', 'set hyphenation language', 'en').on('--help', () => {
  return console.log('\nIf no input files are given, STDIN is read.');
}).parse(process.argv);
options = program.opts();
if (options.macros) {
  macros = path.resolve(process.cwd(), options.macros);
  CustomMacros = require(macros);
  if (CustomMacros['default']) {
    CustomMacros = CustomMacros['default'];
  } else {
    CustomMacros = CustomMacros[path.parse(macros).name];
  }
}
if (options.body && (options.stylesheet || options.url)) {
  console.error("error: conflicting options: 'url' and 'stylesheet' cannot be used with 'body'!");
  process.exit(1);
}
htmlOptions = {
  hyphenate: options.hyphenation,
  languagePatterns: (() => {
    switch (options.language) {
    case 'en':
      return en;
    case 'de':
      return de;
    default:
      console.error(`error: language '${options.language}' is not supported yet`);
      return process.exit(1);
    }
  })(),
  documentClass: options['class'],
  CustomMacros: CustomMacros,
  styles: options.style || []
};
readFile = util.promisify(fs.readFile);
if (program.args.length) {
  input = Promise.all(program.args.map((file: string) => {
    return readFile(file);
  }));
} else {
  input = new Promise((resolve, reject) => {
    stdin((str: string) => {
      resolve(str);
    });
  });
}
input.then((text: any) => {
  let generator: any, div: HTMLDivElement, html: string;
  if (text.join) {
    text = text.join("\n\n");
  }
  generator = parse(text, {
    generator: new HtmlGenerator(htmlOptions)
  });
  if (options.body) {
    div = document.createElement('div');
    div.appendChild(generator.domFragment().cloneNode(true));
    html = div.innerHTML;
  } else {
    html = generator.htmlDocument(options.url).documentElement.outerHTML;
  }
  if (options.entities) {
    html = he.encode(html, {
      'allowUnsafeSymbols': true
    });
  }
  if (options.pretty) {
    html = beautifyHtml(html, {
      'end_with_newline': true,
      'wrap_line_length': 120,
      'wrap_attributes': 'auto',
      'unformatted': ['span']
    });
  }
  if (options.output) {
    return fs.writeFileSync(options.output, html);
  } else {
    return process.stdout.write(html + '\n');
  }
}).catch((err: Error) => {
  console.error(err.toString());
  return process.exit(1);
});
dir = options.assets;
if (options.assets === true) {
  if (!options.output) {
    console.error("assets error: either a directory has to be given, or -o");
    process.exit(1);
  } else {
    dir = path.posix.dirname(path.resolve(options.output));
  }
} else if (fs.existsSync(dir) && !fs.statSync(dir).isDirectory()) {
  console.error("assets error: the given path exists but is not a directory: ", dir);
  process.exit(1);
}
if (dir) {
  css = path.join(dir, 'css');
  fonts = path.join(dir, 'fonts');
  js = path.join(dir, 'js');
  fs.mkdirpSync(css);
  fs.mkdirpSync(fonts);
  fs.mkdirpSync(js);
  fs.copySync(path.join(__dirname, '../dist/css'), css);
  fs.copySync(path.join(__dirname, '../dist/fonts'), fonts);
  fs.copySync(path.join(__dirname, '../dist/js'), js);
}