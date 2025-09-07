#!/usr/bin/env node

import {
	document,
	HtmlGenerator,
	parse,
	window,
} from "../../dist/webtex.browser.js";

void window;
void document;

const latex = "Hi, this is a line of text.";

const generator = new HtmlGenerator({ hyphenate: false });

const fragment = parse(latex, { generator }).domFragment();

console.log(fragment.firstChild.outerHTML);
