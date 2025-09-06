#!/usr/bin/env node

import { createHTMLWindow } from "svgdom";
// #region code
import { HtmlGenerator, parse } from "webtex";

global.window = createHTMLWindow();
global.document = window.document;

const latex = "Hi, this is a line of text.";

const generator = new HtmlGenerator({ hyphenate: false });

const doc = parse(latex, { generator }).htmlDocument();

console.log(doc.documentElement.outerHTML);
// #endregion code
