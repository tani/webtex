import he from "he";
import { Generator } from "./generator";
import { HtmlGenerator } from "./html-generator";
import { SyntaxError as ParserSyntaxError, parse } from "./latex-parser";
export { document, window } from "#window";
// Export types
export * from "./types";

export {
  he,
  parse,
  ParserSyntaxError as SyntaxError,
  Generator,
  HtmlGenerator,
};
