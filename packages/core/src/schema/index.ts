import { z } from 'zod';
import { mcpServerSchema } from './mcpServer.js';

export const mcpConfigSchema = z.object({
  mcpServers: z.record(mcpServerSchema),
});

export function validateSchema(config: unknown) {
  return mcpConfigSchema.safeParse(config);
}
