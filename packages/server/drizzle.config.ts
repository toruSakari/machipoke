import type { Config } from 'drizzle-kit';

export default {
  schema: './src/infrastructure/persistence/cloudflareD1/schema.ts',
  out: './migrations',
  driver: 'd1',
  dbCredentials: {
    wranglerConfigPath: './wrangler.toml',
    dbName: 'DB',
  },
  verbose: true,
  strict: true,
} satisfies Config;
