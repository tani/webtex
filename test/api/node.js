#!/usr/bin/env node

// #region code
import { parse, HtmlGenerator } from "latex.js";
import { createHTMLWindow } from "svgdom";

global.window = createHTMLWindow();
global.document = window.document;

const latex = "Hi, this is a line of text.";

const generator = new HtmlGenerator({ hyphenate: false });

const doc = parse(latex, { generator }).htmlDocument();

console.log(doc.documentElement.outerHTML);
// #endregion code
