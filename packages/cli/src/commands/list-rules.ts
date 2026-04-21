import { Command } from 'commander';
import { rules } from 'mcp-guard-core';

export function createListRulesCommand(program: Command): void {
  program
    .command('list-rules')
    .description('Lists all available rules')
    .action(() => {
      const data = rules.map((r) => ({
        ID: r.id,
        Severity: r.severity,
        AutoFix: r.fix ? '✓ Yes' : '✗ No',
        Description: r.description,
      }));
      console.table(data);
    });
}
