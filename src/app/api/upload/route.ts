import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import fs from 'fs';
import path from 'path';
import { pipeline } from 'stream/promises';
import { v4 as uuidv4 } from 'uuid';
import ffmpeg from 'fluent-ffmpeg';

export const dynamic = 'force-dynamic';
// Set max duration to 2 hours for large file assembly
export const maxDuration = 7200;
// Disable default body parser limit for this route if possible
export const api = {
  bodyParser: false,
};

const uploadsRoot = path.join(process.cwd(), 'public', 'uploads');
const tempRoot = path.join(process.cwd(), '.upload-temp');

function ensureDir(dirPath: string) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  return session && session.user.role === 'ADMIN';
}

async function getVideoMetadata(videoPath: string): Promise<{ duration: number } | null> {
  return new Promise((resolve) => {
    ffmpeg.ffprobe(videoPath, (err, metadata) => {
      if (err) {
        console.error('FFprobe error:', err);
        resolve(null);
        return;
      }
      const duration = metadata.format.duration;
      resolve(duration ? { duration: Math.floor(duration / 60) } : null);
    });
  });
}

async function extractThumbnail(videoPath: string, outputName: string): Promise<string | null> {
  return new Promise((resolve) => {
    // Get a random timestamp between 5% and 85% to avoid credits or intro black screens
    const randomPercent = Math.floor(Math.random() * 80) + 5;
    
    ffmpeg(videoPath)
      .screenshots({
        timestamps: [`${randomPercent}%`],
        filename: `${outputName}.jpg`,
        folder: uploadsRoot,
        size: '1280x720'
      })
      .on('end', () => {
        resolve(`/uploads/${outputName}.jpg`);
      })
      .on('error', (err) => {
        console.error('FFmpeg thumbnail error:', err);
        resolve(null);
      });
  });
}

async function handleSingleFileUpload(formData: FormData) {
  const file = formData.get('file');

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  ensureDir(uploadsRoot);

  const extension = path.extname(file.name).toLowerCase();
  const baseName = uuidv4();
  const targetName = `${baseName}${extension}`;
  const targetPath = path.join(uploadsRoot, targetName);
  const buffer = Buffer.from(await file.arrayBuffer());

  await fs.promises.writeFile(targetPath, buffer);

  let thumbnailUrl = null;
  let duration = null;
  const videoExtensions = ['.mp4', '.mkv', '.webm', '.avi', '.mov'];
  if (videoExtensions.includes(extension)) {
    const [thumb, meta] = await Promise.all([
      extractThumbnail(targetPath, `${baseName}-thumb`),
      getVideoMetadata(targetPath)
    ]);
    thumbnailUrl = thumb;
    duration = meta?.duration;
  }

  return NextResponse.json({ 
    url: `/uploads/${targetName}`,
    thumbnailUrl,
    duration
  });
}

async function handleChunkUpload(formData: FormData) {
  const chunk = formData.get('chunk');
  const uploadId = formData.get('uploadId');
  const chunkIndex = formData.get('chunkIndex');

  if (!(chunk instanceof File) || typeof uploadId !== 'string' || typeof chunkIndex !== 'string') {
    return NextResponse.json({ error: 'Invalid chunk payload' }, { status: 400 });
  }

  const uploadTempDir = path.join(tempRoot, uploadId);
  ensureDir(uploadTempDir);

  const chunkPath = path.join(uploadTempDir, `${chunkIndex}.part`);
  const buffer = Buffer.from(await chunk.arrayBuffer());

  await fs.promises.writeFile(chunkPath, buffer);

  return NextResponse.json({ ok: true });
}

async function handleChunkFinalize(req: NextRequest) {
  const body = await req.json();
  const uploadId = typeof body.uploadId === 'string' ? body.uploadId : '';
  const fileName = typeof body.fileName === 'string' ? body.fileName : '';
  const totalChunks = Number(body.totalChunks);

  if (!uploadId || !fileName || !Number.isInteger(totalChunks) || totalChunks <= 0) {
    return NextResponse.json({ error: 'Invalid finalize payload' }, { status: 400 });
  }

  ensureDir(uploadsRoot);

  const uploadTempDir = path.join(tempRoot, uploadId);
  const extension = path.extname(fileName).toLowerCase();
  const baseName = uuidv4();
  const targetName = `${baseName}${extension}`;
  const targetPath = path.join(uploadsRoot, targetName);
  const writeStream = fs.createWriteStream(targetPath);

  try {
    for (let index = 0; index < totalChunks; index += 1) {
      const chunkPath = path.join(uploadTempDir, `${index}.part`);
      await fs.promises.access(chunkPath);
      const chunkBuffer = await fs.promises.readFile(chunkPath);
      writeStream.write(chunkBuffer);
    }
  } catch (error) {
    writeStream.destroy();
    throw error;
  }

  await new Promise<void>((resolve, reject) => {
    writeStream.end((error: Error | null | undefined) => {
      if (error) {
        reject(error);
        return;
      }
      resolve();
    });
  });

  await fs.promises.rm(uploadTempDir, { recursive: true, force: true });

  let thumbnailUrl = null;
  let duration = null;
  const videoExtensions = ['.mp4', '.mkv', '.webm', '.avi', '.mov'];
  if (videoExtensions.includes(extension)) {
    const [thumb, meta] = await Promise.all([
      extractThumbnail(targetPath, `${baseName}-thumb`),
      getVideoMetadata(targetPath)
    ]);
    thumbnailUrl = thumb;
    duration = meta?.duration;
  }

  return NextResponse.json({ 
    url: `/uploads/${targetName}`,
    thumbnailUrl,
    duration
  });
}

export async function POST(req: NextRequest) {
  try {
    const isAdmin = await requireAdmin();

    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const contentType = req.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      return await handleChunkFinalize(req);
    }

    if (!contentType.includes('multipart/form-data')) {
      return NextResponse.json({ error: 'Invalid content type' }, { status: 400 });
    }

    const formData = await req.formData();
    const mode = formData.get('mode');

    if (mode === 'chunk') {
      return await handleChunkUpload(formData);
    }

    return await handleSingleFileUpload(formData);
  } catch (error) {
    console.error('Upload route error:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Upload failed' }, { status: 500 });
  }
}
