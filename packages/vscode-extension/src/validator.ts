import vscode from 'vscode';
import path from 'path';
import { validate } from 'mcp-guard-core';
import { createDiagnostic } from './diagnostic.js';
import { updateStatusBar } from './statusBar.js';

let debounceTimer: NodeJS.Timeout | undefined;
let statusBarItem: vscode.StatusBarItem | undefined;
let diagnosticCollection: vscode.DiagnosticCollection | undefined;

export function isMCPConfigFile(filename: string): boolean {
  const name = path.basename(filename);
  const normalized = filename.replace(/\\/g, '/');
  return (
    name === 'claude_desktop_config.json' ||
    name === '.mcp.json' ||
    normalized.endsWith('.cursor/mcp.json') ||
    normalized.endsWith('.claude/mcp.json')
  );
}

export function setStatusBar(item: vscode.StatusBarItem) {
  statusBarItem = item;
}

export function setDiagnosticCollection(collection: vscode.DiagnosticCollection) {
  diagnosticCollection = collection;
}

export async function validateDocument(doc: vscode.TextDocument): Promise<void> {
  if (!isMCPConfigFile(doc.fileName)) {
    statusBarItem?.hide();
    return;
  }

  statusBarItem?.show();

  const rawConfig = doc.getText();
  const result = await validate(rawConfig);

  const diagnostics: vscode.Diagnostic[] = [];
  for (const diag of result.diagnostics) {
    const vsDiag = createDiagnostic(doc, diag);
    if (vsDiag) {
      diagnostics.push(vsDiag);
    }
  }

  const uri = doc.uri;
  diagnosticCollection?.set(uri, diagnostics);

  if (statusBarItem) {
    updateStatusBar(statusBarItem, result.diagnostics);
  }
}

export function debouncedValidate(doc: vscode.TextDocument): Promise<void> {
  clearTimeout(debounceTimer);
  return new Promise((resolve) => {
    debounceTimer = setTimeout(async () => {
      try {
        await validateDocument(doc);
      } catch (err) {
        console.error('MCP Config Guard:', err);
      }
      resolve();
    }, 300);
  });
}
