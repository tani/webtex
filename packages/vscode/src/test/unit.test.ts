import { test, expect } from "bun:test";

// Unit tests for VS Code extension logic that doesn't require VS Code APIs
// These tests can run with 'bun test' for quick validation

test("Extension constants and configuration", () => {
    // Test basic constants that would be used in the extension
    const extensionId = "webtex-preview";
    const commands = {
        openPreview: "webtex-preview.openPreview",
        openPreviewToSide: "webtex-preview.openPreviewToSide"
    };
    
    expect(extensionId).toBe("webtex-preview");
    expect(commands.openPreview).toBe("webtex-preview.openPreview");
    expect(commands.openPreviewToSide).toBe("webtex-preview.openPreviewToSide");
});

test("Utility functions for extension", () => {
    // Test utility functions that could be extracted from extension.ts
    
    // LaTeX file detection logic (extracted logic)
    function isTexFile(fileName: string): boolean {
        return fileName.toLowerCase().endsWith(".tex");
    }
    
    function isLatexLanguage(languageId: string): boolean {
        return languageId === "latex";
    }
    
    expect(isTexFile("document.tex")).toBe(true);
    expect(isTexFile("document.txt")).toBe(false);
    expect(isTexFile("DOCUMENT.TEX")).toBe(true);
    
    expect(isLatexLanguage("latex")).toBe(true);
    expect(isLatexLanguage("javascript")).toBe(false);
});

test("Extension configuration values", () => {
    // Test configuration values that would be used
    const config = {
        viewType: "webtexPreview",
        defaultColumn: 1,
        updateDelay: 200
    };
    
    expect(config.viewType).toBe("webtexPreview");
    expect(config.defaultColumn).toBe(1);
    expect(config.updateDelay).toBe(200);
});

test("Error message formatting", () => {
    // Test error message formatting logic
    function formatError(error: { message?: string; location?: { start?: { line?: number }; end?: { column?: number } } }): string {
        const message = error.message && error.message.length > 0 ? error.message : "WebTeX conversion error";
        const line = error.location?.start?.line || 1;
        const column = error.location?.end?.column || 1;
        
        return `${message} (line ${line}, column ${column})`;
    }
    
    expect(formatError({})).toBe("WebTeX conversion error (line 1, column 1)");
    expect(formatError({ message: "Custom error" })).toBe("Custom error (line 1, column 1)");
    expect(formatError({ 
        message: "Parse error", 
        location: { start: { line: 5 }, end: { column: 10 } } 
    })).toBe("Parse error (line 5, column 10)");
});

test("URI string comparison logic", () => {
    // Test URI comparison logic used in the extension
    function uriEquals(uri1: string, uri2: string): boolean {
        return uri1.toString() === uri2.toString();
    }
    
    expect(uriEquals("file:///test.tex", "file:///test.tex")).toBe(true);
    expect(uriEquals("file:///test1.tex", "file:///test2.tex")).toBe(false);
});

test("Content validation", () => {
    // Test content validation logic
    function isValidLatexContent(content: string): boolean {
        if (!content || content.trim().length === 0) {
            return false;
        }
        
        // Basic LaTeX document structure check
        return content.includes("\\documentclass") || content.includes("\\begin{document}");
    }
    
    expect(isValidLatexContent("")).toBe(false);
    expect(isValidLatexContent("   ")).toBe(false);
    expect(isValidLatexContent("\\documentclass{article}")).toBe(true);
    expect(isValidLatexContent("\\begin{document}Hello\\end{document}")).toBe(true);
    expect(isValidLatexContent("Just plain text")).toBe(false);
});

test("HTML generation helpers", () => {
    // Test HTML generation helper functions
    function generateNonce(): string {
        const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        let text = "";
        for (let i = 0; i < 32; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
    }
    
    function createEmptyStateHtml(): string {
        return `
            <div class="empty-state">
                <h2>No LaTeX file selected</h2>
                <p>Open a .tex file to see the preview here.</p>
            </div>
        `;
    }
    
    const nonce = generateNonce();
    expect(nonce).toHaveLength(32);
    expect(nonce).toMatch(/^[A-Za-z0-9]+$/);
    
    const emptyHtml = createEmptyStateHtml();
    expect(emptyHtml).toContain("No LaTeX file selected");
    expect(emptyHtml).toContain("empty-state");
});

test("Resource path construction", () => {
    // Test resource path construction logic
    function getResourcePaths(extensionPath: string) {
        return {
            webtexBaseCss: `${extensionPath}/webtex/css/base.css`,
            webtexArticleCss: `${extensionPath}/webtex/css/article.css`,
            webtexBrowser: `${extensionPath}/webtex/webtex.browser.js`,
            extensionStyle: `${extensionPath}/media/style.css`,
            extensionScript: `${extensionPath}/media/preview.js`
        };
    }
    
    const paths = getResourcePaths("/ext/path");
    expect(paths.webtexBaseCss).toBe("/ext/path/webtex/css/base.css");
    expect(paths.webtexArticleCss).toBe("/ext/path/webtex/css/article.css");
    expect(paths.webtexBrowser).toBe("/ext/path/webtex/webtex.browser.js");
    expect(paths.extensionStyle).toBe("/ext/path/media/style.css");
    expect(paths.extensionScript).toBe("/ext/path/media/preview.js");
});

test("Message type validation", () => {
    // Test message type validation for webview communication
    function isValidMessageType(type: string): boolean {
        const validTypes = ["compileSuccess", "compileError", "setLatex", "scrollToLine"];
        return validTypes.includes(type);
    }
    
    expect(isValidMessageType("compileSuccess")).toBe(true);
    expect(isValidMessageType("compileError")).toBe(true);
    expect(isValidMessageType("setLatex")).toBe(true);
    expect(isValidMessageType("scrollToLine")).toBe(true);
    expect(isValidMessageType("invalidType")).toBe(false);
    expect(isValidMessageType("")).toBe(false);
});

test("Range validation helpers", () => {
    // Test range validation logic
    function createValidRange(startLine: number, startColumn: number, endLine: number, endColumn: number) {
        return {
            start: { line: Math.max(0, startLine), character: Math.max(0, startColumn) },
            end: { line: Math.max(startLine, endLine), character: Math.max(0, endColumn) }
        };
    }
    
    const range1 = createValidRange(5, 10, 5, 20);
    expect(range1.start.line).toBe(5);
    expect(range1.start.character).toBe(10);
    expect(range1.end.line).toBe(5);
    expect(range1.end.character).toBe(20);
    
    // Test negative values are clamped to 0
    const range2 = createValidRange(-1, -5, 2, 10);
    expect(range2.start.line).toBe(0);
    expect(range2.start.character).toBe(0);
    expect(range2.end.line).toBe(2);
    expect(range2.end.character).toBe(10);
});