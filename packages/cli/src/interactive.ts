import * as p from '@clack/prompts';
import fs from 'fs';
import { validate, fix, stringifyConfig, formatDiagnostics, hasErrors, fixableRuleIds } from 'mcp-guard-core';
import { findAvailableConfigs } from './utils/find-configs.js';
import pc from 'picocolors';

async function validateConfig(configPath: string, showFixOption = true): Promise<void> {
  const s = p.spinner();
  s.start('Validating config...');

  let rawConfig: string;
  try {
    rawConfig = fs.readFileSync(configPath, 'utf-8');
  } catch (err: any) {
    s.stop('Read error');
    p.log.error(`Failed to read file: ${err.message}`);
    return;
  }

  const result = await validate(rawConfig);

  s.stop('Validation complete!');

  if (result.diagnostics.length === 0) {
    p.log.success(pc.green('✓ No errors or warnings found.'));
    return;
  }

  const output = formatDiagnostics(result.diagnostics);
  console.log(`\n${output}\n`);

  const errorCount = result.diagnostics.filter((d) => d.severity === 'error').length;
  const warningCount = result.diagnostics.filter((d) => d.severity === 'warning').length;

  if (errorCount > 0 && showFixOption) {
    const shouldFix = await p.confirm({
      message: `Found ${errorCount} error(s), ${warningCount} warning(s). Try to fix automatically?`,
      initialValue: false,
    });

    if (p.isCancel(shouldFix)) {
      p.cancel('Operation cancelled.');
      process.exit(130);
    }

    if (shouldFix) {
      await fixConfig(configPath, false);
    }
  }
}

async function fixConfig(configPath: string, showConfirm = true): Promise<void> {
  const s = p.spinner();
  s.start('Checking config...');

  let rawConfig: string;
  try {
    rawConfig = fs.readFileSync(configPath, 'utf-8');
  } catch (err: any) {
    s.stop('Read error');
    p.log.error(`Failed to read file: ${err.message}`);
    return;
  }

  const result = await validate(rawConfig);

  if (!result.parsedConfig) {
    s.stop('Parse error');
    p.log.error('Config could not be parsed.');
    if (result.diagnostics.length > 0) {
      console.log(`\n${formatDiagnostics(result.diagnostics)}\n`);
    }
    return;
  }

  const { config: fixedConfig, appliedFixes } = fix(result.parsedConfig);

  if (appliedFixes.length === 0) {
    if (hasErrors(result.diagnostics)) {
      const unfixableErrors = result.diagnostics.filter((d) => d.severity === 'error' && !fixableRuleIds.has(d.ruleId));
      if (unfixableErrors.length > 0) {
        s.stop('Unfixable errors found');
        console.log(`\n${formatDiagnostics(result.diagnostics)}\n`);
        p.log.warn(`${unfixableErrors.length} unfixable error(s) remain (manual intervention required).`);
      } else {
        s.stop('Errors found');
        console.log(`\n${formatDiagnostics(result.diagnostics)}\n`);
        p.log.warn('Errors found but fix() could not resolve them. This may indicate a rule bug.');
      }
    } else {
      s.stop('No fixes needed');
      p.log.success('No fixable errors found.');
    }
    return;
  }

  s.stop(`Found ${appliedFixes.length} fixable issue(s)`);
  p.log.info(`Fixes: ${appliedFixes.join(', ')}`);

  if (showConfirm) {
    const shouldApply = await p.confirm({
      message: 'Apply these changes to the config file?',
      initialValue: true,
    });

    if (p.isCancel(shouldApply)) {
      p.cancel('Operation cancelled.');
      process.exit(130);
    }

    if (!shouldApply) {
      p.log.info('Changes not applied.');
      return;
    }
  }

  const writeSpinner = p.spinner();
  writeSpinner.start('Writing changes...');
  try {
    fs.writeFileSync(configPath, stringifyConfig(fixedConfig), 'utf-8');
  } catch (err: any) {
    writeSpinner.stop('Write error');
    p.log.error(`Failed to write file: ${err.message}`);
    return;
  }
  writeSpinner.stop('Changes saved!');

  const revalidation = await validate(stringifyConfig(fixedConfig));
  if (hasErrors(revalidation.diagnostics)) {
    const fixableRemaining = revalidation.diagnostics.filter(
      (d) => d.severity === 'error' && fixableRuleIds.has(d.ruleId)
    );
    if (fixableRemaining.length > 0) {
      p.log.warn(
        `${fixableRemaining.length} fixable error(s) still remain after fixing. ` +
          'This may indicate a bug in a rule. Please report it.'
      );
    }

    const unfixableRemaining = revalidation.diagnostics.filter(
      (d) => d.severity === 'error' && !fixableRuleIds.has(d.ruleId)
    );
    if (unfixableRemaining.length > 0) {
      console.log(`\n${formatDiagnostics(revalidation.diagnostics)}\n`);
      p.log.warn(`${unfixableRemaining.length} unfixable error(s) remain (manual intervention required).`);
    }
  } else {
    p.log.success(pc.green('✓ Config file updated successfully!'));
  }
}

