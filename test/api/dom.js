#!/usr/bin/env node

import { createHTMLWindow } from "svgdom";
import { HtmlGenerator, parse } from "../../dist/latex.js";

global.window = createHTMLWindow();
global.document = window.document;

const latex = "Hi, this is a line of text.";

const generator = new HtmlGenerator({ hyphenate: false });

const fragment = parse(latex, { generator }).domFragment();

console.log(fragment.firstChild.outerHTML);
