import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import path from 'node:path';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const prismaClientSingleton = () => {
  const dbPath = path.resolve(process.cwd(), 'prisma', 'dev.db');
  const defaultUrl = `file:${dbPath}`;
  const url = process.env.DATABASE_URL || defaultUrl;
  const adapter = new PrismaBetterSqlite3({ url });
  return new PrismaClient({ adapter });
};

export const db = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;
