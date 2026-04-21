import pc from 'picocolors';
import type { Diagnostic } from '../types.js';

export interface ReporterOptions {
  format?: 'terminal' | 'json';
}

export function formatDiagnostics(diagnostics: Diagnostic[], options: ReporterOptions = {}): string {
  if (options.format === 'json') {
    return JSON.stringify(diagnostics, null, 2);
  }

  if (diagnostics.length === 0) {
    return `${pc.green('✓')} No errors or warnings found.`;
  }

  const lines: string[] = [];
  const errors = diagnostics.filter((d) => d.severity === 'error');
  const warnings = diagnostics.filter((d) => d.severity === 'warning');
  const infos = diagnostics.filter((d) => d.severity === 'info');

  for (const d of diagnostics) {
    const icon = d.severity === 'error' ? pc.red('✗') : d.severity === 'warning' ? pc.yellow('⚠') : pc.blue('ℹ');
    const label = d.severity === 'error' ? 'ERROR' : d.severity === 'warning' ? 'WARNING' : 'INFO';
    const pathStr = pc.cyan(`[${d.path}]`);

    lines.push(`${icon} ${pc.bold(label)} ${pathStr}`);
    lines.push(`   ${d.message}`);

    if (d.suggestion) {
      lines.push(`   ${pc.green('Fix:')} ${d.suggestion}`);
    }
  }

  lines.push('');
  lines.push(`${pc.red(`✗ ${errors.length} error(s)`)}${pc.yellow(`, ${warnings.length} warning(s)`)}${pc.blue(`, ${infos.length} info`)}`);

  return lines.join('\n');
}

export function hasErrors(diagnostics: Diagnostic[]): boolean {
  return diagnostics.some((d) => d.severity === 'error');
}

export function hasWarnings(diagnostics: Diagnostic[]): boolean {
  return diagnostics.some((d) => d.severity === 'warning');
}
