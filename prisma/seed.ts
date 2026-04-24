import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import bcrypt from 'bcryptjs';
import path from 'node:path';

const dbPath = path.resolve(process.cwd(), 'prisma', 'dev.db');
const url = `file:${dbPath}`;
const adapter = new PrismaBetterSqlite3({ url });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding database with essential data...');

  // Create genres
  const genres = await Promise.all([
    prisma.genre.upsert({
      where: { slug: 'action' },
      update: {},
      create: { name: 'Action', slug: 'action' },
    }),
    prisma.genre.upsert({
      where: { slug: 'comedy' },
      update: {},
      create: { name: 'Comedy', slug: 'comedy' },
    }),
    prisma.genre.upsert({
      where: { slug: 'drama' },
      update: {},
      create: { name: 'Drama', slug: 'drama' },
    }),
    prisma.genre.upsert({
      where: { slug: 'sci-fi' },
      update: {},
      create: { name: 'Sci-Fi', slug: 'sci-fi' },
    }),
    prisma.genre.upsert({
      where: { slug: 'thriller' },
      update: {},
      create: { name: 'Thriller', slug: 'thriller' },
    }),
    prisma.genre.upsert({
      where: { slug: 'romance' },
      update: {},
      create: { name: 'Romance', slug: 'romance' },
    }),
    prisma.genre.upsert({
      where: { slug: 'horror' },
      update: {},
      create: { name: 'Horror', slug: 'horror' },
    }),
    prisma.genre.upsert({
      where: { slug: 'documentary' },
      update: {},
      create: { name: 'Documentary', slug: 'documentary' },
    }),
  ]);

  console.log('Created genres:', genres.length);

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 12);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@3play.com' },
    update: {},
    create: {
      email: 'admin@3play.com',
      name: 'Admin User',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  const subscription = await prisma.subscription.findFirst({
    where: { userId: adminUser.id },
  });

  if (!subscription) {
    await prisma.subscription.create({
      data: {
        userId: adminUser.id,
        status: 'ACTIVE',
        plan: 'PREMIUM',
      },
    });
  }

  console.log('Created admin user: admin@3play.com / admin123');
  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
