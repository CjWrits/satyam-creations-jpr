'use server';

import prisma from '@/lib/prisma';
import { processImage, deleteImageFiles } from '@/lib/imageProcessor';
import { revalidatePath } from 'next/cache';

/**
 * Creates a new product.
 */
export async function createProduct(formData: FormData) {
  try {
    const code = formData.get('code') as string;
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const priceStr = formData.get('price') as string;
    const categoryId = formData.get('categoryId') as string;
    const collectionId = formData.get('collectionId') as string;

    const price = priceStr ? parseFloat(priceStr) : null;

    const cleanCategoryId = 
      typeof categoryId === 'string' && 
      categoryId.trim() !== '' && 
      categoryId.trim() !== 'null' && 
      categoryId.trim() !== 'undefined' 
        ? categoryId.trim() 
        : null;

    const cleanCollectionId = 
      typeof collectionId === 'string' && 
      collectionId.trim() !== '' && 
      collectionId.trim() !== 'null' && 
      collectionId.trim() !== 'undefined' 
        ? collectionId.trim() 
        : null;

    if (!code || !name || !cleanCategoryId) {
      return { success: false, error: 'Code, Name, and Category are required.' };
    }

    // Handle uploaded images
    const imageFiles = formData.getAll('images') as File[];
    const validFiles = imageFiles.filter((file) => file.name && file.size > 0);

    console.log("=== PRODUCT CREATE ===");
    console.log("categoryId:", cleanCategoryId);
    console.log("collectionId:", cleanCollectionId);

    // 1. Create the product first
    const product = await prisma.product.create({
      data: {
        code: code.trim().toUpperCase(),
        name: name.trim(),
        description: description?.trim() || null,
        price,
        categoryId: cleanCategoryId,
        collectionId: cleanCollectionId,
      },
    });

    // 2. Process and save images
    if (validFiles.length > 0) {
      const processedImages = [];
      
      for (let i = 0; i < validFiles.length; i++) {
        const file = validFiles[i];
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        
        // Optimize and compress
        const processed = await processImage(buffer, file.name);
        
        processedImages.push({
          productId: product.id,
          url: processed.url,
          thumbnail: processed.thumbnail,
          original: processed.original,
          isPrimary: i === 0, // Make the first image primary by default
          order: i,
        });
      }

      await prisma.image.createMany({
        data: processedImages,
      });
    }

    revalidatePath('/');
    revalidatePath('/catalog');
    revalidatePath('/admin');
    return { success: true, productId: product.id };
  } catch (error: unknown) {
    console.error('SERVER ACTION ERROR: createProduct failed:', error);
    const err = error as { code?: string; message?: string };
    if (err.code === 'P2002') {
      return { success: false, error: 'Product code already exists. Every product must have a unique code.' };
    }
    return { success: false, error: err.message || 'Failed to create product.' };
  }
}

/**
 * Updates an existing product.
 */
export async function updateProduct(id: string, formData: FormData) {
  try {
    const code = formData.get('code') as string;
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const priceStr = formData.get('price') as string;
    const categoryId = formData.get('categoryId') as string;
    const collectionId = formData.get('collectionId') as string;
    
    const price = priceStr ? parseFloat(priceStr) : null;

    const cleanCategoryId = 
      typeof categoryId === 'string' && 
      categoryId.trim() !== '' && 
      categoryId.trim() !== 'null' && 
      categoryId.trim() !== 'undefined' 
        ? categoryId.trim() 
        : null;

    const cleanCollectionId = 
      typeof collectionId === 'string' && 
      collectionId.trim() !== '' && 
      collectionId.trim() !== 'null' && 
      collectionId.trim() !== 'undefined' 
        ? collectionId.trim() 
        : null;

    if (!code || !name || !cleanCategoryId) {
      return { success: false, error: 'Code, Name, and Category are required.' };
    }

    // Images to remove
    const removedImageIds = JSON.parse((formData.get('removedImageIds') as string) || '[]') as string[];

    // New images to add
    const newImageFiles = formData.getAll('images') as File[];
    const validNewFiles = newImageFiles.filter((file) => file.name && file.size > 0);

    // Index of primary image if updated
    const primaryImageId = formData.get('primaryImageId') as string;

    // 1. Delete removed images from disk and DB
    if (removedImageIds.length > 0) {
      const imagesToDelete = await prisma.image.findMany({
        where: { id: { in: removedImageIds } },
      });

      for (const img of imagesToDelete) {
        await deleteImageFiles(img.original, img.url, img.thumbnail);
      }

      await prisma.image.deleteMany({
        where: { id: { in: removedImageIds } },
      });
    }

    // 2. Process and save new images
    if (validNewFiles.length > 0) {
      // Find current max order
      const existingImagesCount = await prisma.image.count({
        where: { productId: id },
      });

      const processedImages = [];
      for (let i = 0; i < validNewFiles.length; i++) {
        const file = validNewFiles[i];
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        
        const processed = await processImage(buffer, file.name);
        
        processedImages.push({
          productId: id,
          url: processed.url,
          thumbnail: processed.thumbnail,
          original: processed.original,
          isPrimary: false, // Default false, will set primary below if needed
          order: existingImagesCount + i,
        });
      }

      await prisma.image.createMany({
        data: processedImages,
      });
    }

    // 3. Update the product basic details
    await prisma.product.update({
      where: { id },
      data: {
        code: code.trim().toUpperCase(),
        name: name.trim(),
        description: description?.trim() || null,
        price,
        categoryId: cleanCategoryId,
        collectionId: cleanCollectionId,
      },
    });

    // 4. Update primary image status
    if (primaryImageId) {
      // Set all other images for this product to not primary
      await prisma.image.updateMany({
        where: { productId: id },
        data: { isPrimary: false },
      });
      // Set the chosen one as primary
      await prisma.image.update({
        where: { id: primaryImageId },
        data: { isPrimary: true },
      });
    } else {
      // Verify if there is at least one primary image, if not set the first one
      const currentPrimary = await prisma.image.findFirst({
        where: { productId: id, isPrimary: true },
      });
      
      if (!currentPrimary) {
        const firstImg = await prisma.image.findFirst({
          where: { productId: id },
          orderBy: { order: 'asc' },
        });
        if (firstImg) {
          await prisma.image.update({
            where: { id: firstImg.id },
            data: { isPrimary: true },
          });
        }
      }
    }

    revalidatePath('/');
    revalidatePath('/catalog');
    revalidatePath(`/product/${id}`);
    revalidatePath('/admin');
    return { success: true };
  } catch (error: unknown) {
    console.error('SERVER ACTION ERROR: updateProduct failed:', error);
    const err = error as { code?: string; message?: string };
    if (err.code === 'P2002') {
      return { success: false, error: 'Product code already exists.' };
    }
    return { success: false, error: err.message || 'Failed to update product.' };
  }
}

