import he from "he";
import { Generator } from "./generator";
import { HtmlGenerator } from "./html-generator";
import { LaTeXJSComponent } from "./latex.component.mjs";
import { SyntaxError as ParserSyntaxError, parse } from "./latex-parser";

// Export types
export * from "./types";

export {
	he,
	parse,
	ParserSyntaxError as SyntaxError,
	Generator,
	HtmlGenerator,
	LaTeXJSComponent,
};
