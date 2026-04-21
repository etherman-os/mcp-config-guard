import { Command } from 'commander';
import fs from 'fs';
import { validate, formatDiagnostics, hasErrors, hasWarnings } from 'mcp-guard-core';
import { detectDefaultConfigPath } from '../utils/detect-platform.js';

interface ValidateOptions {
  format?: 'terminal' | 'json';
  strict?: boolean;
}

export async function validateCommand(configPath: string | undefined, options: ValidateOptions): Promise<number> {
  const targetPath = configPath || detectDefaultConfigPath();

  if (!targetPath) {
    console.error('Default config path not found. Please provide the file path manually: mcp-guard validate ./file.json');
    return 1;
  }

  let rawConfig: string;
  try {
    if (!fs.existsSync(targetPath)) {
      console.error(`File not found: ${targetPath}`);
      return 1;
    }
    rawConfig = fs.readFileSync(targetPath, 'utf-8');
  } catch (err: any) {
    if (err.code === 'EACCES') {
      console.error(`Permission denied: ${targetPath}`);
    } else {
      console.error(`Failed to read file: ${err.message}`);
    }
    return 1;
  }

  const result = await validate(rawConfig);

  const output = formatDiagnostics(result.diagnostics, { format: options.format });
  console.log(output);

  if (options.strict && hasWarnings(result.diagnostics)) {
    return 1;
  }

  if (hasErrors(result.diagnostics)) {
    return 1;
  }

  return 0;
}

export function createValidateCommand(program: Command): void {
  program
    .command('validate [file]')
    .description('Validates an MCP config file')
    .option('--format <type>', 'Output format (terminal | json)', 'terminal')
    .option('--strict', 'Treat warnings as errors', false)
    .action(async (file: string | undefined, opts: ValidateOptions & { format: string }) => {
      const exitCode = await validateCommand(file, {
        format: opts.format as 'terminal' | 'json',
        strict: opts.strict,
      });
      process.exit(exitCode);
    });
}
