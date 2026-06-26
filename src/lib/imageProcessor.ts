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

function getMimeType(ext: string): string {
  switch (ext.toLowerCase()) {
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.png':
      return 'image/png';
    case '.webp':
      return 'image/webp';
    case '.avif':
      return 'image/avif';
    case '.svg':
      return 'image/svg+xml';
    default:
      return 'image/jpeg';
  }
}

export async function processImage(
  buffer: Buffer,
  originalFilename: string
): Promise<ProcessedImages> {
  let useBase64 = false;

  if (!UPLOAD_DIR) {
    useBase64 = true;
  } else {
    try {
      await ensureDirsExist();
    } catch {
      console.warn('Directory creation failed. Falling back to database Base64 storage.');
      useBase64 = true;
    }
  }

  const fileExt = path.extname(originalFilename);
  const baseName = path
    .basename(originalFilename, fileExt)
    .replace(/[^a-zA-Z0-9]/g, '_');

  if (useBase64) {
    // 1. Generate optimized WebP buffer
    const optimizedBuffer = await sharp(buffer)
      .resize({
        width: 1600,
        height: 2400,
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality: 80 })
      .toBuffer();

    // 2. Generate WebP thumbnail
    const thumbnailBuffer = await sharp(buffer)
      .resize({
        width: 400,
        height: 600,
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality: 75 })
      .toBuffer();

    // 3. For original, compress it if it is very large (> 4MB) to protect database columns
    let originalBase64 = '';
    if (buffer.length > 4 * 1024 * 1024) {
      const compressedOriginal = await sharp(buffer)
        .webp({ quality: 60 })
        .toBuffer();
      originalBase64 = `data:image/webp;base64,${compressedOriginal.toString('base64')}`;
    } else {
      const mimeType = getMimeType(fileExt);
      originalBase64 = `data:${mimeType};base64,${buffer.toString('base64')}`;
    }

    return {
      original: originalBase64,
      url: `data:image/webp;base64,${optimizedBuffer.toString('base64')}`,
      thumbnail: `data:image/webp;base64,${thumbnailBuffer.toString('base64')}`,
    };
  }

  // Standard File System Storage
  const uniqueId = uuidv4();
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

  try {
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
  } catch (err) {
    console.warn('Write failed during file system processing. Reverting to Base64.', err);
    
    const optimizedBuffer = await sharp(buffer)
      .resize({ width: 1600, height: 2400, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer();

    const thumbnailBuffer = await sharp(buffer)
      .resize({ width: 400, height: 600, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 75 })
      .toBuffer();

    let originalBase64 = '';
    if (buffer.length > 4 * 1024 * 1024) {
      const compressedOriginal = await sharp(buffer)
        .webp({ quality: 60 })
        .toBuffer();
      originalBase64 = `data:image/webp;base64,${compressedOriginal.toString('base64')}`;
    } else {
      const mimeType = getMimeType(fileExt);
      originalBase64 = `data:${mimeType};base64,${buffer.toString('base64')}`;
    }

    return {
      original: originalBase64,
      url: `data:image/webp;base64,${optimizedBuffer.toString('base64')}`,
      thumbnail: `data:image/webp;base64,${thumbnailBuffer.toString('base64')}`,
    };
  }
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