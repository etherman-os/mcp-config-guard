import { describe, it, expect } from 'vitest';
import { portConflictRule } from '../../rules/port-conflict.js';
import type { MCPConfig } from '../../types.js';

describe('port-conflict rule', () => {
  it('should error when two servers use same port', () => {
    const config: MCPConfig = {
      mcpServers: {
        server1: {
          command: 'npx',
          env: { PORT: '3000' },
        },
        server2: {
          command: 'npx',
          env: { PORT: '3000' },
        },
      },
    };

    const diagnostics = portConflictRule.check(config);
    expect(diagnostics).toHaveLength(1);
    expect(diagnostics[0].ruleId).toBe('port-conflict');
    expect(diagnostics[0].severity).toBe('error');
  });

  it('should pass when ports are different', () => {
    const config: MCPConfig = {
      mcpServers: {
        server1: {
          command: 'npx',
          env: { PORT: '3000' },
        },
        server2: {
          command: 'npx',
          env: { PORT: '3001' },
        },
      },
    };

    const diagnostics = portConflictRule.check(config);
    expect(diagnostics).toHaveLength(0);
  });
});
