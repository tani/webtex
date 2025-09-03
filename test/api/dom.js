#!/usr/bin/env node

const { parse, HtmlGenerator } = require('../../dist/latex.js');
const { createHTMLWindow } = require('svgdom');

global.window = createHTMLWindow()
global.document = window.document

let latex = "Hi, this is a line of text."

let generator = new HtmlGenerator({ hyphenate: false })

let fragment = parse(latex, { generator: generator }).domFragment()

console.log(fragment.firstChild.outerHTML)