import { beforeEach, describe, expect, it, vi } from "vitest";
import type {
  ExtensionContext,
  TextDocument,
  TextDocumentChangeEvent,
  Uri,
  WorkspaceConfiguration,
} from "vscode";

const mockTextDocuments: TextDocument[] = [];
const openTextDocumentMock = vi.fn();
const registerCommandMock = vi.fn();
const createDiagnosticCollectionMock = vi.fn();
const onDidSaveTextDocumentMock = vi.fn();
const onDidChangeTextDocumentMock = vi.fn();
const onDidChangeTextEditorSelectionMock = vi.fn();
const getConfigurationMock = vi.fn();

const saveListeners: Array<(doc: TextDocument) => void> = [];
const changeListeners: Array<(event: TextDocumentChangeEvent) => void> = [];

const removeListener = <T>(listeners: T[], listener: T) => {
  const index = listeners.indexOf(listener);
  if (index >= 0) {
    listeners.splice(index, 1);
  }
};

const createDisposable = (onDispose?: () => void) => ({
  dispose: vi.fn(() => {
    onDispose?.();
  }),
});

const createUri = (path: string): Uri =>
  ({
    scheme: "file",
    path,
    fsPath: path,
    toString() {
      return path;
    },
  }) as unknown as Uri;

vi.mock("vscode", () => {
  class Position {
    constructor(
      public line: number,
      public character: number,
    ) {}
  }

  class Range {
    constructor(
      public start: Position,
      public end: Position,
    ) {}
  }

  class Diagnostic {
    public source?: string;
    constructor(
      public range: Range,
      public message: string,
      public severity: number,
    ) {}
  }

  const DiagnosticSeverity = { Error: 0 } as const;

  return {
    __esModule: true,
    languages: {
      createDiagnosticCollection:
        createDiagnosticCollectionMock.mockImplementation((name: string) => ({
          name,
          set: vi.fn(),
          delete: vi.fn(),
          clear: vi.fn(),
          dispose: vi.fn(),
        })),
    },
    commands: {
      registerCommand: registerCommandMock.mockImplementation(() =>
        createDisposable(),
      ),
    },
    workspace: {
      get textDocuments() {
        return mockTextDocuments;
      },
      openTextDocument: openTextDocumentMock,
      onDidSaveTextDocument: onDidSaveTextDocumentMock.mockImplementation(
        (listener: (document: TextDocument) => void) => {
          saveListeners.push(listener);
          return createDisposable(() =>
            removeListener(saveListeners, listener),
          );
        },
      ),
      onDidChangeTextDocument: onDidChangeTextDocumentMock.mockImplementation(
        (listener: (event: TextDocumentChangeEvent) => void) => {
          changeListeners.push(listener);
          return createDisposable(() =>
            removeListener(changeListeners, listener),
          );
        },
      ),
      getConfiguration: getConfigurationMock.mockImplementation(() => ({
        get: () => undefined,
      })),
    },
    window: {
      activeTextEditor: undefined,
      onDidChangeTextEditorSelection:
        onDidChangeTextEditorSelectionMock.mockImplementation(() =>
          createDisposable(),
        ),
      createWebviewPanel: vi.fn(),
    },
    Uri: {
      joinPath: (...segments: Array<{ path?: string } | string>) => {
        const parts = segments.map((segment) =>
          typeof segment === "string" ? segment : (segment.path ?? ""),
        );
        return createUri(parts.join("/"));
      },
    },
    ViewColumn: { One: 1, Beside: 2 },
    Position,
    Range,
    Diagnostic,
    DiagnosticSeverity,
  };
});

const createTextDocument = (uri: Uri, overrides: Partial<TextDocument> = {}) =>
  ({
    uri,
    languageId: "latex",
    fileName: uri.fsPath,
    getText: () => "\\begin{document}\\end{document}",
    isDirty: false,
    isClosed: false,
    isUntitled: false,
    version: 1,
    eol: 1,
    lineCount: 1,
    lineAt: vi.fn(),
    offsetAt: vi.fn(),
    positionAt: vi.fn(),
    save: vi.fn(),
    validateRange: vi.fn(),
    validatePosition: vi.fn(),
    getWordRangeAtPosition: vi.fn(),
    ...overrides,
  }) as unknown as TextDocument;

