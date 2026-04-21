import { describe, it, expect } from 'vitest';
import { envPathRule } from '../../rules/env-path.js';
import type { MCPConfig } from '../../types.js';

describe('env-path rule', () => {
  it('should warn when env is empty', () => {
    const config: MCPConfig = {
      mcpServers: {
        server1: {
          command: 'npx',
          args: [],
          env: {},
        },
      },
    };

    const diagnostics = envPathRule.check(config);
    expect(diagnostics).toHaveLength(1);
    expect(diagnostics[0].ruleId).toBe('env-path');
    expect(diagnostics[0].severity).toBe('info');
  });

  it('should warn when env is missing PATH', () => {
    const config: MCPConfig = {
      mcpServers: {
        server1: {
          command: 'npx',
          env: { HOME: '/home/user' },
        },
      },
    };

    const diagnostics = envPathRule.check(config);
    expect(diagnostics).toHaveLength(1);
  });

  it('should pass when PATH is defined', () => {
    const config: MCPConfig = {
      mcpServers: {
        server1: {
          command: 'npx',
          env: { PATH: '/usr/bin' },
        },
      },
    };

    const diagnostics = envPathRule.check(config);
    expect(diagnostics).toHaveLength(0);
  });
});
