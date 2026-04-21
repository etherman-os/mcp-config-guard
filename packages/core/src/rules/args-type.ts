import type { Diagnostic, MCPConfig, Rule } from '../types.js';

export const argsTypeRule: Rule = {
  id: 'args-type',
  description: 'Detects when args is provided as string instead of array',
  severity: 'error',
  check(config: MCPConfig): Diagnostic[] {
    const diagnostics: Diagnostic[] = [];
    const { mcpServers } = config;

    for (const [name, server] of Object.entries(mcpServers)) {
      const args: unknown = server.args;
      if (typeof args === 'string') {
        diagnostics.push({
          ruleId: 'args-type',
          severity: 'error',
          message: 'args field is provided as a string. It must be an array.',
          path: `mcpServers.${name}.args`,
          suggestion: `args: ${JSON.stringify(args.split(' '))}`,
        });
      }
    }

    return diagnostics;
  },
  fix(config: MCPConfig): MCPConfig {
    const newConfig = { ...config };
    newConfig.mcpServers = { ...config.mcpServers };

    for (const [name, server] of Object.entries(newConfig.mcpServers)) {
      const args: unknown = server.args;
      if (typeof args === 'string') {
        newConfig.mcpServers[name] = {
          ...server,
          args: args.split(' '),
        };
      }
    }

    return newConfig;
  },
};