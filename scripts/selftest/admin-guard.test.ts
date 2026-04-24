import assert from 'node:assert/strict';

async function main() {
  const res = await fetch('http://localhost:3000/api/admin/genres', { method: 'GET' });
  assert.equal(res.status, 401, 'Expected 401 for unauthenticated access');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

