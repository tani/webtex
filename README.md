# LaTeX to HTML5 translator using a PEG.js parser

This is a LaTeX to HTML5 translator written in JavaScript using PEG.js.
`latex2e-js` for LaTeX is similar in spirit to `marked` for Markdown.

latex2e-js tries to be absolutely and uncompromisingly exact and compatible with LaTeX.
The generated HTML is exactly what is meant to be output, down to the last
space. The CSS makes it look like LaTeX output&mdash;except where impossible in principle,
see limitations.

## History

This project was launched as [LaTeX.js](https://github.com/michael-brade/LaTeX.js).

We forked from the project because we were going to add/remove the following features.

- [x] Use rollup instead of webpack
- [x] ES6 Modules support
- [ ] WebWorker Support
- [ ] Export typed file for TypeScript
- [ ] Speed Up for rendering

## Installation

For CLI usage install it globally:

```
npm install -g fgborges/latex2e-js
```


## Usage

latex2e-js can be used as a web component:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="content-type" content="text/html; charset=UTF-8">
  <meta http-equiv="content-language" content="en">

  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <script type="module">
  import latexjs from "https://cdn.jsdelivr.net/gh/fgbores/latex2e-js@develop/dist/latex.component.js"
  customElements.define('latex-js', latexjs)
  </script>

  <style>
    latex-js {
      display: inline-block;
      width: 40%;
      border: 1px solid red;
      margin-right: 2em;
    }
  </style>

  <title>latex2e-js Web Component Test</title>
</head>

<body>
  <h1>Compiling LaTeX</h1>

  <latex-js baseURL="https://cdn.jsdelivr.net/gh/fgboregs/latex2e-js@develop/dist/">
    \documentclass{article}

    \begin{document}
    Hello World.
    \end{document}
  </latex-js>


  <latex-js hyphenate="false">
    Another.
  </latex-js>

</body>

</html>
```

This, however, requires a browser with support for the shadow DOM.

Then you need to decide how to embed the `<latex-js>` element and style it accordingly with CSS; most importantly, set
the `display:` property. It is `inline` by default.

The `<latex-js>` element supports a few attributes to configure latex2e-js:

- `baseURL`: if you want the latex2e-js component to use a different set of stylesheets than the ones delivered along
  with the `latex.component.js`, then you need to set the base using this attribute.

- `hyphenate`: enable or disable hyphenation (default: enabled)


### Library

This is the low-level use-case which gives the greatest control over the translation process.

latex2e-js is divided into a parser and a generator, so that in theory you could switch the generator to create e.g. plain
text instead of HTML. Currently, only a HTML generator exists.

Import the parser and generator, then parse and translate to HTML:

```js
import { parse, HtmlGenerator } from 'latex.js'

let latex = "Hi, this is a line of text."


let generator = new HtmlGenerator({ hyphenate: false })

let doc = parse(latex, { generator: generator }).htmlDocument()

console.log(doc.outerHTML)
```

The `HtmlGenerator` takes several options, see the API section below.


### In the Browser

If you want to use the parser and the generator manually, you can either use your own build or use a link directly to
the jsDelivr CDN:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <meta charset="UTF-8">
  <meta http-equiv="content-type" content="text/html; charset=UTF-8">
  <meta http-equiv="content-language" content="en">

  <meta http-equiv="X-UA-Compatible" content="ie=edge">

  <title>latex2e-js API Test</title>
</head>

<body>
  <h1>Compiling LaTeX</h1>

  <script>
    import latex2ejs from "https://cdn.jsdelivr.net/gh/fgborges/latex2e-js@develop/dist/latex.esm.js"
    var text = "Hi, this is a line of text."

    var generator = new latex2ejs.HtmlGenerator({ hyphenate: false })

    generator = latex2ejs.parse(text, { generator: generator })

    document.body.appendChild(generator.stylesAndScripts("https://cdn.jsdelivr.net/gh/fgborges/latex2e-js@develop/dist/"))
    document.body.appendChild(generator.domFragment())
  </script>
</body>

</html>
```

Note that in this case the styles and scripts are not encapsulated, so they clash with the text and style of the
containing page.


## Tests

To build it and run the tests, clone this repository and execute:

```
npm install
npm run build
npm test
```

To verify the screenshots (the CSS tests), ImageMagick needs to be installed. Screenshots are taken
with Chromium using `puppeteer`.

## Directory Structure

General structure:

- `src`: all the latex2e-js sources
- `dist`: the compiled and minified source
- `test`: unit tests and test driver


Files and classes needed to translate LaTeX documents to HTML documents:

- the parser: `src/latex-parser.pegjs`
- the generator: `src/html-generator.ls`
- macros and documentclasses: `src/macros.ls`, `src/symbols.ls`, `src/documentclasses/*.ls`
- packages: `src/packages/*.ls`

- the CLI: `src/latex.js.ls`
- the webcomponent: `src/latex.component.js`
- the library API: `src/index.js`

Files needed to display the generated HTML document:

- `src/js/` (and thus `dist/js/`): JavaScript that is needed by the resulting HTML document
- `src/css/` (and thus `dist/js/`): CSS needed by translated HTML document
- `src/fonts/` (and thus `dist/fonts`): fonts included by the translated HTML document




## Architecture

The generated PEG parser parses the LaTeX code. While doing so, it calls appropriate generator functions.
The generator then uses the Macros class to execute the macros that the parser encounters.

Both, the parser and the macros create the resulting HTML DOM tree by calling the HtmlGenerator functions.

The generator also holds the stack, the lengths, counters, fonts, references, etc. It provides some of
TeX's primitives and basic functionality, so to speak.

## Definition of Custom Macros

To define your own LaTeX macros in JavaScript and extend latex2e-js, you have to create a class that contains these macros
and pass it to the `HtmlGenerator` constructor in the `options` object as `CustomMacros` property. For instance:

```js
var generator = new latexjs.HtmlGenerator({
  CustomMacros: (function() {
    var args      = CustomMacros.args = {},
        prototype = CustomMacros.prototype;

    function CustomMacros(generator) {
      this.g = generator;
    }

    args['bf'] = ['HV']
    prototype['bf'] = function() {
      this.g.setFontWeight('bf')
    };

    return CustomMacros;
  }())
});
```

to define the LaTeX2.09 macro `\bf`.

If you are going to define custom macros in an external file and you want to use that with the CLI, you will have to
name the file just like the class, or you will have to default export it.


### Macro Arguments

`CustomMacros.args` above is a <[Map]<[string], [Array]<[string]>>>, mapping the macro name to the type and arguments of
the macro. If a macro doesn't take arguments and is a horizontal-mode macro, `args` can be left undefined for it.

The first array entry of `args[<macro name>]` declares the macro type:

| type | meaning |
| ---- | ------- |
| `H`  | horizontal-mode macro |
| `V`  | vertical-mode macro - ends the current paragraph |
| `HV` | horizontal-vertical-mode macro: must return nothing, i.e., doesn't create output |
| `P`  | only in preamble |
| `X`  | special entry, may be used multiple times; execute action (macro body) already now with whatever arguments have been parsed so far; this is needed when things should be done before the next arguments are parsed - no value should be returned by the macro in this case, for it will just be ignored |

The rest of the list (array entries) declares the arguments:

| arg  | delimiters | meaning                       | content | output |
| ---- | --- |--------------------------------------|------|-----|
| `s`  |     | optional star                        |||
|||||
|  `g` | { } | LaTeX code group (possibly long)     | TeX allows `\endgraf`, but not `\par`... so allow `\par` as well | |
| `hg` | { } | restricted horizontal mode material  |||
| `o?` | [ ] | optional arg                         | LaTeX code |  |
|||||
|  `h` |     | restricted horizontal mode material  ||  |
|||||
|  `i` | { } | id                                   | letters only |  |
| `i?` | [ ] | optional id                          | letters only |  |
|  `k` | { } | key                                  | anything but = and , | |
| `k?` | [ ] | optional key                         | anything but = and , | |
|`csv` | { } | comma-separated values               || |
|`csv?`| [ ] | optional comma-separated values      ||  |
|`kv?` | [ ] | optional key-value list              ||  |
|  `u` | { } | url                                  | a URL as specified by RFC3986 |  |
|  `c` | { } | color specification                  | *name* or *float* or *float,float,float* |  |
|  `m` | { } | macro                                | `\macro` | |
|  `l` | { } | length                               ||  |
|`lg?` | { } | optional length group                ||  |
| `l?` | [ ] | optional length                      |||
| `cl` | { } | coordinate/length                    | `<float>` or TeX length |  |
|`cl?` | [ ] | optional coordinate/length           ||  |
|  `n` | { } | num expression                       ||  |
| `n?` | [ ] | optional num expression              ||  |
|  `f` | { } | float expression                     ||  |
|  `v` | ( ) | vector, a pair of coordinates        | (float/length, float/length) |
| `v?` |     | optional vector                      |||
|||||
| `is` |     | ignore (following) spaces            |||

So, in the following example, the macro `\title` would be a horizontal-vertical-mode macro that takes one mandatory
TeX-group argument:

```js
args['title'] = ['HV', 'g'];
```


Macros with types `H` or `V` have to return an array.

Environments take the return value of the corresponding macro and add their content as child/children to it.


## API

This section is going to describe the low-level API of the generator and the parser. You will only need it if you
implement your own macros, or if you want to access parts of the result and keep processing them.


### Parser

#### `parser.parse(latex, { generator: <HtmlGenerator> })`

This function parses the given input LaTeX document and returns a generator that creates the output document.

Arguments:

- `latex` is the LaTeX source document
- options object: must contain a `generator` property with an instance of `HtmlGenerator`

Returns the `HtmlGenerator` instance.



### class: HtmlGenerator

#### CTOR: `new HtmlGenerator(options)`

Create a new HTML generator. `options` is an <[Object]> that can have the following properties:

- `documentClass`: <[string]> the default document class if a document without preamble is parsed
- `CustomMacros`: a <[constructor]>/<[function]> with additional custom macros
- `hyphenate`: <[boolean]> enable or disable automatic hyphenation
- `languagePatterns`: language patterns object to use for hyphenation if it is enabled
- `styles`: <[Array]<[string]>> additional CSS stylesheets


#### `htmlGenerator.reset()`

Reset the generator. Needs to be called before the generator is used for creating a second document.


#### `htmlGenerator.htmlDocument(baseURL)`

Returns the full DOM `HTMLDocument` representation of the LaTeX source, including `<head>` and `<body`>. This is meant
to be used as its own standalone webpage or in an `<iframe>`.

`baseURL` will be used as base for the scripts and stylesheets; if omitted, the base will be `window.location.href` or,
if not available, scripts and stylesheets will have relative URLs.

To serialize it, use `htmlGenerator.htmlDocument().outerHTML`.

#### `htmlGenerator.stylesAndScripts(baseURL)`

Returns a `DocumentFragment` with `<link>` and `<script>` elements. This usually is part of the `<head>` element.

If `baseURL` is given, the files will be referenced with absolute URLs, otherwise with relative URLs.


#### `htmlGenerator.domFragment()`

Returns the DOM `DocumentFragment`. This does not include the scripts and stylesheets and is meant for testing and
low-level embedding.


#### `htmlGenerator.documentTitle()`

The title of the document.




## Limitations

- I haven't created an intermediate AST yet, so TeX's conditional expressions are impossible
- deprecated macros, or macros that are not supposed to be used in LaTeX, won't even exist in latex2e-js.
  Examples include: `eqnarray`, the old LaTeX 2.09 font macros `\it`, `\sl`, etc. Also missing are most of the plainTeX macros.
  See also [`l2tabuen.pdf`](ftp://ftp.dante.de/tex-archive/info/l2tabu/english/l2tabuen.pdf).
- incorrect but legal markup in LaTeX won't produce the same result in latex2e-js - like when using `\raggedleft` in the
  middle of a paragraph; but the latex2e-js result should be intuitively correct.
- because of the limitations when parsing TeX as a context-free grammar (see [below](#parsing-tex)), native LaTeX packages
  cannot be parsed and loaded. Instead, the macros those packages (and documentclasses) provide have to be implemented in
  JavaScript.


## Limitations of latex2e-js due to HTML and CSS

The following features in LaTeX just cannot be translated to HTML, not even when using JavaScript:

- TeX removes any whitespace from the beginning and end of a line, even consecutive ones that would be printed in the middle
  of a line, like `\ ` or `~` or ^^0020. This is not possible in HTML (yet - maybe it will be with CSS4).
- horizontal glue, like `\hfill` in a paragraph of text, is not possible
- vertical glue makes no sense in HTML, and is impossible to emulate, except in boxes with fixed height
- `\vspace{}` with a negative value in horizontal mode, i.e. in the middle of a paragraph of text, is not possible
  (but this feature is useless anyway)

And the concept of pages does not really apply to HTML, so any macro related to pagebreaks will be ignored. One
could say that splitting a HTML file into multiple files is like a pagebreak, but then, still, it would be much
easier to handle: just choose a break before a new section or paragraph. There is no absolute space limitation
like on a real page.



## <a name="parsing-tex"></a> Limitations when parsing TeX as a context-free grammar

This is a PEG parser, which means it interprets LaTeX as a context-free language. However, TeX (and therefore LaTeX) is
Turing complete, so TeX can only really be parsed by a complete Turing machine. It is not possible to parse the full
TeX language with a static parser. See
[here](https://tex.stackexchange.com/questions/4201/is-there-a-bnf-grammar-of-the-tex-language) for some interesting
examples.

It is even undecidable whether a TeX program has a parse tree. There has been done some research
on the problem of parsing TeX, see [here](http://www.mathematik.uni-marburg.de/~seba/publications/sle10.pdf).

To quote the four problems of TeX:

- Since TeX has dynamic scoping, it is not possible to determine statically
  wheather `a` is an argument to `\app` in `\app a` or just another letter. It depends on the definition of `\app` at
  runtime.

- Macros can be passed as arguments to other macros, further complicating this problem. E.g.:
  ```tex
  \def\app #1 #2 {#1 #2}
  \def\id #1 {#1}
  \app a b
  \app \id c
  ```
  Thus, targets of macro calls can in general not be determined statically.

- TeX has a lexical macro system, which means macro bodies do not have to be syntactically correct pieces
  of TeX code. Also, macros can expand to new macro definitions.

- Tex allows custom macro call syntax. Basically, any syntax could be changed.


I therefore take a slightly different approach:

- First, I don't care about TeX, but only LaTeX, and most LaTeX documents do not use TeX syntax, or `\def` in
  particular. Therefore, this parser assumes standard LaTeX syntax and catcodes.

- Second, for now there is no way of defining macros, only expanding macros is supported. So if a new
  LaTeX macro is needed, reimplement it in JavaScript directly, thus circumventing the problem altogether.


### Expansion and Execution

Additionally, this parser does not implement TeX's distinction of expansion and
execution. I am not yet sure if I need to implement it at all. Right now, there is only one phase that takes a macro
and returns an HTML fragment.

Skipped spaces and macros that expand to a macro taking a parameter further down in the input provide a good
illustration of why TeX makes this distinction. Consider the commands
```tex
\def\a{\penalty200}
\a 0
```
This is not equivalent to
```tex
\penalty200 0
```
which would place a penalty of 200, and typeset the digit 0. Instead, it expands to
```tex
\penalty2000
```
because the space after \a is skipped in the input processor. Later stages of processing then receive the sequence
```tex
\a0
```
However, LaTeX documents themselves usually don't rely on or need this feature--that is, until I'm convinced otherwise.

This also means that you cannot use `\vs^^+ip` to have latex2e-js interpret it as `\vskip`. Again, this is a feature
that most people will probably never need.



## Alternatives

If you need a LaTeX to HTML translator that also understands TeX to some extent, take a look at:

* [TeX4ht](https://tug.org/applications/tex4ht/mn.html) (TeX)
* [LaTeXML](https://github.com/brucemiller/LaTeXML) (Perl)
* ~~[HEVEA](http://hevea.inria.fr/) (OCaml)~~
* ~~[plasTeX](https://github.com/tiarno/plastex) (Python)~~

Update: sadly, those last two are nowhere near the quality of latex2e-js.

There is no such alternative in JavaScript yet, though, which is why I started this project. I want to use it in my
`derby-entities-lib` project.


## License

This project is originally LaTeX.js. latex2e-js is forked from original project.

Copyright (c) 2015-2018 Michael Brade

Copyright (c) 2019 Fernando Garcias Borges All Rights Reserved.
