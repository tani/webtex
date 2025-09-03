#!/usr/bin/env node

const { parse, HtmlGenerator } = require('../../dist/latex.js');
const { createHTMLWindow } = require('svgdom');

global.window = createHTMLWindow();
global.document = window.document;

const latex = "Hi, this is a line of text.";

const generator = new HtmlGenerator({ hyphenate: false });

const fragment = parse(latex, { generator }).domFragment();

console.log(fragment.firstChild.outerHTML);