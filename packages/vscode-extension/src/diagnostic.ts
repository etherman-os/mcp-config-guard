import vscode from 'vscode';
import { parseTree, findNodeAtLocation } from 'jsonc-parser';
import type { Diagnostic as MCPDiagnostic, MCPConfig } from 'mcp-guard-core';

export function pathToRange(
  doc: vscode.TextDocument,
  jsonPath: string
): vscode.Range | undefined {
  const text = doc.getText();
  const root = parseTree(text);
  if (!root) return undefined;

  const pathSegments = jsonPath.split('.');
  const node = findNodeAtLocation(root, pathSegments as string[]);
  if (!node || node.offset === undefined) return undefined;

  const startPos = doc.positionAt(node.offset);
  const endPos = doc.positionAt(node.offset + node.length);
  return new vscode.Range(startPos, endPos);
}

export function severityToVSCode(
  severity: string
): vscode.DiagnosticSeverity {
  switch (severity) {
    case 'error':
      return vscode.DiagnosticSeverity.Error;
    case 'warning':
      return vscode.DiagnosticSeverity.Warning;
    case 'info':
      return vscode.DiagnosticSeverity.Information;
    default:
      return vscode.DiagnosticSeverity.Hint;
  }
}

export function createDiagnostic(
  doc: vscode.TextDocument,
  mcpDiag: MCPDiagnostic
): vscode.Diagnostic | undefined {
  const range = pathToRange(doc, mcpDiag.path);
  if (!range) return undefined;

  const diagnostic = new vscode.Diagnostic(range, mcpDiag.message);
  diagnostic.severity = severityToVSCode(mcpDiag.severity);
  diagnostic.source = 'MCP Config Guard';
  diagnostic.code = mcpDiag.ruleId;
  (diagnostic as any).data = {
    path: mcpDiag.path,
    serverName: getServerNameFromPath(mcpDiag.path),
  };

  return diagnostic;
}

export function getServerNameFromPath(path: string): string | undefined {
  const match = path.match(/^mcpServers\.([^.]+)/);
  return match ? match[1] : undefined;
}