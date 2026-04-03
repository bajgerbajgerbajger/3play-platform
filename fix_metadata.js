const { PrismaClient } = require('@prisma/client');
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');

// Set up Prisma for SQLite
const dbPath = path.resolve(process.cwd(), 'prisma', 'dev.db');
const url = `file:${dbPath}`;
const adapter = new PrismaBetterSqlite3({ url });
const prisma = new PrismaClient({ adapter });

async function getDuration(videoPath) {
  return new Promise((resolve) => {
    ffmpeg.ffprobe(videoPath, (err, metadata) => {
      if (err) {
        console.error(`  - FFprobe error for ${videoPath}:`, err.message);
        resolve(null);
        return;
      }
      const duration = metadata.format.duration;
      resolve(duration ? Math.floor(duration / 60) : null);
    });
  });
}

async function extractThumbnail(videoPath, outputName) {
  return new Promise((resolve) => {
    const uploadsRoot = path.join(process.cwd(), 'public', 'uploads');
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

async function fixMetadata() {
  console.log('--- Starting Metadata Fix ---');
  try {
    const movies = await prisma.movie.findMany({
      where: {
        OR: [
          { duration: 0 },
          { posterUrl: '' },
          { posterUrl: null }
        ]
      }
    });

    console.log(`Found ${movies.length} movies to check...`);

    for (const movie of movies) {
      if (!movie.videoUrl) {
        console.log(`  - Skipping "${movie.title}" (no video URL)`);
        continue;
      }

      const videoPath = path.join(process.cwd(), 'public', movie.videoUrl);
      console.log(`  - Checking "${movie.title}"...`);

      const updates = {};

      // Fix duration if missing
      if (!movie.duration || movie.duration === 0) {
        const duration = await getDuration(videoPath);
        if (duration) {
          updates.duration = duration;
          console.log(`    - Found duration: ${duration}m`);
        }
      }

      // Fix poster if missing
      if (!movie.posterUrl || movie.posterUrl === '') {
        const baseName = path.basename(movie.videoUrl, path.extname(movie.videoUrl));
        const thumb = await extractThumbnail(videoPath, `${baseName}-thumb`);
        if (thumb) {
          updates.posterUrl = thumb;
          updates.backdropUrl = movie.backdropUrl || thumb;
          console.log(`    - Generated random wallpaper: ${thumb}`);
        }
      }

      // If anything to update, do it
      if (Object.keys(updates).length > 0) {
        await prisma.movie.update({
          where: { id: movie.id },
          data: updates
        });
        console.log(`    - Successfully updated!`);
      } else {
        console.log(`    - No changes needed or possible.`);
      }
    }

    console.log('--- All done! ---');
  } catch (error) {
    console.error('Error fixing metadata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixMetadata();
