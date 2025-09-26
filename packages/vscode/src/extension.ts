import * as vscode from "vscode";

// Removed Node fs dependency. We use VS Code APIs to read documents.
// WebTeX is imported statically and used on the extension side.

let diagCollection: vscode.DiagnosticCollection | undefined;

export function activate(context: vscode.ExtensionContext) {
  console.log("WebTeX Preview extension is now active!");

  // Create diagnostics collection for WebTeX errors
  diagCollection = vscode.languages.createDiagnosticCollection("webtex");
  context.subscriptions.push(diagCollection);

  // Register commands
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "webtex-preview.openPreview",
      (uri?: vscode.Uri) => {
        WebTeXPreviewPanel.createOrShow(context.extensionUri, uri);
      },
    ),
    vscode.commands.registerCommand(
      "webtex-preview.openPreviewToSide",
      (uri?: vscode.Uri) => {
        WebTeXPreviewPanel.createOrShow(
          context.extensionUri,
          uri,
          vscode.ViewColumn.Beside,
        );
      },
    ),
  );

  // Also watch for document saves
  const saveWatcher = vscode.workspace.onDidSaveTextDocument((document) => {
    if (isTexDocument(document)) {
      WebTeXPreviewPanel.updatePreview(document.uri, { immediate: true });
    }
  });

  // Live update on text changes (unsaved edits)
  const changeWatcher = vscode.workspace.onDidChangeTextDocument((event) => {
    if (isTexDocument(event.document)) {
      WebTeXPreviewPanel.updatePreview(event.document.uri);
    }
  });

  context.subscriptions.push(saveWatcher, changeWatcher);
}

export function deactivate() {}

// Extracted for testability: fetch LaTeX content for a given URI.
// - If a matching open document exists, returns its (possibly unsaved) text.
// - Otherwise, opens the document from disk and returns its content.
// - If uri is undefined or read fails, returns an empty string.
export async function getLatexContent(
  currentUri: vscode.Uri | undefined,
): Promise<string> {
  if (!currentUri) {
    return "";
  }
  try {
    const openDoc = vscode.workspace.textDocuments.find(
      (d) => d.uri.toString() === currentUri.toString(),
    );
    if (openDoc) {
      return openDoc.getText();
    }
    const doc = await vscode.workspace.openTextDocument(currentUri);
    return doc.getText();
  } catch (error) {
    console.error("Error reading LaTeX file:", error);
    return "";
  }
}

interface PreviewUpdateOptions {
  immediate?: boolean;
}

class WebTeXPreviewPanel {
  public static currentPanel: WebTeXPreviewPanel | undefined;
  public static readonly viewType = "webtexPreview";
  private static readonly DEFAULT_UPDATE_DEBOUNCE_DELAY_MS = 200;

  private readonly _panel: vscode.WebviewPanel;
  private readonly _extensionUri: vscode.Uri;
  private _currentUri: vscode.Uri | undefined;
  private _disposables: vscode.Disposable[] = [];
  private _htmlInitialized = false;
  private _updateTimer: ReturnType<typeof setTimeout> | undefined;

  public static createOrShow(
    extensionUri: vscode.Uri,
    uri?: vscode.Uri,
    column?: vscode.ViewColumn,
  ) {
    const targetColumn = column || vscode.ViewColumn.One;

    // If we already have a panel, show it
    if (WebTeXPreviewPanel.currentPanel) {
      WebTeXPreviewPanel.currentPanel._panel.reveal(targetColumn);
      if (uri) {
        WebTeXPreviewPanel.currentPanel._currentUri = uri;
        WebTeXPreviewPanel.currentPanel._triggerUpdate({ immediate: true });
      }
      return;
    }

    // Otherwise, create a new panel
    const panel = vscode.window.createWebviewPanel(
      WebTeXPreviewPanel.viewType,
      "WebTeX Preview",
      targetColumn,
      {
        enableScripts: true,
        localResourceRoots: [
          vscode.Uri.joinPath(extensionUri, "webtex"),
          vscode.Uri.joinPath(extensionUri, "media"),
        ],
      },
    );

    WebTeXPreviewPanel.currentPanel = new WebTeXPreviewPanel(
      panel,
      extensionUri,
      uri,
    );
  }

  public static updatePreview(
    uri: vscode.Uri,
    options?: PreviewUpdateOptions,
  ): void {
    const panel = WebTeXPreviewPanel.currentPanel;
    if (!panel) {
      return;
    }
    if (panel._currentUri?.toString() !== uri.toString()) {
      return;
    }
    panel._triggerUpdate(options);
  }

