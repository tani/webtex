#!/usr/bin/env node

import { parse, HtmlGenerator } from "../../dist/latex.js";
import { createHTMLWindow } from "svgdom";

global.window = createHTMLWindow();
global.document = window.document;

const latex = "Hi, this is a line of text.";

const generator = new HtmlGenerator({ hyphenate: false });

const fragment = parse(latex, { generator }).domFragment();

console.log(fragment.firstChild.outerHTML);
