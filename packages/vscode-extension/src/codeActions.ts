import vscode from 'vscode';
import { parseTree, findNodeAtLocation } from 'jsonc-parser';
import { rules, stringifyConfig, parseConfig } from 'mcp-guard-core';
import type { MCPConfig, Rule } from 'mcp-guard-core';

interface DiagnosticData {
  path: string;
  serverName?: string;
}

export function computeFixEdit(
  doc: vscode.TextDocument,
  rule: Rule,
  config: MCPConfig,
  serverName: string
): vscode.WorkspaceEdit {
  const edit = new vscode.WorkspaceEdit();
  const text = doc.getText();

  const fixedConfig = rule.fix!(config);

  const root = parseTree(text);
  if (!root) return edit;

  const serverNode = findNodeAtLocation(root, ['mcpServers', serverName] as string[]);
  if (!serverNode || serverNode.offset === undefined) return edit;

  const startPos = doc.positionAt(serverNode.offset);
  const endPos = doc.positionAt(serverNode.offset + serverNode.length);
  const serverConfig = fixedConfig.mcpServers[serverName];
  const newJson = stringifyConfig(serverConfig);

  edit.replace(doc.uri, new vscode.Range(startPos, endPos), newJson);
  return edit;
}

export function createCodeActions(
  doc: vscode.TextDocument,
  range: vscode.Range | vscode.Selection,
  context: vscode.CodeActionContext
): vscode.CodeAction[] {
  const actions: vscode.CodeAction[] = [];
  const applicableDiagnostics = context.diagnostics.filter(
    (d) => d.source === 'MCP Config Guard'
  );

  if (applicableDiagnostics.length === 0) return actions;

  const config = getConfigFromDoc(doc);
  if (!config) return actions;

  for (const diag of applicableDiagnostics) {
    const ruleId = String(diag.code);
    const customData = (diag as any).data as DiagnosticData | undefined;

    if (!customData) continue;

    const rule = rules.find((r) => r.id === ruleId);
    if (!rule?.fix) continue;
    if (!customData.serverName) continue;

    const action = new vscode.CodeAction(
      `Fix: ${ruleId}`,
      vscode.CodeActionKind.QuickFix
    );
    action.diagnostics = [diag];
    action.isPreferred = true;

    action.edit = computeFixEdit(doc, rule, config, customData.serverName);
    actions.push(action);
  }

  return actions;
}

function getConfigFromDoc(doc: vscode.TextDocument): MCPConfig | null {
  const text = doc.getText();
  const { config } = parseConfig(text);
  return config;
}
