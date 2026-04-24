import assert from 'node:assert/strict';
import { db } from '../../src/lib/db';

async function main() {
  assert.ok(process.env.ADMIN_EMAIL, 'ADMIN_EMAIL missing');
  assert.ok(process.env.ADMIN_PASSWORD, 'ADMIN_PASSWORD missing');

  const user = await db.user.findUnique({ where: { email: process.env.ADMIN_EMAIL } });

  assert.ok(user, 'Admin user not found');
  assert.equal(user?.role, 'ADMIN', 'Admin role not set');

  await db.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
