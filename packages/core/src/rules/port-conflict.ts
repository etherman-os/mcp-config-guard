import type { Diagnostic, MCPConfig, Rule } from '../types.js';

function extractPort(value: string | undefined): number | null {
  if (!value) return null;
  const port = parseInt(value, 10);
  return isNaN(port) ? null : port;
}

export const portConflictRule: Rule = {
  id: 'port-conflict',
  description: 'Checks if two servers use the same port',
  severity: 'error',
  check(config: MCPConfig): Diagnostic[] {
    const diagnostics: Diagnostic[] = [];
    const { mcpServers } = config;

    const portMap: Map<number, string[]> = new Map();

    for (const [name, server] of Object.entries(mcpServers)) {
      if (server.env) {
        const portKeys = ['PORT', 'SERVER_PORT', 'APP_PORT', 'MCP_PORT'];
        for (const key of portKeys) {
          if (key in server.env) {
            const port = extractPort(server.env[key]);
            if (port !== null) {
              const existing = portMap.get(port) || [];
              existing.push(name);
              portMap.set(port, existing);
            }
          }
        }
      }
    }

    for (const [port, servers] of portMap.entries()) {
      if (servers.length > 1) {
        diagnostics.push({
          ruleId: 'port-conflict',
          severity: 'error',
          message: `Port ${port} is used by multiple servers: ${servers.join(', ')}`,
          path: `mcpServers`,
        });
      }
    }

    return diagnostics;
  },
};
