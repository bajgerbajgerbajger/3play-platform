import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import BetterSqlite3 from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const prismaClientSingleton = () => {
  const filename = process.env.NODE_ENV === 'production' ? 'prod.db' : 'dev.db';
  const prodDbPath = path.resolve(process.cwd(), 'prisma', 'prod.db');
  const devDbPath = path.resolve(process.cwd(), 'prisma', 'dev.db');
  const defaultDbPath =
    process.env.NODE_ENV === 'production' && !fs.existsSync(prodDbPath) && fs.existsSync(devDbPath)
      ? devDbPath
      : path.resolve(process.cwd(), 'prisma', filename);
  const url = process.env.DATABASE_URL ?? `file:${defaultDbPath}`;
  const adapter = new PrismaBetterSqlite3({ url });
  return new PrismaClient({ adapter });
};

export const db = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;