/**
 * Deletes a product along with all its images from the DB and filesystem.
 */
export async function deleteProduct(id: string) {
  try {
    // 1. Fetch images to delete their files from disk
    const images = await prisma.image.findMany({
      where: { productId: id },
    });

    for (const img of images) {
      await deleteImageFiles(img.original, img.url, img.thumbnail);
    }

    // 2. Delete product (cascade deletes images from DB)
    await prisma.product.delete({
      where: { id },
    });

    revalidatePath('/');
    revalidatePath('/catalog');
    revalidatePath('/admin');
    return { success: true };
  } catch (error: unknown) {
    console.error('SERVER ACTION ERROR: deleteProduct failed:', error);
    const err = error as { message?: string };
    return { success: false, error: err.message || 'Failed to delete product.' };
  }
}

/**
 * Bulk product creation: creates a product for each uploaded image.
 * Code and name are derived from the image filename.
 */
export async function bulkUploadProducts(categoryId: string, collectionId: string | null, imageFilesFormData: FormData) {
  const files = imageFilesFormData.getAll('images') as File[];
  const validFiles = files.filter((file) => file.name && file.size > 0);

  const cleanCategoryId = 
    typeof categoryId === 'string' && 
    categoryId.trim() !== '' && 
    categoryId.trim() !== 'null' && 
    categoryId.trim() !== 'undefined' 
      ? categoryId.trim() 
      : null;

  const cleanCollectionId = 
    typeof collectionId === 'string' && 
    collectionId.trim() !== '' && 
    collectionId.trim() !== 'null' && 
    collectionId.trim() !== 'undefined' 
      ? collectionId.trim() 
      : null;

  if (!cleanCategoryId) {
    return {
      total: 0,
      success: 0,
      errors: ['Category is required for bulk upload.'],
    };
  }

  if (validFiles.length === 0) {
    return {
      total: 0,
      success: 0,
      errors: ['No images selected.'],
    };
  }

  const results = {
    total: validFiles.length,
    success: 0,
    errors: [] as string[],
  };

  for (const file of validFiles) {
    try {
      // Derive name and code from filename
      const fileExt = file.name.substring(file.name.lastIndexOf('.'));
      const rawName = file.name.replace(fileExt, '').replace(/[-_]+/g, ' ').trim();
      
      // Make capital name
      const name = rawName.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      // Code is first letters of name + random or timestamp (or just safe string)
      const sanitizedCode = rawName.toUpperCase().replace(/\s+/g, '-').substring(0, 10) + '-' + Math.floor(100 + Math.random() * 900);

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      // 1. Process image
      const processed = await processImage(buffer, file.name);

      // 2. Create product
      const product = await prisma.product.create({
        data: {
          code: sanitizedCode,
          name: name,
          categoryId: cleanCategoryId,
          collectionId: cleanCollectionId,
        },
      });

      // 3. Create image record
      await prisma.image.create({
        data: {
          productId: product.id,
          url: processed.url,
          thumbnail: processed.thumbnail,
          original: processed.original,
          isPrimary: true,
          order: 0,
        },
      });

      results.success++;
    } catch (err: unknown) {
      const error = err as { message?: string };
      console.error(`SERVER ACTION ERROR: Bulk upload failed for ${file.name}:`, err);
      results.errors.push(`${file.name}: ${error.message || 'Unknown error'}`);
    }
  }

  revalidatePath('/');
  revalidatePath('/catalog');
  revalidatePath('/admin');

  return results;
}

