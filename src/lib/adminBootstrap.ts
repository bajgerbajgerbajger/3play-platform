import type { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

function getAdminConfig() {
  const email = process.env.ADMIN_EMAIL?.trim() || '';
  const password = process.env.ADMIN_PASSWORD || '';
  if (email && password) return { email, password, source: 'env' as const };
  return null;
}

export async function ensureAdminUser(prisma: PrismaClient) {
  const cfg = getAdminConfig();

  if (!cfg) {
    const userCount = await prisma.user.count();
    if (userCount !== 0) return;

    const email = 'admin@3play.com';
    const password = 'admin123';
    const hashed = await bcrypt.hash(password, 12);

    await prisma.user.upsert({
      where: { email },
      update: { password: hashed, role: 'ADMIN' },
      create: { email, name: 'Admin User', password: hashed, role: 'ADMIN' },
    });
    return;
  }

  const hashed = await bcrypt.hash(cfg.password, 12);
  await prisma.user.upsert({
    where: { email: cfg.email },
    update: { password: hashed, role: 'ADMIN' },
    create: { email: cfg.email, name: 'Admin User', password: hashed, role: 'ADMIN' },
  });
}

