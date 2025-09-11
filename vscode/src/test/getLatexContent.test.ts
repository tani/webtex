import * as assert from 'assert';
import * as vscode from 'vscode';
import * as path from 'path';
import { getLatexContent } from '../extension';

suite('getLatexContent', () => {
    suiteSetup(async () => {
        const ext = vscode.extensions.getExtension('masaya.webtex-preview');
        assert.ok(ext, 'Extension not found');
        await ext!.activate();
    });

    setup(async () => {
        // Close all editors before each test for clean state
        await vscode.commands.executeCommand('workbench.action.closeAllEditors');
        // Allow VS Code to settle
        await new Promise(resolve => setTimeout(resolve, 50));
    });

    test('returns empty string when uri is undefined', async () => {
        const content = await getLatexContent(undefined);
        assert.strictEqual(content, '');
    });

    test('reads from open document (unsaved changes included)', async () => {
        const ws = vscode.workspace.workspaceFolders?.[0];
        assert.ok(ws, 'No workspace folder');

        const sampleUri = vscode.Uri.joinPath(ws!.uri, 'sample.tex');
        // Ensure the document is open and visible
        const doc = await vscode.workspace.openTextDocument(sampleUri);
        const editor = await vscode.window.showTextDocument(doc);

        // Edit without saving
        const unsavedText = '% UNSAVED TEST CONTENT\n\\section{Unsaved}\nBody';
        await editor.edit((eb) => {
            const fullRange = new vscode.Range(
                doc.positionAt(0),
                doc.positionAt(doc.getText().length)
            );
            eb.replace(fullRange, unsavedText);
        });

        const content = await getLatexContent(sampleUri);
        assert.strictEqual(content, unsavedText);
    });

    test('reads from disk when document is not open', async () => {
        const ws = vscode.workspace.workspaceFolders?.[0];
        assert.ok(ws, 'No workspace folder');

        const fileUri = vscode.Uri.joinPath(ws!.uri, `tmp-getlatex-${Date.now()}.tex`);
        const fileText = '% FILE CONTENT\n\\section{FromDisk}\nHello';
        await vscode.workspace.fs.writeFile(fileUri, Buffer.from(fileText));

        // Ensure it's not open in the editor or in workspace.textDocuments
        await vscode.commands.executeCommand('workbench.action.closeAllEditors');
        await new Promise(resolve => setTimeout(resolve, 50));

        // Sanity check that no open textDocument matches the file
        const open = vscode.workspace.textDocuments.find(d => d.uri.toString() === fileUri.toString());
        assert.strictEqual(open, undefined, 'Document should not be open');

        const content = await getLatexContent(fileUri);
        assert.strictEqual(content, fileText);

        // Cleanup
        await vscode.workspace.fs.delete(fileUri);
    });
});

