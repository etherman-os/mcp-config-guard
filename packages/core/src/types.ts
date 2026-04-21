export type Severity = 'error' | 'warning' | 'info';

export interface Diagnostic {
  ruleId: string;
  severity: Severity;
  message: string;
  path: string;
  suggestion?: string;
}

export interface Rule {
  id: string;
  description: string;
  severity: Severity;
  check(config: MCPConfig): Diagnostic[] | Promise<Diagnostic[]>;
  fix?(config: MCPConfig): MCPConfig;
}

export interface MCPServerConfig {
  command?: unknown;
  args?: unknown;
  env?: Record<string, string>;
  [key: string]: unknown;
}

export interface MCPConfig {
  mcpServers: Record<string, MCPServerConfig>;
  [key: string]: unknown;
}

export type Platform = 'claude' | 'cursor' | 'claude-code';

export interface ValidationResult {
  valid: boolean;
  diagnostics: Diagnostic[];
  parsedConfig?: MCPConfig;
  parseError?: string;
}
