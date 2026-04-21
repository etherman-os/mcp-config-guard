import type { Diagnostic, MCPConfig, Rule } from '../types.js';

export const duplicateNamesRule: Rule = {
  id: 'duplicate-names',
  description: 'Checks for case-insensitive duplicate server names',
  severity: 'warning',
  check(config: MCPConfig): Diagnostic[] {
    const diagnostics: Diagnostic[] = [];
    const { mcpServers } = config;

    const nameMap: Map<string, string[]> = new Map();

    for (const name of Object.keys(mcpServers)) {
      const lower = name.toLowerCase();
      const existing = nameMap.get(lower) || [];
      existing.push(name);
      nameMap.set(lower, existing);
    }

    for (const [lowerName, names] of nameMap.entries()) {
      if (names.length > 1) {
        diagnostics.push({
          ruleId: 'duplicate-names',
          severity: 'warning',
          message: `Server names conflict (case-insensitive): ${names.join(', ')}`,
          path: `mcpServers`,
        });
      }
    }

    return diagnostics;
  },
};
