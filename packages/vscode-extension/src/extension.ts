import vscode from 'vscode';
import { parseTree, findNodeAtLocation } from 'jsonc-parser';
import { debouncedValidate, setStatusBar, validateDocument, isMCPConfigFile, setDiagnosticCollection } from './validator.js';
import { createStatusBar } from './statusBar.js';
import { createCodeActions } from './codeActions.js';
import { createHover } from './hover.js';
import { validate } from 'mcp-guard-core';

let statusBarItem: vscode.StatusBarItem;

export function activate(context: vscode.ExtensionContext): void {
  statusBarItem = createStatusBar(context);
  setStatusBar(statusBarItem);

  const diagnosticCollection = vscode.languages.createDiagnosticCollection('mcp-config-guard');
  setDiagnosticCollection(diagnosticCollection);

  const validateCommand = vscode.commands.registerCommand(
    'mcp-config-guard.validate',
    async () => {
      const doc = vscode.window.activeTextEditor?.document;
      if (doc) {
        await validateDocument(doc);
      }
    }
  );

  const changeListener = vscode.workspace.onDidChangeTextDocument((e) => {
    debouncedValidate(e.document).catch((err) =>
      console.error('MCP Config Guard:', err)
    );
  });

  const openListener = vscode.workspace.onDidOpenTextDocument((doc) => {
    if (isMCPConfigFile(doc.fileName)) {
      validateDocument(doc).catch((err) =>
        console.error('MCP Config Guard:', err)
      );
    }
  });

  const changeEditorListener = vscode.window.onDidChangeActiveTextEditor(
    async (editor) => {
      if (editor) {
        const doc = editor.document;
        if (isMCPConfigFile(doc.fileName)) {
          validateDocument(doc).catch((err) =>
            console.error('MCP Config Guard:', err)
          );
        } else {
          statusBarItem.hide();
        }
      }
    }
  );

  const codeActionProvider = vscode.languages.registerCodeActionsProvider(
    { language: 'json' },
    {
      provideCodeActions(
        doc: vscode.TextDocument,
        range: vscode.Range | vscode.Selection,
        context: vscode.CodeActionContext
      ) {
        if (!isMCPConfigFile(doc.fileName)) {
          return undefined;
        }
        return createCodeActions(doc, range, context);
      },
    }
  );

  const hoverProvider = vscode.languages.registerHoverProvider(
    { language: 'json' },
    {
      async provideHover(doc, position) {
        if (!isMCPConfigFile(doc.fileName)) {
          return null;
        }

        const text = doc.getText();
        const result = await validate(text);
        const root = parseTree(text);
        if (!root) return null;

        for (const diag of result.diagnostics) {
          const diagPath = diag.path;
          const pathSegments = diagPath.split('.');
          const node = findNodeAtLocation(root, pathSegments as string[]);
          if (!node) continue;
          const offset = node.offset;
          if (offset === undefined) continue;

          const start = doc.positionAt(offset);
          const end = doc.positionAt(offset + node.length);
          const hoverRange = new vscode.Range(start, end);

          if (hoverRange.contains(position)) {
            return createHover(doc, position, diag);
          }
        }

        return null;
      },
    }
  );

  context.subscriptions.push(
    diagnosticCollection,
    validateCommand,
    changeListener,
    openListener,
    changeEditorListener,
    codeActionProvider,
    hoverProvider
  );
}

export function deactivate(): void {
}
