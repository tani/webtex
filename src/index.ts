import he from 'he'
import { parse, SyntaxError } from './latex-parser'
import { Generator } from './generator'
import { HtmlGenerator } from './html-generator'
import { LaTeXJSComponent } from './latex.component.mjs'

// Export types
export * from './types';

export {
    he,
    parse,
    SyntaxError,
    Generator,
    HtmlGenerator,
    LaTeXJSComponent
}
