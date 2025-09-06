// WebTeX Live Preview App
import { HtmlGenerator, parse as latexParse } from "../dist/webtex.js";

class WebTeXLivePreview {
	constructor() {
		this.editor = document.getElementById("latex-editor");
		this.preview = document.getElementById("preview-iframe");
		this.compileStatus = document.getElementById("compile-status");
		this.editorStats = document.getElementById("editor-stats");
		this.lastCompile = document.getElementById("last-compile");

		this.compileTimeout = null;
		this.isResizing = false;

		this.init();
		this.setupEventListeners();
		this.loadDefaultContent();
	}

	init() {
		// Setup splitter functionality
		this.setupSplitter();

		// Set initial editor focus
		this.editor.focus();

		// Update initial stats
		this.updateEditorStats();
	}

	setupEventListeners() {
		// Editor events
		this.editor.addEventListener("input", () => {
			this.updateEditorStats();
			this.scheduleCompile();
		});

		this.editor.addEventListener("keydown", (e) => {
			this.handleEditorKeydown(e);
		});

		// Toolbar buttons
		document.getElementById("example-article").addEventListener("click", () => {
			this.loadExample("article");
		});

		document.getElementById("example-math").addEventListener("click", () => {
			this.loadExample("math");
		});

		document.getElementById("example-table").addEventListener("click", () => {
			this.loadExample("table");
		});

		document.getElementById("download-html").addEventListener("click", () => {
			this.downloadHTML();
		});

		document.getElementById("clear-editor").addEventListener("click", () => {
			this.clearEditor();
		});

		document.getElementById("wrap-toggle").addEventListener("click", () => {
			this.toggleLineWrap();
		});

		// Window resize
		window.addEventListener("resize", () => {
			this.handleResize();
		});
	}

	setupSplitter() {
		const splitter = document.querySelector(".splitter");
		const editorPanel = document.querySelector(".editor-panel");
		const previewPanel = document.querySelector(".preview-panel");
		const container = document.querySelector(".editor-container");

		let isResizing = false;
		let startX = 0;
		let startWidth = 0;

		splitter.addEventListener("mousedown", (e) => {
			isResizing = true;
			startX = e.clientX;
			startWidth = editorPanel.offsetWidth;

			document.body.style.cursor = "col-resize";
			document.body.style.userSelect = "none";

			e.preventDefault();
		});

		document.addEventListener("mousemove", (e) => {
			if (!isResizing) return;

			const containerWidth = container.offsetWidth;
			const splitterWidth = splitter.offsetWidth;
			const newWidth = startWidth + (e.clientX - startX);
			const minWidth = 300;
			const maxWidth = containerWidth - minWidth - splitterWidth;

			if (newWidth >= minWidth && newWidth <= maxWidth) {
				editorPanel.style.flex = `0 0 ${newWidth}px`;
				previewPanel.style.flex = `1`;
			}
		});

		document.addEventListener("mouseup", () => {
			if (isResizing) {
				isResizing = false;
				document.body.style.cursor = "";
				document.body.style.userSelect = "";
			}
		});
	}

	handleEditorKeydown(e) {
		// Handle tab key for indentation
		if (e.key === "Tab") {
			e.preventDefault();
			const start = this.editor.selectionStart;
			const end = this.editor.selectionEnd;
			const value = this.editor.value;

			this.editor.value = `${value.substring(0, start)}  ${value.substring(end)}`;
			this.editor.selectionStart = this.editor.selectionEnd = start + 2;
		}

		// Handle auto-closing brackets
		if (e.key === "{") {
			e.preventDefault();
			this.insertText("{}");
			this.editor.selectionStart = this.editor.selectionEnd -= 1;
		} else if (e.key === "[") {
			e.preventDefault();
			this.insertText("[]");
			this.editor.selectionStart = this.editor.selectionEnd -= 1;
		} else if (e.key === "(") {
			e.preventDefault();
			this.insertText("()");
			this.editor.selectionStart = this.editor.selectionEnd -= 1;
		}
	}

	insertText(text) {
		const start = this.editor.selectionStart;
		const end = this.editor.selectionEnd;
		const value = this.editor.value;

		this.editor.value = value.substring(0, start) + text + value.substring(end);
		this.updateEditorStats();
		this.scheduleCompile();
	}

	updateEditorStats() {
		const text = this.editor.value;
		const lines = text.split("\n").length;
		const chars = text.length;

		this.editorStats.textContent = `Lines: ${lines} | Characters: ${chars}`;
	}

	scheduleCompile() {
		if (this.compileTimeout) {
			clearTimeout(this.compileTimeout);
		}

		this.compileStatus.textContent = "Compiling...";
		this.compileStatus.className = "compiling";

		this.compileTimeout = setTimeout(() => {
			this.compileLatex();
		}, 500);
	}

