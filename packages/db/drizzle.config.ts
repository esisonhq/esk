import type { Config } from 'drizzle-kit';

export default {
  schema: '../../packages/db/src/schemas/index.ts',
  out: '../../packages/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_PRIMARY_URL!,
  },
} satisfies Config;
