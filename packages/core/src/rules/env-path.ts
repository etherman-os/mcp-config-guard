import type { Diagnostic, MCPConfig, Rule } from '../types.js';

export const envPathRule: Rule = {
  id: 'env-path',
  description: 'Checks if env is empty or missing PATH variable',
  severity: 'info',
  check(config: MCPConfig): Diagnostic[] {
    const diagnostics: Diagnostic[] = [];
    const { mcpServers } = config;

    for (const [name, server] of Object.entries(mcpServers)) {
      if (!server.env || Object.keys(server.env).length === 0) {
        diagnostics.push({
          ruleId: 'env-path',
          severity: 'info',
          message: 'env field is empty. PATH is not defined; npx may not be found on some systems.',
          path: `mcpServers.${name}.env`,
        });
      } else if (!('PATH' in server.env) && !('Path' in server.env)) {
        diagnostics.push({
          ruleId: 'env-path',
          severity: 'info',
          message: 'PATH env variable is not defined. Commands may not be found on some systems.',
          path: `mcpServers.${name}.env`,
        });
      }
    }

    return diagnostics;
  },
};
