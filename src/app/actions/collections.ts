'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function createCollection(name: string, description?: string) {
  if (!name.trim()) {
    return { success: false, error: 'Collection name is required.' };
  }
  
  const slug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

  try {
    const collection = await prisma.collection.create({
      data: { name, slug, description },
    });
    revalidatePath('/');
    revalidatePath('/catalog');
    revalidatePath('/admin');
    return { success: true, collection };
  } catch (error: unknown) {
    console.error('SERVER ACTION ERROR: createCollection failed:', error);
    const err = error as { code?: string; message?: string };
    if (err.code === 'P2002') {
      return { success: false, error: 'Collection name or slug already exists.' };
    }
    return { success: false, error: err.message || 'Failed to create collection.' };
  }
}

export async function updateCollection(id: string, name: string, description?: string) {
  if (!name.trim()) {
    return { success: false, error: 'Collection name is required.' };
  }
  
  const slug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

  try {
    const collection = await prisma.collection.update({
      where: { id },
      data: { name, slug, description },
    });
    revalidatePath('/');
    revalidatePath('/catalog');
    revalidatePath('/admin');
    return { success: true, collection };
  } catch (error: unknown) {
    console.error('SERVER ACTION ERROR: updateCollection failed:', error);
    const err = error as { message?: string };
    return { success: false, error: err.message || 'Failed to update collection.' };
  }
}

export async function deleteCollection(id: string) {
  try {
    // Check if there are any products attached to this collection
    const productsCount = await prisma.product.count({
      where: { collectionId: id },
    });
    if (productsCount > 0) {
      return { success: false, error: 'Cannot delete collection because it has products associated with it.' };
    }

    await prisma.collection.delete({
      where: { id },
    });
    revalidatePath('/');
    revalidatePath('/catalog');
    revalidatePath('/admin');
    return { success: true };
  } catch (error: unknown) {
    console.error('SERVER ACTION ERROR: deleteCollection failed:', error);
    const err = error as { message?: string };
    return { success: false, error: err.message || 'Failed to delete collection.' };
  }
}

