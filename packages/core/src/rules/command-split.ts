import type { Diagnostic, MCPConfig, Rule } from '../types.js';

export const commandSplitRule: Rule = {
  id: 'command-split',
  description: 'Detects shell syntax in command field (space means user pasted full shell command)',
  severity: 'error',
  check(config: MCPConfig): Diagnostic[] {
    const diagnostics: Diagnostic[] = [];
    const { mcpServers } = config;

    for (const [name, server] of Object.entries(mcpServers)) {
      if (typeof server.command !== 'string') continue;
      if (server.command.includes(' ')) {
        diagnostics.push({
          ruleId: 'command-split',
          severity: 'error',
          message: 'Shell command provided as a single string. command and args must be separated.',
          path: `mcpServers.${name}.command`,
          suggestion: `command: "${server.command.split(' ')[0]}", args: ${JSON.stringify(server.command.split(' ').slice(1))}`,
        });
      }
    }

    return diagnostics;
  },
  fix(config: MCPConfig): MCPConfig {
    const newConfig = { ...config };
    newConfig.mcpServers = { ...config.mcpServers };

    for (const [name, server] of Object.entries(newConfig.mcpServers)) {
      if (typeof server.command !== 'string') continue;
      if (server.command.includes(' ')) {
        const parts = server.command.split(' ');
        const existingArgs: string[] = Array.isArray(server.args) ? server.args : [];
        newConfig.mcpServers[name] = {
          ...server,
          command: parts[0],
          args: [...parts.slice(1), ...existingArgs],
        };
      }
    }

    return newConfig;
  },
};