	async compileLatex() {
		const latexCode = this.editor.value.trim();

		if (!latexCode) {
			const emptyHTML = this.createCompleteHTML(
				'<p style="color: #a0aec0; text-align: center; margin-top: 2rem;">Enter LaTeX code to see preview</p>',
			);
			this.preview.srcdoc = emptyHTML;
			this.compileStatus.textContent = "Ready";
			this.compileStatus.className = "";
			return;
		}

		try {
			const generator = latexParse(latexCode, {
				generator: new HtmlGenerator({
					hyphenate: false,
					documentClass: "article",
				}),
			});

			const htmlDoc = generator.htmlDocument();
			const fullHTML = this.createCompleteHTML(
				htmlDoc.body.innerHTML,
				htmlDoc.head,
			);

			this.preview.srcdoc = fullHTML;

			this.compileStatus.textContent = "Success";
			this.compileStatus.className = "success";
			this.lastCompile.textContent = `Last compiled: ${new Date().toLocaleTimeString()}`;
		} catch (error) {
			console.error("LaTeX compilation error:", error);

			const errorHTML = this.createCompleteHTML(
				`<div style="color: #e53e3e; padding: 20px; white-space: pre-wrap; font-family: monospace; background: #fed7d7; border-radius: 4px; margin: 20px;">Compilation Error:

${error.message || error.toString()}</div>`,
			);
			this.preview.srcdoc = errorHTML;

			this.compileStatus.textContent = "Error";
			this.compileStatus.className = "error";
			this.lastCompile.textContent = `Error: ${new Date().toLocaleTimeString()}`;
		}
	}

	createCompleteHTML(bodyContent, head = null) {
		// Extract head content from generated head element if provided
		let headContent = "";
		if (head) {
			// Get title
			const titleEl = head.querySelector("title");
			const title = titleEl ? titleEl.textContent : "LaTeX Document";

			// Get meta elements
			const metaElements = head.querySelectorAll("meta");
			let metaTags = "";
			metaElements.forEach((meta) => {
				metaTags += meta.outerHTML;
			});

			// Get link elements
			const linkElements = head.querySelectorAll("link");
			let linkTags = "";
			linkElements.forEach((link) => {
				linkTags += link.outerHTML;
			});

			// Get script elements
			const scriptElements = head.querySelectorAll("script");
			let scriptTags = "";
			scriptElements.forEach((script) => {
				scriptTags += script.outerHTML;
			});

			// Get style elements
			const styleElements = head.querySelectorAll("style");
			let styleTags = "";
			styleElements.forEach((style) => {
				styleTags += style.outerHTML;
			});

			headContent = `<title>${title}</title>
${metaTags}
${linkTags}
${styleTags}
${scriptTags}`;
		} else {
			headContent = '<title>LaTeX Document</title><meta charset="UTF-8">';
		}

		return `<!DOCTYPE html>
<html style="--size: 13.284px; --textwidth: 56.162%; --marginleftwidth: 21.919%; --marginrightwidth: 21.919%; --marginparwidth: 48.892%; --marginparsep: 14.612px; --marginparpush: 6.642px;">
<head>
${headContent}
<link type="text/css" rel="stylesheet" href="../dist/css/mathjax.css">
<link type="text/css" rel="stylesheet" href="../dist/css/article.css">
</head>
<body>
<div class="body">
${bodyContent}
</div>
</body>
</html>`;
	}

