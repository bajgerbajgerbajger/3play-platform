import assert from 'node:assert/strict';
import { compare } from 'bcryptjs';
import { db } from '../../src/lib/db';
import { ensureAdminUser } from '../../src/lib/adminBootstrap';

async function main() {
  await db.user.deleteMany();

  await db.user.create({
    data: {
      email: 'user@example.com',
      password: 'x',
      role: 'USER',
      name: 'User',
    },
  });

  delete process.env.ADMIN_EMAIL;
  delete process.env.ADMIN_PASSWORD;

  await ensureAdminUser(db);

  const admin = await db.user.findUnique({ where: { email: 'admin@3play.com' } });
  assert.ok(admin, 'Default admin user was not created on non-empty DB');
  assert.equal(admin.role, 'ADMIN');
  assert.ok(admin.password);
  assert.ok(await compare('admin123', admin.password), 'Default password mismatch');

  await db.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

