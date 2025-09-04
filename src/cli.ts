#!/usr/bin/env node
const { createHTMLWindow } = require('svgdom');
const util = require('util');
const path = require('path');
const fs = require('fs-extra');
const stdin = require('stdin');
const { program } = require('commander');
const { html: beautifyHtml } = require('js-beautify');
const { he, parse, HtmlGenerator } = require('../dist/latex.js');
const en = require('hyphenation.en-us');
const de = require('hyphenation.de');
const info = require('../package.json');

global.window = createHTMLWindow();
global.document = window.document;
he.encode.options.strict = true;
he.encode.options.useNamedReferences = true;
const addStyle = (url: string, styles?: string[]): string[] => {
  if (!styles) {
    return [url];
  } else {
    return Array.from(styles).concat([url]);
  }
};
program.name(info.name).version(info.version).description(info.description).usage('[options] [files...]').option('-o, --output <file>', 'specify output file, otherwise STDOUT will be used').option('-a, --assets [dir]', 'copy CSS and fonts to the directory of the output file, unless dir is given (default: no assets are copied)').option('-u, --url <base URL>', 'set the base URL to use for the assets (default: use relative URLs)').option('-b, --body', 'don\'t include HTML boilerplate and CSS, only output the contents of body').option('-e, --entities', 'encode HTML entities in the output instead of using UTF-8 characters').option('-p, --pretty', 'beautify the html (this may add/remove spaces unintentionally)').option('-c, --class <class>', 'set a default documentclass for documents without a preamble', 'article').option('-m, --macros <file>', 'load a JavaScript file with additional custom macros').option('-s, --stylesheet <url>', 'specify an additional style sheet to use (can be repeated)', addStyle).option('-n, --no-hyphenation', 'don\'t insert soft hyphens (disables automatic hyphenation in the browser)').option('-l, --language <lang>', 'set hyphenation language', 'en').on('--help', function(){
  return console.log('\nIf no input files are given, STDIN is read.');
}).parse(process.argv);
const options = program.opts();
let CustomMacros: any;
if (options.macros) {
  const macros = path.resolve(process.cwd(), options.macros);
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
const getLanguagePatterns = (language: string) => {
  switch (language) {
    case 'en':
      return en;
    case 'de':
      return de;
    default:
      console.error(`error: language '${language}' is not supported yet`);
      process.exit(1);
  }
};

const htmlOptions = {
  hyphenate: options.hyphenation,
  languagePatterns: getLanguagePatterns(options.language),
  documentClass: options['class'],
  CustomMacros: CustomMacros,
  styles: options.style || []
};
const readFile = util.promisify(fs.readFile);
const input = program.args.length
  ? Promise.all(program.args.map(file => readFile(file)))
  : new Promise<string>((resolve) => {
      stdin((str: string) => {
        resolve(str);
      });
    });
const processInput = async () => {
  try {
    let text = await input;
    
    if (Array.isArray(text)) {
      text = text.join("\n\n");
    }
    
    const generator = parse(text, {
      generator: new HtmlGenerator(htmlOptions)
    });
    
    let html: string;
    if (options.body) {
      const div = document.createElement('div');
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
      fs.writeFileSync(options.output, html);
    } else {
      process.stdout.write(html + '\n');
    }
  } catch (err) {
    console.error(err.toString());
    process.exit(1);
  }
};

processInput();
let dir = options.assets;
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
  const css = path.join(dir, 'css');
  const fonts = path.join(dir, 'fonts');
  const js = path.join(dir, 'js');
  fs.mkdirpSync(css);
  fs.mkdirpSync(fonts);
  fs.mkdirpSync(js);
  fs.copySync(path.join(__dirname, '../dist/css'), css);
  fs.copySync(path.join(__dirname, '../dist/fonts'), fonts);
  fs.copySync(path.join(__dirname, '../dist/js'), js);
}