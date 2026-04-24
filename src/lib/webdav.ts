import fs from 'node:fs';
import { Readable } from 'node:stream';

function env(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not set`);
  return value;
}

export function webdavBaseUrl() {
  return env('WEBDAV_BASE_URL').replace(/\/+$/, '');
}

export function webdavAuthHeader() {
  const username = env('WEBDAV_USERNAME');
  const password = env('WEBDAV_PASSWORD');
  const token = Buffer.from(`${username}:${password}`).toString('base64');
  return `Basic ${token}`;
}

export function webdavUrl(remotePath: string) {
  const cleanPath = remotePath.replace(/^\/+/, '');
  return `${webdavBaseUrl()}/${cleanPath}`;
}

export async function webdavPutBuffer(remotePath: string, buf: Buffer, contentType?: string) {
  const res = await fetch(webdavUrl(remotePath), {
    method: 'PUT',
    headers: {
      Authorization: webdavAuthHeader(),
      'Content-Type': contentType ?? 'application/octet-stream',
      'Content-Length': String(buf.byteLength),
    },
    body: buf,
  });

  if (!res.ok) {
    throw new Error(`WebDAV PUT failed: ${res.status}`);
  }
}

export async function webdavPutFile(remotePath: string, filePath: string, contentType?: string) {
  const stream = fs.createReadStream(filePath);
  const body = Readable.toWeb(stream) as unknown as ReadableStream;

  const res = await fetch(webdavUrl(remotePath), {
    method: 'PUT',
    headers: {
      Authorization: webdavAuthHeader(),
      'Content-Type': contentType ?? 'application/octet-stream',
    },
    body,
    duplex: 'half',
  } as RequestInit);

  if (!res.ok) {
    throw new Error(`WebDAV PUT failed: ${res.status}`);
  }
}

export async function webdavGet(remotePath: string, range?: string) {
  const headers: Record<string, string> = { Authorization: webdavAuthHeader() };
  if (range) headers.Range = range;
  return fetch(webdavUrl(remotePath), { method: 'GET', headers });
}

export async function webdavHead(remotePath: string) {
  return fetch(webdavUrl(remotePath), {
    method: 'HEAD',
    headers: { Authorization: webdavAuthHeader() },
  });
}

