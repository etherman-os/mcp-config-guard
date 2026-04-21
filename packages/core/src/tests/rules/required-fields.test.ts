import { describe, it, expect } from 'vitest';
import { requiredFieldsRule } from '../../rules/required-fields.js';
import type { MCPConfig } from '../../types.js';

describe('required-fields rule', () => {
  it('should detect missing command', () => {
    const config: MCPConfig = {
      mcpServers: {
        server1: {
          args: ['test'],
        },
      },
    };

    const diagnostics = requiredFieldsRule.check(config);
    expect(diagnostics).toHaveLength(1);
    expect(diagnostics[0].ruleId).toBe('required-fields');
  });

  it('should detect empty command', () => {
    const config: MCPConfig = {
      mcpServers: {
        server1: {
          command: '',
        },
      },
    };

    const diagnostics = requiredFieldsRule.check(config);
    expect(diagnostics).toHaveLength(1);
  });

  it('should pass when command exists', () => {
    const config: MCPConfig = {
      mcpServers: {
        server1: {
          command: 'npx',
        },
      },
    };

    const diagnostics = requiredFieldsRule.check(config);
    expect(diagnostics).toHaveLength(0);
  });
});
