import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const UPLOAD_DIR = process.env.UPLOAD_DIR || 'public/uploads';

export interface ProcessedImages {
  original: string;
  url: string;      // Optimized image URL
  thumbnail: string;
}

/**
 * Ensures that all necessary upload directories exist.
 */
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

/**
 * Processes an uploaded image buffer.
 * 1. Saves the original backup.
 * 2. Compresses and generates an optimized WebP version.
 * 3. Generates a WebP thumbnail version.
 * 
 * @param buffer - The raw image file buffer.
 * @param originalFilename - The original file name.
 * @returns Object containing public URLs for original, optimized, and thumbnail images.
 */
export async function processImage(buffer: Buffer, originalFilename: string): Promise<ProcessedImages> {
  await ensureDirsExist();

  const uniqueId = uuidv4();
  const fileExt = path.extname(originalFilename);
  const baseName = path.basename(originalFilename, fileExt).replace(/[^a-zA-Z0-9]/g, '_');
  
  const originalFilenameUnique = `${uniqueId}-${baseName}${fileExt}`;
  const optimizedFilename = `${uniqueId}-${baseName}.webp`;
  const thumbnailFilename = `${uniqueId}-${baseName}-thumb.webp`;

  const originalPath = path.join(process.cwd(), UPLOAD_DIR, 'original', originalFilenameUnique);
  const optimizedPath = path.join(process.cwd(), UPLOAD_DIR, 'optimized', optimizedFilename);
  const thumbnailPath = path.join(process.cwd(), UPLOAD_DIR, 'thumbnails', thumbnailFilename);

  // 1. Save original backup
  await fs.writeFile(originalPath, buffer);

  // 2. Compress and generate optimized WebP
  // Limit max width to 1600px to maintain crisp quality while keeping file size small
  await sharp(buffer)
    .resize({ width: 1600, height: 2400, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 82 })
    .toFile(optimizedPath);

  // 3. Generate WebP thumbnail (e.g. max 400px width/height)
  await sharp(buffer)
    .resize({ width: 400, height: 600, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 75 })
    .toFile(thumbnailPath);

  // Return public URLs for Next.js Image component
  // Assumes that 'public/' folder is served at '/' by Next.js
  const uploadPublicPath = UPLOAD_DIR.startsWith('public') 
    ? UPLOAD_DIR.replace(/^public/, '') 
    : `/${UPLOAD_DIR}`;

  return {
    original: path.join(uploadPublicPath, 'original', originalFilenameUnique).replace(/\\/g, '/'),
    url: path.join(uploadPublicPath, 'optimized', optimizedFilename).replace(/\\/g, '/'),
    thumbnail: path.join(uploadPublicPath, 'thumbnails', thumbnailFilename).replace(/\\/g, '/'),
  };
}

/**
 * Deletes associated images from disk.
 * Useful when deleting products or images.
 */
export async function deleteImageFiles(originalUrl: string, optimizedUrl: string, thumbnailUrl: string) {
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
