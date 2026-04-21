import { parseConfig } from './parser/index.js';
import { validateSchema } from './schema/index.js';
import { runAllRules, rules } from './rules/index.js';
import { formatDiagnostics, hasErrors, hasWarnings, type ReporterOptions } from './reporter/index.js';
import type { MCPConfig, ValidationResult, Diagnostic, Rule, Severity, Platform, MCPServerConfig } from './types.js';
import JSON5 from 'json5';

export async function validate(rawConfig: string): Promise<ValidationResult> {
  const { config, error: parseError } = parseConfig(rawConfig);

  if (parseError || config === null) {
    return {
      valid: false,
      diagnostics: [
        {
          ruleId: 'parse-error',
          severity: 'error',
          message: parseError?.message || 'Failed to parse config',
          path: parseError?.line ? `line ${parseError.line}` : 'unknown',
        },
      ],
      parseError: parseError?.message || 'Failed to parse config',
    };
  }

  const schemaResult = validateSchema(config);
  if (!schemaResult.success) {
    return {
      valid: false,
      diagnostics: [
        {
          ruleId: 'schema-error',
          severity: 'error',
          message: schemaResult.error.errors.map((e) => e.message).join(', '),
          path: 'mcpServers',
        },
      ],
      parsedConfig: config,
    };
  }

  const diagnostics = await runAllRules(config);

  return {
    valid: !hasErrors(diagnostics),
    diagnostics,
    parsedConfig: config,
  };
}

export const fixableRuleIds = new Set(rules.filter((r) => r.fix).map((r) => r.id));

export function fix(config: MCPConfig): { config: MCPConfig; appliedFixes: string[] } {
  let currentConfig = {
    ...config,
    mcpServers: Object.fromEntries(
      Object.entries(config.mcpServers).map(([k, v]) => [k, { ...v }])
    ),
  };
  const appliedFixes: string[] = [];

  for (const rule of rules) {
    if (rule.fix) {
      const prevConfig = JSON.stringify(currentConfig);
      currentConfig = rule.fix(currentConfig);
      if (JSON.stringify(currentConfig) !== prevConfig) {
        appliedFixes.push(rule.id);
      }
    }
  }

  return { config: currentConfig, appliedFixes };
}

export function stringifyConfig(config: unknown): string {
  if (config === undefined || config === null) return '';
  return JSON5.stringify(config, null, 2);
}

export { parseConfig } from './parser/index.js';
export type { ParseError } from './parser/index.js';
export { formatDiagnostics, hasErrors, hasWarnings } from './reporter/index.js';
export { rules } from './rules/index.js';
export type { MCPConfig, ValidationResult, Diagnostic, Rule, Severity, ReporterOptions, Platform, MCPServerConfig };
