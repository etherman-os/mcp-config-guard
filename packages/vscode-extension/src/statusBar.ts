import vscode from 'vscode';
import type { Diagnostic } from '@mcp-guard/core';

export function createStatusBar(
  context: vscode.ExtensionContext
): vscode.StatusBarItem {
  const item = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    100
  );
  item.text = 'MCP Config';
  item.command = 'mcp-config-guard.validate';
  context.subscriptions.push(item);
  return item;
}

export function updateStatusBar(
  item: vscode.StatusBarItem,
  diagnostics: Diagnostic[]
): void {
  const errors = diagnostics.filter((d) => d.severity === 'error').length;
  const warnings = diagnostics.filter((d) => d.severity === 'warning').length;

  if (errors > 0) {
    const errorText = errors === 1 ? 'error' : 'errors';
    item.text = `✗ MCP Config (${errors} ${errorText})`;
    item.color = new vscode.ThemeColor('errorForeground');
    item.show();
  } else if (warnings > 0) {
    const warningText = warnings === 1 ? 'warning' : 'warnings';
    item.text = `⚠ MCP Config (${warnings} ${warningText})`;
    item.color = new vscode.ThemeColor('editorWarning.foreground');
    item.show();
  } else {
    item.text = '✔ MCP Config';
    item.color = new vscode.ThemeColor('editorInfo.foreground');
    item.show();
  }
}
