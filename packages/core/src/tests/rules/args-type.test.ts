import { describe, it, expect } from 'vitest';
import { argsTypeRule } from '../../rules/args-type.js';
import type { MCPConfig } from '../../types.js';

describe('args-type rule', () => {
  it('should detect string args', () => {
    const config: MCPConfig = {
      mcpServers: {
        server1: {
          command: 'npx',
          args: '-y server' as unknown as string[],
        },
      },
    };

    const diagnostics = argsTypeRule.check(config);
    expect(diagnostics).toHaveLength(1);
    expect(diagnostics[0].ruleId).toBe('args-type');
  });

  it('should pass when args is array', () => {
    const config: MCPConfig = {
      mcpServers: {
        server1: {
          command: 'npx',
          args: ['-y', 'server'],
        },
      },
    };

    const diagnostics = argsTypeRule.check(config);
    expect(diagnostics).toHaveLength(0);
  });

  it('should fix string args to array', () => {
    const config: MCPConfig = {
      mcpServers: {
        server1: {
          command: 'npx',
          args: '-y server' as unknown as string[],
        },
      },
    };

    const fixed = argsTypeRule.fix!(config);
    expect(fixed.mcpServers.server1.args).toEqual(['-y', 'server']);
  });
});
