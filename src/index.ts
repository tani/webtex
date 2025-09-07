import he from "he";
import { Generator } from "./generator";
import { HtmlGenerator } from "./html-generator";
import { SyntaxError as ParserSyntaxError, parse } from "./latex-parser";

// Export types
export * from "./types";
export { document, window } from "./window";

export {
	he,
	parse,
	ParserSyntaxError as SyntaxError,
	Generator,
	HtmlGenerator,
};
