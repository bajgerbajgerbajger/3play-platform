import assert from 'node:assert/strict';
import { compare } from 'bcryptjs';
import { db } from '../../src/lib/db';
import { ensureAdminUser } from '../../src/lib/adminBootstrap';

async function main() {
  await db.user.deleteMany();

  delete process.env.ADMIN_EMAIL;
  delete process.env.ADMIN_PASSWORD;

  await ensureAdminUser(db);

  const user = await db.user.findUnique({ where: { email: 'admin@3play.com' } });
  assert.ok(user, 'Default admin user was not created');
  assert.equal(user.role, 'ADMIN');
  assert.ok(user.password, 'Password missing');
  assert.ok(await compare('admin123', user.password), 'Default password mismatch');

  await db.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

