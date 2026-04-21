import type { Diagnostic, MCPConfig, Rule } from '../types.js';

export const requiredFieldsRule: Rule = {
  id: 'required-fields',
  description: 'Checks that command field is present and not empty',
  severity: 'error',
  check(config: MCPConfig): Diagnostic[] {
    const diagnostics: Diagnostic[] = [];
    const { mcpServers } = config;

    for (const [name, server] of Object.entries(mcpServers)) {
      if (typeof server.command !== 'string' || server.command.trim() === '') {
        diagnostics.push({
          ruleId: 'required-fields',
          severity: 'error',
          message: 'command field is required and cannot be empty.',
          path: `mcpServers.${name}.command`,
        });
      }
    }

    return diagnostics;
  },
};
