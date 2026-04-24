import assert from 'node:assert/strict';

async function main() {
  assert.ok(process.env.MEDIA_TEST_PATH, 'MEDIA_TEST_PATH missing (example: 3play/uploads/videos/sample.mp4)');

  const url = `http://localhost:3000/api/media/${process.env.MEDIA_TEST_PATH}`;
  const res = await fetch(url, { headers: { Range: 'bytes=0-1023' } });

  assert.equal(res.status, 206, `Expected 206, got ${res.status}`);

  const body = await res.arrayBuffer();
  assert.equal(body.byteLength, 1024);

  const cr = res.headers.get('content-range');
  assert.ok(cr && cr.startsWith('bytes '), 'Missing Content-Range');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