async function listRulesInteractive(): Promise<void> {
  p.log.info(pc.bold('\nAvailable Rules:\n'));

  const { rules } = await import('mcp-guard-core');
  const tableRows = rules.map((r) => ({
    ID: r.id,
    Severity: r.severity,
    AutoFix: r.fix ? 'Yes' : 'No',
    Description: r.description,
  }));

  const maxIdLen = Math.max(15, ...tableRows.map((r) => r.ID.length));
  const maxSevLen = Math.max(8, ...tableRows.map((r) => r.Severity.length));
  const maxAutoLen = Math.max(8, ...tableRows.map((r) => r.AutoFix.length));

  const header = `${'ID'.padEnd(maxIdLen)} | ${'Severity'.padEnd(maxSevLen)} | ${'AutoFix'.padEnd(maxAutoLen)} | Description`;
  p.log.info(header);
  p.log.info('-'.repeat(header.length));

  for (const row of tableRows) {
    const severityText = row.Severity.padEnd(maxSevLen);
    const severityColor = row.Severity === 'error' ? pc.red(severityText) :
                          row.Severity === 'warning' ? pc.yellow(severityText) :
                          pc.blue(severityText);
    const autoFixText = row.AutoFix.padEnd(maxAutoLen);
    const autoFixColor = row.AutoFix === 'Yes' ? pc.green(autoFixText) : pc.red(autoFixText);
    p.log.info(
      `${row.ID.padEnd(maxIdLen)} | ${severityColor} | ${autoFixColor} | ${row.Description}`
    );
  }

  console.log();
}

async function selectConfigFile(): Promise<string | null> {
  const availableConfigs = findAvailableConfigs();

  if (availableConfigs.length === 0) {
    const customPath = await p.text({
      message: 'No MCP config files detected on your system.',
      placeholder: 'Enter the path to your config file:',
      validate: (value) => {
        if (value.trim().length === 0) return 'Please enter a valid path';
        if (!fs.existsSync(value.trim())) return 'File does not exist';
        return;
      },
    });

    if (p.isCancel(customPath)) {
      p.cancel('Operation cancelled.');
      process.exit(130);
    }

    return customPath.trim();
  }

  const configOptions = availableConfigs.map((c) => ({
    value: c.path,
    label: `${c.name}`,
    hint: c.path,
  }));

  configOptions.push({ value: '__browse__', label: 'Enter custom path...', hint: '' });

  const selection = await p.select({
    message: 'Which config file do you want to use?',
    options: configOptions,
  });

  if (p.isCancel(selection)) {
    p.cancel('Operation cancelled.');
    process.exit(130);
  }

  if (selection === '__browse__') {
    const customPath = await p.text({
      message: 'Enter the path to your config file:',
      placeholder: './my-config.json',
      validate: (value) => {
        if (value.trim().length === 0) return 'Please enter a valid path';
        if (!fs.existsSync(value.trim())) return 'File does not exist';
        return;
      },
    });

    if (p.isCancel(customPath)) {
      p.cancel('Operation cancelled.');
      process.exit(130);
    }

    return customPath.trim();
  }

  return selection as string;
}

export async function runInteractive(): Promise<void> {
  p.intro(pc.bold(pc.cyan(`MCP Config Guard v${process.env.__VERSION__}`)));

  let running = true;

  while (running) {
    const action = await p.select({
      message: 'What do you want to do?',
      options: [
        { value: 'validate', label: 'Validate a config file', hint: 'Check for errors' },
        { value: 'fix', label: 'Fix a config file', hint: 'Auto-fix errors' },
        { value: 'list', label: 'List all rules', hint: 'See available rules' },
        { value: 'exit', label: 'Exit', hint: '' },
      ],
    });

    if (p.isCancel(action)) {
      p.cancel('Operation cancelled.');
      process.exit(130);
    }

    const selectedAction = action as string;

    if (selectedAction === 'exit') {
      p.outro(pc.yellow('Goodbye!'));
      running = false;
      continue;
    }

    if (selectedAction === 'list') {
      await listRulesInteractive();
      continue;
    }

    const configPath = await selectConfigFile();
    if (!configPath) {
      p.cancel('No config file selected.');
      process.exit(130);
    }

    if (selectedAction === 'validate') {
      await validateConfig(configPath);
    } else if (selectedAction === 'fix') {
      await fixConfig(configPath, true);
    }

    const again = await p.confirm({
      message: 'Do you want to do something else?',
      initialValue: true,
    });

    if (p.isCancel(again)) {
      p.cancel('Operation cancelled.');
      process.exit(130);
    }

    if (!again) {
      p.outro(pc.yellow('Goodbye!'));
      running = false;
    }
  }
}