  private constructor(
    panel: vscode.WebviewPanel,
    extensionUri: vscode.Uri,
    uri?: vscode.Uri,
  ) {
    this._panel = panel;
    this._extensionUri = extensionUri;
    this._currentUri = uri || this._getActiveTexFile();

    // Set the webview's initial html content
    this._triggerUpdate({ immediate: true });

    // Listen for when the panel is disposed
    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

    // Handle messages from the webview (compile results)
    this._panel.webview.onDidReceiveMessage(
      async (msg) => {
        if (!this._currentUri) return;
        if (msg?.type === "compileSuccess") {
          diagCollection?.delete(this._currentUri);
          return;
        }
        if (msg?.type === "compileError") {
          const error = msg.error ?? {};
          const message: string =
            typeof error.message === "string" && error.message.length
              ? error.message
              : "WebTeX conversion error";

          const startLine1 = Number(error?.location?.start?.line) || 1;
          const endCol1 = Number(error?.location?.end?.column) || 1;

          const text = await getLatexContent(this._currentUri);
          const lines = text.split(/\r?\n/);
          const lineIndex = Math.max(0, startLine1 - 1);
          const lineText = lines[lineIndex] ?? "";
          const range = new vscode.Range(
            new vscode.Position(lineIndex, 0),
            new vscode.Position(
              lineIndex,
              Math.max(endCol1 - 1, lineText.length),
            ),
          );

          const diag = new vscode.Diagnostic(
            range,
            message,
            vscode.DiagnosticSeverity.Error,
          );
          diag.source = "webtex";
          diagCollection?.set(this._currentUri, [diag]);
          return;
        }
        if (msg?.type === "openSourceLocation") {
          const line = Number(msg.line);
          const column = Number(msg.column);
          if (Number.isFinite(line) && Number.isFinite(column)) {
            void this._revealEditorLocation(line, column);
          }
        }
      },
      null,
      this._disposables,
    );

    // Sync editor cursor -> preview scroll
    this._disposables.push(
      vscode.window.onDidChangeTextEditorSelection((evt) => {
        if (!this._currentUri) {
          return;
        }
        if (
          evt.textEditor.document.uri.toString() !== this._currentUri.toString()
        ) {
          return;
        }
        const line = evt.selections?.[0]?.active?.line ?? 0;
        // VS Code is 0-based; data-source-line is 1-based
        this._panel.webview.postMessage({
          type: "scrollToLine",
          line: line + 1,
        });
      }),
    );
  }

  private _getActiveTexFile(): vscode.Uri | undefined {
    const activeEditor = vscode.window.activeTextEditor;
    if (activeEditor && isTexDocument(activeEditor.document)) {
      return activeEditor.document.uri;
    }
    return undefined;
  }

  public dispose() {
    WebTeXPreviewPanel.currentPanel = undefined;

    // Clean up our resources
    this._panel.dispose();

    if (this._updateTimer) {
      clearTimeout(this._updateTimer);
      this._updateTimer = undefined;
    }

    while (this._disposables.length) {
      const x = this._disposables.pop();
      if (x) {
        x.dispose();
      }
    }
  }

  private _triggerUpdate(options?: PreviewUpdateOptions): void {
    if (options?.immediate) {
      if (this._updateTimer) {
        clearTimeout(this._updateTimer);
        this._updateTimer = undefined;
      }
      void this._update();
      return;
    }

    if (this._updateTimer) {
      clearTimeout(this._updateTimer);
    }

    const delay = WebTeXPreviewPanel.getUpdateDebounceDelay();
    if (delay <= 0) {
      this._updateTimer = undefined;
      void this._update();
      return;
    }

    this._updateTimer = setTimeout(() => {
      this._updateTimer = undefined;
      void this._update();
    }, delay);
  }

  private async _update(): Promise<void> {
    const webview = this._panel.webview;
    this._panel.title = this._currentUri
      ? `WebTeX Preview - ${this._currentUri.fsPath}`
      : "WebTeX Preview";

    // Only set HTML once to avoid full-page reload (blink)
    if (!this._htmlInitialized) {
      this._panel.webview.html = await this._getHtmlForWebview(webview);
      this._htmlInitialized = true;
    }

    // Send LaTeX to the webview to compile via webtex.browser.js
    const latex = await this._getLatexContent();
    this._panel.webview.postMessage({ type: "setLatex", text: latex });

    // Try to sync to current editor line
    if (this._currentUri) {
      const ae = vscode.window.activeTextEditor;
      if (ae && ae.document.uri.toString() === this._currentUri.toString()) {
        const line = ae.selection?.active?.line ?? 0;
        setTimeout(() => {
          this._panel.webview.postMessage({
            type: "scrollToLine",
            line: line + 1,
          });
        }, 50);
      }
    }
  }

