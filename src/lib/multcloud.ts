import fs from 'node:fs';
import path from 'node:path';
import { Readable } from 'node:stream';

type MultCloudConfig = {
  webdavUrl: string;
  user: string;
  password: string;
  publicBaseUrl: string | null;
  remoteDir: string;
  keepLocal: boolean;
};

function normalizeBaseUrl(url: string) {
  return url.endsWith('/') ? url : `${url}/`;
}

function joinUrl(base: string, fileName: string) {
  const normalized = normalizeBaseUrl(base);
  return new URL(encodeURIComponent(fileName), normalized).toString();
}

export function getMultCloudConfig(): MultCloudConfig | null {
  const webdavUrl = process.env.MULTCLOUD_WEBDAV_URL;
  const user = process.env.MULTCLOUD_WEBDAV_USER;
  const password = process.env.MULTCLOUD_WEBDAV_PASSWORD;

  if (!webdavUrl || !user || !password) return null;

  const publicBaseUrl = process.env.MULTCLOUD_PUBLIC_BASE_URL || null;
  const remoteDirRaw = process.env.MULTCLOUD_REMOTE_DIR || '';
  const remoteDir = remoteDirRaw.replace(/^\/+|\/+$/g, '');
  const keepLocalRaw = process.env.MULTCLOUD_KEEP_LOCAL;
  const keepLocal = keepLocalRaw !== '0' && keepLocalRaw !== 'false';

  return { webdavUrl, user, password, publicBaseUrl, remoteDir, keepLocal };
}

export async function uploadLocalFileToMultCloud(localPath: string, remoteFileName: string, contentType?: string) {
  const config = getMultCloudConfig();
  if (!config) return null;

  const fullRemoteName = config.remoteDir ? path.posix.join(config.remoteDir, remoteFileName) : remoteFileName;
  const remoteWebdavUrl = joinUrl(config.webdavUrl, fullRemoteName);

  const auth = Buffer.from(`${config.user}:${config.password}`, 'utf8').toString('base64');
  const res = await fetch(remoteWebdavUrl, {
    method: 'PUT',
    headers: {
      Authorization: `Basic ${auth}`,
      ...(contentType ? { 'Content-Type': contentType } : {}),
    },
    body: Readable.toWeb(fs.createReadStream(localPath)) as unknown as ReadableStream,
    duplex: 'half',
  } as any);

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`MultCloud upload failed (${res.status}): ${text || res.statusText}`);
  }

  const publicBase = config.publicBaseUrl ?? config.webdavUrl;
  const publicUrl = joinUrl(publicBase, fullRemoteName);

  return { publicUrl, keepLocal: config.keepLocal };
}
