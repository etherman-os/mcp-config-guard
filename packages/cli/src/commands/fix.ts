import { Command } from 'commander';
import fs from 'fs';
import { validate, fix, stringifyConfig, formatDiagnostics, hasErrors, fixableRuleIds } from '@mcp-guard/core';
import { detectDefaultConfigPath } from '../utils/detect-platform.js';

interface FixOptions {
  dryRun?: boolean;
}

export async function fixCommand(configPath: string | undefined, options: FixOptions): Promise<number> {
  const targetPath = configPath || detectDefaultConfigPath();

  if (!targetPath) {
    console.error('Default config path not found. Please provide the file path manually: mcp-guard fix ./file.json');
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

  if (!result.parsedConfig) {
    console.error('Config could not be parsed.');
    if (result.diagnostics.length > 0) {
      console.log(formatDiagnostics(result.diagnostics));
    }
    return 1;
  }

  const { config: fixedConfig, appliedFixes } = fix(result.parsedConfig);

  if (appliedFixes.length === 0) {
    if (hasErrors(result.diagnostics)) {
      const unfixableErrors = result.diagnostics.filter((d) => d.severity === 'error' && !fixableRuleIds.has(d.ruleId));
      if (unfixableErrors.length > 0) {
        console.log(formatDiagnostics(result.diagnostics));
        console.log(`\n${unfixableErrors.length} unfixable error(s) remain (manual intervention required).`);
      } else {
        console.log(formatDiagnostics(result.diagnostics));
        console.log('\nErrors found but fix() could not resolve them. This may indicate a rule bug.');
      }
      return 1;
    }
    console.log('No fixable errors found.');
    return 0;
  }

  console.log(`Fixes applied: ${appliedFixes.join(', ')}`);

  if (options.dryRun) {
    console.log('\n--- Fixed config (dry-run) ---');
    console.log(stringifyConfig(fixedConfig));
    return 0;
  }

  try {
    fs.writeFileSync(targetPath, stringifyConfig(fixedConfig), 'utf-8');
  } catch (err: any) {
    if (err.code === 'EACCES') {
      console.error(`Permission denied: cannot write to ${targetPath}`);
    } else {
      console.error(`Failed to write file: ${err.message}`);
    }
    return 1;
  }
  console.log(`Config file updated: ${targetPath}`);

  const revalidation = await validate(stringifyConfig(fixedConfig));
  if (hasErrors(revalidation.diagnostics)) {
    const fixableRemaining = revalidation.diagnostics.filter(
      (d) => d.severity === 'error' && fixableRuleIds.has(d.ruleId)
    );
    if (fixableRemaining.length > 0) {
      console.error(
        `\nWARNING: ${fixableRemaining.length} fixable error(s) still remain after fixing. ` +
          'This may indicate a bug in a rule. Please report it.'
      );
    }

    const unfixableRemaining = revalidation.diagnostics.filter(
      (d) => d.severity === 'error' && !fixableRuleIds.has(d.ruleId)
    );
    if (unfixableRemaining.length > 0) {
      console.log(formatDiagnostics(revalidation.diagnostics));
      console.log(`\n${unfixableRemaining.length} unfixable error(s) remain (manual intervention required).`);
    }
    return 1;
  }

  return 0;
}

export function createFixCommand(program: Command): void {
  program
    .command('fix [file]')
    .description('Fixes auto-fixable errors in MCP config files')
    .option('--dry-run', 'Show changes but do not write to file', false)
    .action(async (file: string | undefined, opts: FixOptions) => {
      const exitCode = await fixCommand(file, opts);
      process.exit(exitCode);
    });
}
