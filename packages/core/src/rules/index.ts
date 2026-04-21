import type { Rule, Diagnostic } from '../types.js';
import { commandSplitRule } from './command-split.js';
import { argsTypeRule } from './args-type.js';
import { requiredFieldsRule } from './required-fields.js';
import { pathExistsRule } from './path-exists.js';
import { envPathRule } from './env-path.js';
import { portConflictRule } from './port-conflict.js';
import { duplicateNamesRule } from './duplicate-names.js';
import { commandExistsRule } from './command-exists.js';

export const rules: Rule[] = [
  commandSplitRule,
  argsTypeRule,
  requiredFieldsRule,
  pathExistsRule,
  envPathRule,
  portConflictRule,
  duplicateNamesRule,
  commandExistsRule,
];

export async function runAllRules(config: Parameters<Rule['check']>[0]): Promise<Diagnostic[]> {
  const results = await Promise.all(rules.map((rule) => rule.check(config)));
  return results.flat();
}
