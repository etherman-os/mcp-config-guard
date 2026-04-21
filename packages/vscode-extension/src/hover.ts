import vscode from 'vscode';
import { rules } from '@mcp-guard/core';
import type { Diagnostic as MCPDiagnostic } from '@mcp-guard/core';

export function createHover(
  doc: vscode.TextDocument,
  position: vscode.Position,
  diag: MCPDiagnostic
): vscode.Hover {
  const rule = rules.find((r) => r.id === diag.ruleId);
  const description = rule?.description || '';

  let contents = `**${diag.ruleId}**\n\n${description}`;

  if (diag.suggestion) {
    contents += `\n\n\`\`\`\nFix: ${diag.suggestion}\n\`\`\``;
  }

  return new vscode.Hover(new vscode.MarkdownString(contents));
}
