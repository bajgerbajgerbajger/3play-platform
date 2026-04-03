import path from 'node:path';
import { config as loadEnv } from 'dotenv';
import { defineConfig } from 'prisma/config';

// Load env from the root directory
loadEnv({ path: path.resolve(process.cwd(), '.env.local') });
loadEnv({ path: path.resolve(process.cwd(), '.env') });

const url = process.env.DATABASE_URL || 'file:./prisma/dev.db';

export default defineConfig({
  schema: path.resolve(process.cwd(), 'prisma', 'schema.prisma'),
  datasource: { url },
  migrations: {
    seed: 'tsx ./prisma/seed.ts',
  },
});