  private async _revealEditorLocation(
    line: number,
    column: number,
  ): Promise<void> {
    if (!this._currentUri) {
      return;
    }

    const editor = vscode.window.visibleTextEditors.find(
      (e) => e.document.uri.toString() === this._currentUri?.toString(),
    );

    if (!editor) {
      return;
    }

    const targetLine = Math.max(0, Math.floor(line) - 1);
    const targetColumn = Math.max(0, Math.floor(column) - 1);
    const position = new vscode.Position(targetLine, targetColumn);
    const range = new vscode.Range(position, position);

    editor.selection = new vscode.Selection(position, position);
    editor.revealRange(range, vscode.TextEditorRevealType.InCenter);

    const viewColumn = editor.viewColumn ?? vscode.ViewColumn.Active;
    await vscode.window.showTextDocument(editor.document, {
      viewColumn,
      preserveFocus: false,
      preview: false,
      selection: range,
    });
  }

  private async _getHtmlForWebview(webview: vscode.Webview) {
    // Get paths to local WebTeX resources (copied from core package)
    const webtexBaseCssPath = vscode.Uri.joinPath(
      this._extensionUri,
      "webtex",
      "css",
      "base.css",
    );
    const webtexBaseCssUri = webview.asWebviewUri(webtexBaseCssPath);
    const webtexArticleCssPath = vscode.Uri.joinPath(
      this._extensionUri,
      "webtex",
      "css",
      "article.css",
    );
    const webtexArticleCssUri = webview.asWebviewUri(webtexArticleCssPath);
    const webtexBrowserPath = vscode.Uri.joinPath(
      this._extensionUri,
      "webtex",
      "browser",
      "index.js",
    );
    const webtexBrowserUri = webview.asWebviewUri(webtexBrowserPath);

    // Our extension media (styles and scripts)
    const stylePath = vscode.Uri.joinPath(
      this._extensionUri,
      "media",
      "style.css",
    );
    const styleUri = webview.asWebviewUri(stylePath);
    const scriptPath = vscode.Uri.joinPath(
      this._extensionUri,
      "media",
      "preview.js",
    );
    const scriptUri = webview.asWebviewUri(scriptPath);

    // Create nonce for security
    const nonce = getNonce();

    // Keep initial HTML minimal; content will be provided by extension
    const bodyContent = this._getEmptyStateHtml();

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; img-src ${webview.cspSource} https:; script-src 'nonce-${nonce}' ${webview.cspSource};">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>WebTeX Preview</title>
    <link href="${webtexBaseCssUri}" rel="stylesheet">
    <link href="${webtexArticleCssUri}" rel="stylesheet">
    <link href="${styleUri}" rel="stylesheet">
</head>
<body id="content">
    <div>${bodyContent}</div>
    <script type="module" nonce="${nonce}">
        import * as WebTeX from '${webtexBrowserUri}';
        window.__WebTeX = WebTeX;
    </script>
    <script nonce="${nonce}" src="${scriptUri}"></script>
    
</body>
</html>`;
  }

  private async _getLatexContent(): Promise<string> {
    return getLatexContent(this._currentUri);
  }

  private _getEmptyStateHtml(): string {
    return `
            <div class="empty-state">
                <h2>No LaTeX file selected</h2>
                <p>Open a .tex file to see the preview here.</p>
            </div>
        `;
  }

  private static getUpdateDebounceDelay(): number {
    const config = vscode.workspace.getConfiguration("webtex-preview");
    const configuredValue = config.get<number>("previewUpdateDebounce");
    if (
      typeof configuredValue === "number" &&
      Number.isFinite(configuredValue) &&
      configuredValue >= 0
    ) {
      return configuredValue;
    }
    return WebTeXPreviewPanel.DEFAULT_UPDATE_DEBOUNCE_DELAY_MS;
  }
}

function isTexDocument(doc: vscode.TextDocument): boolean {
  return (
    doc.languageId === "latex" || doc.fileName.toLowerCase().endsWith(".tex")
  );
}

function getNonce() {
  let text = "";
  const possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

// (Compilation moved to webview via webtex.browser.js)

export const __testing = {
  WebTeXPreviewPanel,
};