const { activate, getLatexContent, __testing } = await import(
  "../src/extension"
);

beforeEach(() => {
  mockTextDocuments.length = 0;
  openTextDocumentMock.mockReset();
  registerCommandMock.mockClear();
  createDiagnosticCollectionMock.mockClear();
  onDidSaveTextDocumentMock.mockClear();
  onDidChangeTextDocumentMock.mockClear();
  onDidChangeTextEditorSelectionMock.mockClear();
  getConfigurationMock.mockReset();
  getConfigurationMock.mockReturnValue({
    get: () => undefined,
    has: () => false,
    inspect: () => undefined,
    update: vi.fn(),
  } as unknown as WorkspaceConfiguration);
  saveListeners.length = 0;
  changeListeners.length = 0;
});

describe("getLatexContent", () => {
  it("returns empty string when URI is undefined", async () => {
    await expect(getLatexContent(undefined)).resolves.toBe("");
  });

  it("returns text from an already open document", async () => {
    const uri = createUri("file:///doc.tex");
    const openDocument = createTextDocument(uri, {
      getText: () => "\\textbf{hello}",
    });
    mockTextDocuments.push(openDocument);

    await expect(getLatexContent(uri)).resolves.toBe("\\textbf{hello}");
    expect(openTextDocumentMock).not.toHaveBeenCalled();
  });

  it("loads text from disk when document is not open", async () => {
    const uri = createUri("file:///disk.tex");
    openTextDocumentMock.mockResolvedValueOnce(
      createTextDocument(uri, { getText: () => "\\section{Disk}" }),
    );

    await expect(getLatexContent(uri)).resolves.toBe("\\section{Disk}");
    expect(openTextDocumentMock).toHaveBeenCalledWith(uri);
  });

  it("logs and returns empty string when reading fails", async () => {
    const uri = createUri("file:///error.tex");
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    openTextDocumentMock.mockRejectedValueOnce(new Error("read failure"));

    await expect(getLatexContent(uri)).resolves.toBe("");
    expect(consoleError).toHaveBeenCalledWith(
      "Error reading LaTeX file:",
      expect.any(Error),
    );
    consoleError.mockRestore();
  });
});

describe("activate", () => {
  const createContext = (): ExtensionContext =>
    ({
      subscriptions: [],
    }) as unknown as ExtensionContext;

  it("registers commands and document listeners", () => {
    const context = createContext();
    activate(context);

    expect(createDiagnosticCollectionMock).toHaveBeenCalledWith("webtex");
    expect(registerCommandMock).toHaveBeenCalledTimes(2);
    expect(onDidSaveTextDocumentMock).toHaveBeenCalledTimes(1);
    expect(onDidChangeTextDocumentMock).toHaveBeenCalledTimes(1);
    expect(context.subscriptions.length).toBeGreaterThanOrEqual(3);
  });

  it("updates preview immediately on save for LaTeX documents", () => {
    const { WebTeXPreviewPanel } = __testing;
    const updatePreviewSpy = vi.spyOn(WebTeXPreviewPanel, "updatePreview");
    const context = createContext();
    activate(context);

    const uri = createUri("file:///doc.tex");
    const document = createTextDocument(uri);
    expect(saveListeners).toHaveLength(1);
    saveListeners[0](document);

    expect(updatePreviewSpy).toHaveBeenCalledWith(uri, { immediate: true });
    updatePreviewSpy.mockRestore();
  });

  it("ignores non-LaTeX change events", () => {
    const { WebTeXPreviewPanel } = __testing;
    const updatePreviewSpy = vi.spyOn(WebTeXPreviewPanel, "updatePreview");
    const context = createContext();
    activate(context);

    const uri = createUri("file:///notes.txt");
    const document = createTextDocument(uri, {
      languageId: "plaintext",
      fileName: uri.fsPath,
    });

    expect(changeListeners).toHaveLength(1);
    changeListeners[0]({
      document,
    } as unknown as TextDocumentChangeEvent);

    expect(updatePreviewSpy).not.toHaveBeenCalled();
    updatePreviewSpy.mockRestore();
  });
});
