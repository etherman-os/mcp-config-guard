import { z } from 'zod';

export const mcpServerSchema = z.object({
  command: z.unknown(),
  args: z.unknown().optional(),
  env: z.record(z.string()).optional(),
}).passthrough();
