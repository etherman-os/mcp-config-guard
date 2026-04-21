import JSON5 from 'json5';
import type { MCPConfig } from '../types.js';

export interface ParseError {
  message: string;
  line?: number;
  column?: number;
}

export function parseConfig(raw: string): { config: MCPConfig | null; error: ParseError | null } {
  try {
    const parsed = JSON5.parse(raw);
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      return { config: null, error: { message: 'Config must be a JSON object' } };
    }
    const config = parsed as MCPConfig;
    return { config, error: null };
  } catch (err) {
    if (err instanceof Error) {
      const match = err.message.match(/line (\d+) column (\d+)/i);
      return {
        config: null,
        error: {
          message: err.message,
          line: match ? parseInt(match[1], 10) : undefined,
          column: match ? parseInt(match[2], 10) : undefined,
        },
      };
    }
    return { config: null, error: { message: 'Unknown parsing error' } };
  }
}
