#!/usr/bin/env node
import { Command } from 'commander';
import { createValidateCommand } from './commands/validate.js';
import { createFixCommand } from './commands/fix.js';
import { createListRulesCommand } from './commands/list-rules.js';
import { runInteractive } from './interactive.js';

const program = new Command();

program
  .name('mcp-guard')
  .description('MCP Config Guard — Catches and fixes silent errors in MCP config files')
  .version(process.env.__VERSION__ as string);

createValidateCommand(program);
createFixCommand(program);
createListRulesCommand(program);

if (process.argv.length <= 2) {
  await runInteractive();
} else {
  program.parse();
}
