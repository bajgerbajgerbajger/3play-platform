import assert from 'node:assert/strict';
import { webdavGet, webdavPutBuffer } from '../../src/lib/webdav';

async function main() {
  assert.ok(process.env.WEBDAV_BASE_URL, 'WEBDAV_BASE_URL missing');
  assert.ok(process.env.WEBDAV_USERNAME, 'WEBDAV_USERNAME missing');
  assert.ok(process.env.WEBDAV_PASSWORD, 'WEBDAV_PASSWORD missing');

  const remotePath = '3play/selftest/hello.txt';
  await webdavPutBuffer(remotePath, Buffer.from('hello'), 'text/plain');
  const res = await webdavGet(remotePath);
  assert.equal(res.status, 200);
  assert.equal(await res.text(), 'hello');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

