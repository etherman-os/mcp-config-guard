import { describe, it, expect } from 'vitest';
import { commandSplitRule } from '../../rules/command-split.js';
import type { MCPConfig } from '../../types.js';

describe('command-split rule', () => {
  it('should detect shell syntax in command', () => {
    const config: MCPConfig = {
      mcpServers: {
        filesystem: {
          command: 'npx -y @modelcontextprotocol/server-filesystem /tmp',
        },
      },
    };

    const diagnostics = commandSplitRule.check(config);
    expect(diagnostics).toHaveLength(1);
    expect(diagnostics[0].ruleId).toBe('command-split');
    expect(diagnostics[0].severity).toBe('error');
  });

  it('should pass when command has no spaces', () => {
    const config: MCPConfig = {
      mcpServers: {
        filesystem: {
          command: 'npx',
          args: ['-y', '@modelcontextprotocol/server-filesystem', '/tmp'],
        },
      },
    };

    const diagnostics = commandSplitRule.check(config);
    expect(diagnostics).toHaveLength(0);
  });

  it('should fix command-split by separating command and args', () => {
    const config: MCPConfig = {
      mcpServers: {
        filesystem: {
          command: 'npx -y server /tmp',
        },
      },
    };

    const fixed = commandSplitRule.fix!(config);
    expect(fixed.mcpServers.filesystem.command).toBe('npx');
    expect(fixed.mcpServers.filesystem.args).toEqual(['-y', 'server', '/tmp']);
  });
});
