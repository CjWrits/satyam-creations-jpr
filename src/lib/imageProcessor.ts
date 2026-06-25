import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const UPLOAD_DIR = process.env.UPLOAD_DIR || '';

export interface ProcessedImages {
  original: string;
  url: string;
  thumbnail: string;
}

async function ensureDirsExist() {
  const dirs = [
    path.join(process.cwd(), UPLOAD_DIR, 'original'),
    path.join(process.cwd(), UPLOAD_DIR, 'optimized'),
    path.join(process.cwd(), UPLOAD_DIR, 'thumbnails'),
  ];

  for (const dir of dirs) {
    await fs.mkdir(dir, { recursive: true });
  }
}

export async function processImage(
  buffer: Buffer,
  originalFilename: string
): Promise<ProcessedImages> {
  await ensureDirsExist();

  const uniqueId = uuidv4();
  const fileExt = path.extname(originalFilename);
  const baseName = path
    .basename(originalFilename, fileExt)
    .replace(/[^a-zA-Z0-9]/g, '_');

  const originalFilenameUnique = `${uniqueId}-${baseName}${fileExt}`;
  const optimizedFilename = `${uniqueId}-${baseName}.webp`;
  const thumbnailFilename = `${uniqueId}-${baseName}-thumb.webp`;

  const originalPath = path.join(
    process.cwd(),
    UPLOAD_DIR,
    'original',
    originalFilenameUnique
  );

  const optimizedPath = path.join(
    process.cwd(),
    UPLOAD_DIR,
    'optimized',
    optimizedFilename
  );

  const thumbnailPath = path.join(
    process.cwd(),
    UPLOAD_DIR,
    'thumbnails',
    thumbnailFilename
  );

  await fs.writeFile(originalPath, buffer);

  await sharp(buffer)
    .resize({
      width: 1600,
      height: 2400,
      fit: 'inside',
      withoutEnlargement: true,
    })
    .webp({ quality: 82 })
    .toFile(optimizedPath);

  await sharp(buffer)
    .resize({
      width: 400,
      height: 600,
      fit: 'inside',
      withoutEnlargement: true,
    })
    .webp({ quality: 75 })
    .toFile(thumbnailPath);

  const uploadPublicPath = UPLOAD_DIR.startsWith('public')
    ? UPLOAD_DIR.replace(/^public/, '')
    : `/${UPLOAD_DIR}`;

  return {
    original: path
      .join(uploadPublicPath, 'original', originalFilenameUnique)
      .replace(/\\/g, '/'),

    url: path
      .join(uploadPublicPath, 'optimized', optimizedFilename)
      .replace(/\\/g, '/'),

    thumbnail: path
      .join(uploadPublicPath, 'thumbnails', thumbnailFilename)
      .replace(/\\/g, '/'),
  };
}

export async function deleteImageFiles(
  originalUrl: string,
  optimizedUrl: string,
  thumbnailUrl: string
) {
  try {
    const originalPath = path.join(process.cwd(), 'public', originalUrl);
    const optimizedPath = path.join(process.cwd(), 'public', optimizedUrl);
    const thumbnailPath = path.join(process.cwd(), 'public', thumbnailUrl);

    await fs.unlink(originalPath).catch(() => {});
    await fs.unlink(optimizedPath).catch(() => {});
    await fs.unlink(thumbnailPath).catch(() => {});
  } catch (error) {
    console.error('Failed to delete image files from disk:', error);
  }
}