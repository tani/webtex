#!/usr/bin/env node

// #region code
import { document, HtmlGenerator, parse, window } from "webtex";

void window;
void document;

const latex = "Hi, this is a line of text.";

const generator = new HtmlGenerator({ hyphenate: false });

const doc = parse(latex, { generator: generator }).htmlDocument();

console.log(doc.documentElement.outerHTML);
// #endregion code
