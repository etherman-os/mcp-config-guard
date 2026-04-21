import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/extension.ts'],
  format: ['cjs'],
  dts: false,
  splitting: false,
  sourcemap: true,
  clean: true,
  platform: 'node',
  target: 'node18',
  external: ['vscode'],
  noExternal: ['@mcp-guard/core', 'jsonc-parser'],
});