	loadExample(type) {
		let content = "";

		switch (type) {
			case "article":
				content = `\\documentclass{article}
\\usepackage{amsmath}
\\usepackage{amsfonts}

\\title{Sample Article}
\\author{WebTeX Demo}
\\date{\\today}

\\begin{document}

\\maketitle

\\begin{abstract}
This is a sample LaTeX document demonstrating the capabilities of WebTeX. It includes basic document structure, mathematical expressions, and formatting.
\\end{abstract}

\\section{Introduction}

Welcome to WebTeX! This is a JavaScript implementation of LaTeX that converts LaTeX documents to HTML5.

\\section{Mathematics}

Here are some mathematical expressions:

Inline math: $E = mc^2$ and $\\pi \\approx 3.14159$.

Display math:
\\[
\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}
\\]

\\section{Lists}

\\begin{itemize}
\\item First item
\\item Second item with $\\alpha + \\beta = \\gamma$
\\item Third item
\\end{itemize}

\\section{Conclusion}

WebTeX provides a powerful way to render LaTeX content in web browsers.

\\end{document}`;
				break;

			case "math":
				content = `\\documentclass{article}
\\usepackage{amsmath}
\\usepackage{amsfonts}
\\usepackage{amssymb}

\\title{Mathematical Examples}

\\begin{document}

\\maketitle

\\section{Basic Math}

Inline: $x^2 + y^2 = z^2$

Display:
\\[
\\frac{d}{dx}\\left(\\int_{a}^{x} f(t)dt\\right) = f(x)
\\]

\\section{Matrices}

\\[
A = \\begin{pmatrix}
a_{11} & a_{12} & a_{13} \\\\
a_{21} & a_{22} & a_{23} \\\\
a_{31} & a_{32} & a_{33}
\\end{pmatrix}
\\]

\\section{Greek Letters}

$\\alpha, \\beta, \\gamma, \\delta, \\epsilon, \\zeta, \\eta, \\theta$

$\\Gamma, \\Delta, \\Theta, \\Lambda, \\Xi, \\Pi, \\Sigma, \\Upsilon, \\Phi, \\Psi, \\Omega$

\\section{Calculus}

\\[
\\lim_{n \\to \\infty} \\sum_{k=1}^{n} \\frac{1}{k^2} = \\frac{\\pi^2}{6}
\\]

\\end{document}`;
				break;

			case "table":
				content = `\\documentclass{article}

\\title{Tables and Lists}

\\begin{document}

\\maketitle

\\section{Simple Table}

\\begin{center}
\\begin{tabular}{|l|c|r|}
\\hline
Left & Center & Right \\\\
\\hline
A & B & C \\\\
D & E & F \\\\
G & H & I \\\\
\\hline
\\end{tabular}
\\end{center}

\\section{Enumerated List}

\\begin{enumerate}
\\item First numbered item
\\item Second numbered item
\\item Third numbered item with sub-items:
  \\begin{enumerate}
  \\item Sub-item A
  \\item Sub-item B
  \\end{enumerate}
\\end{enumerate}

\\section{Description List}

\\begin{description}
\\item[LaTeX] A document preparation system
\\item[HTML] HyperText Markup Language
\\item[CSS] Cascading Style Sheets
\\item[JavaScript] A programming language for the web
\\end{description}

\\end{document}`;
				break;
		}

		this.editor.value = content;
		this.updateEditorStats();
		this.scheduleCompile();
		this.editor.focus();
	}

	clearEditor() {
		if (
			this.editor.value.trim() &&
			!confirm("Are you sure you want to clear the editor?")
		) {
			return;
		}

		this.editor.value = "";
		const emptyHTML = this.createCompleteHTML(
			'<p style="color: #a0aec0; text-align: center; margin-top: 2rem;">Enter LaTeX code to see preview</p>',
		);
		this.preview.srcdoc = emptyHTML;
		this.updateEditorStats();
		this.compileStatus.textContent = "Ready";
		this.compileStatus.className = "";
		this.lastCompile.textContent = "Never compiled";
		this.editor.focus();
	}

	toggleLineWrap() {
		const button = document.getElementById("wrap-toggle");
		const isWrapped = this.editor.style.whiteSpace === "pre-wrap";

		if (isWrapped) {
			this.editor.style.whiteSpace = "pre";
			this.editor.style.overflowX = "auto";
			button.classList.remove("active");
		} else {
			this.editor.style.whiteSpace = "pre-wrap";
			this.editor.style.overflowX = "hidden";
			button.classList.add("active");
		}
	}

	downloadHTML() {
		const latexCode = this.editor.value.trim();

		if (!latexCode) {
			alert("No content to download. Please enter some LaTeX code first.");
			return;
		}

		try {
			const generator = latexParse(latexCode, {
				generator: new HtmlGenerator({
					hyphenate: false,
					documentClass: "article",
				}),
			});

			const htmlDoc = generator.htmlDocument();
			const fullHTML = this.createCompleteHTML(
				htmlDoc.body.innerHTML,
				htmlDoc.head,
			);

			const blob = new Blob([fullHTML], { type: "text/html;charset=utf-8" });
			const url = URL.createObjectURL(blob);

			const a = document.createElement("a");
			a.href = url;
			a.download = "latex-document.html";
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);

			URL.revokeObjectURL(url);
		} catch (error) {
			alert(`Failed to generate HTML: ${error.message || error.toString()}`);
		}
	}

	loadDefaultContent() {
		const defaultContent = `\\documentclass{article}

\\title{Welcome to WebTeX}
\\author{Live Preview Demo}

\\begin{document}

\\maketitle

\\section{Getting Started}

Welcome to the WebTeX live preview editor! Start typing LaTeX code to see the rendered output in real-time.

Try the example buttons above to load sample documents.

\\end{document}`;

		this.editor.value = defaultContent;
		this.updateEditorStats();
		this.scheduleCompile();
	}

	handleResize() {
		// Handle any resize-specific logic if needed
	}
}

// Initialize the app when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
	new WebTeXLivePreview();
});
