# WebTeX

[![License](https://img.shields.io/github/license/tani/webtex.svg)](https://github.com/tani/webtex/blob/develop/LICENSE)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D14.0-brightgreen)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)

> **WebTeX** is a modern, enhanced fork of [LaTeX.js](https://github.com/michael-brade/LaTeX.js) - a JavaScript LaTeX to HTML5 translator that converts LaTeX documents into web-ready HTML while preserving formatting and mathematical expressions.

## 🌟 Features

- **📝 Complete LaTeX Support**: Comprehensive LaTeX document processing with high fidelity output
- **🧮 Advanced Mathematics**: Full KaTeX integration for complex mathematical expressions
- **🎨 Authentic Styling**: CSS that faithfully reproduces LaTeX typography and layout
- **🔧 Modern Tooling**: Built with TypeScript, esbuild bundler, and modern development practices
- **⚡ High Performance**: Optimized build system and efficient parsing
- **🌐 Web-First**: Enhanced HTML generation with iframe support and complete document structure
- **🎯 Type Safety**: Strict TypeScript implementation with comprehensive type definitions

## 🚀 Quick Start

### Installation

**CLI Usage (Global)**:
```bash
npm install -g webtex
```

**Library Usage (Project)**:
```bash
npm install webtex
```

### Basic Usage

**Command Line**:
```bash
# Convert LaTeX file to HTML
webtex input.tex -o output.html

# Include CSS and assets
webtex input.tex -o output.html -a

# Pretty print output
webtex input.tex -o output.html -p
```

**JavaScript API**:
```javascript
import { HtmlGenerator, parse } from 'webtex';

const latex = `
\\documentclass{article}
\\begin{document}
\\section{Hello WebTeX}
This is a LaTeX document with math: $E = mc^2$
\\end{document}
`;

const generator = new HtmlGenerator({ hyphenate: false });
const doc = parse(latex, { generator }).htmlDocument();
console.log(doc.documentElement.outerHTML);
```

## 🎭 Live Preview App

**🌐 [Try WebTeX Online →](https://webtex.pages.dev/app)**

WebTeX includes a modern live preview application with real-time LaTeX compilation. You can use it online or run it locally:

**Online Demo**: Visit [https://webtex.pages.dev/app](https://webtex.pages.dev/app) for the live editor.

**Local Development**:
```bash
cd app
python3 -m http.server 8080
# Open http://localhost:8080 in your browser
```

**Features**:
- 🖥️ **Iframe Rendering**: Isolated preview with complete HTML structure
- 🔄 **Real-time Compilation**: Instant preview as you type
- 📝 **Example Templates**: Built-in article, math, and table examples
- 💾 **Download Support**: Export compiled HTML with assets
- 🎨 **Modern UI**: Clean, responsive interface with syntax highlighting

## 🔄 Migration from Original LaTeX.js

WebTeX is a comprehensive modernization of the original LaTeX.js project with significant architectural improvements:

### 🏗️ **Build System Evolution**
| Original LaTeX.js | WebTeX |
|------------------|---------|
| **Rollup** bundler | **esbuild** - Modern, fast build tool |
| **LiveScript** source | **TypeScript** - Type-safe development |
| **Legacy tooling** | **Modern ecosystem** (Biome, Vitest) |

### 📊 **Mathematical Rendering**
- **KaTeX Integration**: Fast, high-quality mathematical rendering with KaTeX
- **Improved Math Packages**: Better support for `amsmath`, `amsfonts`, `amssymb`
- **Advanced Features**: Support for `bussproofs` package for proof trees

### 🛡️ **Type Safety & Quality**
- **Strict TypeScript**: Comprehensive type definitions throughout codebase
- **Modern Linting**: Biome for fast, consistent code formatting
- **Enhanced Testing**: Vitest with visual regression testing via Playwright
- **CI/CD**: Automated testing and quality checks

### 🎨 **Enhanced HTML Generation**
- **Complete Document Structure**: Full HTML5 with proper DOCTYPE and head elements
- **Iframe Support**: Isolated rendering for better web integration  
- **Improved CSS**: Enhanced styling with better cross-platform compatibility
- **Asset Management**: Streamlined font and stylesheet handling

### ⚡ **Performance Improvements**
- **Faster Builds**: esbuild's optimized bundling
- **Better Dependencies**: Updated to latest, secure package versions
- **Reduced Bundle Size**: Optimized output with tree shaking

## 📖 Documentation

### CLI Options

```
Usage: webtex [options] [files...]

Options:
  -o, --output <file>      Specify output file (default: STDOUT)
  -a, --assets [dir]       Copy CSS to output directory
  -u, --url <url>          Set base URL for assets
  -b, --body               Output body content only (no HTML boilerplate)
  -e, --entities           Encode HTML entities instead of UTF-8
  -p, --pretty             Beautify HTML output
  -c, --class <class>      Default document class (default: "article")
  -m, --macros <file>      Load custom macro definitions
  -s, --stylesheet <css>   Additional stylesheets (comma-separated)
  -n, --hyphenation        Enable hyphenation (default: true)
  -l, --language <lang>    Hyphenation language (default: "en")
  -h, --help               Show help
  -v, --version            Show version
```

### Supported LaTeX Features

**Document Classes**: `article`, `book`, `report`

**Mathematics**: 
- Inline and display math environments
- AMS math extensions (`amsmath`, `amsfonts`, `amssymb`)
- Complex expressions, matrices, alignments
- Proof trees (`bussproofs` package)

**Text Formatting**:
- Font families, sizes, and styles
- Lists (itemize, enumerate, description)
- Tables and alignments
- Cross-references and labels

**Advanced Features**:
- Custom macro definitions
- Package system with extensibility
- Hyphenation support (English, German)
- Picture environment for diagrams

## 🏗️ Development

### Prerequisites
- Node.js ≥ 22.0
- Node.js runtime and npm package manager

### Development Setup
```bash
git clone https://github.com/tani/webtex.git
cd webtex
npm install
npm run build
```

### Development Scripts
```bash
npm run build         # Full production build
npm run build:check   # Build only if dist/ doesn't exist  
npm run test:watch    # Development mode with tests
npm test              # Run all tests
npm run test:watch    # Run tests in watch mode
npm run lint          # Code linting and formatting
npm run typecheck     # TypeScript type checking
```

### Testing
WebTeX includes comprehensive testing:
- **Unit Tests**: Core functionality and parsing
- **Integration Tests**: End-to-end document processing  
- **Visual Tests**: Screenshot-based regression testing
- **API Tests**: Public interface validation

```bash
npm test test/unit/api.spec.ts        # API functionality tests
npm test test/visual/             # Visual regression tests  
npm test test/integration/        # Integration tests
```

## 🤝 Contributing

We welcome contributions! This project maintains the original LaTeX.js commitment to LaTeX compatibility while embracing modern development practices.

**Guidelines**:
- Follow TypeScript strict mode requirements
- Maintain comprehensive test coverage
- Use conventional commit messages
- Ensure all quality checks pass: `npm run lint && npm run typecheck && npm test`

## 📜 License & Attribution

**WebTeX** is licensed under the MIT License. See [LICENSE](LICENSE) for details.

### Original Project Attribution

WebTeX is built upon the excellent foundation of [LaTeX.js](https://github.com/michael-brade/LaTeX.js) by Michael Brade. We extend our gratitude to the original author and contributors for creating such a robust LaTeX parsing and rendering system.

**Original LaTeX.js**:
- Copyright (c) 2015-2021 Michael Brade
- Repository: https://github.com/michael-brade/LaTeX.js
- License: MIT

**WebTeX Enhancements**:
- Copyright (c) 2024 tani
- Repository: https://github.com/tani/webtex
- License: MIT

### Key Differences from Original

WebTeX represents a significant evolution while maintaining compatibility:

1. **Language Migration**: LiveScript → JavaScript → TypeScript
2. **Build System**: Rollup → esbuild with modern tooling
3. **Mathematics**: Enhanced KaTeX integration
4. **Type Safety**: Comprehensive TypeScript implementation
5. **Testing**: Modern test framework with visual regression
6. **Web Integration**: Enhanced HTML generation and iframe support

## 🌐 Ecosystem

**Related Projects**:
- [LaTeX.js](https://github.com/michael-brade/LaTeX.js) - Original project
- [KaTeX](https://github.com/KaTeX/KaTeX) - Mathematics rendering
- [esbuild](https://esbuild.github.io/) - Build tooling
- [TypeScript](https://www.typescriptlang.org/) - Type safety

## ⭐ Show Your Support

If WebTeX helps your project, please consider giving it a star on GitHub! Your support helps drive continued development and improvement.

---

**Made with ❤️ by the WebTeX team**