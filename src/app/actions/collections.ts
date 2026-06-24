'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function createCollection(name: string, description?: string) {
  if (!name.trim()) throw new Error('Collection name is required.');
  
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
    const err = error as { code?: string; message?: string };
    if (err.code === 'P2002') {
      throw new Error('Collection name or slug already exists.');
    }
    throw new Error(err.message || 'Failed to create collection.');
  }
}

export async function updateCollection(id: string, name: string, description?: string) {
  if (!name.trim()) throw new Error('Collection name is required.');
  
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
    const err = error as { message?: string };
    throw new Error(err.message || 'Failed to update collection.');
  }
}

export async function deleteCollection(id: string) {
  try {
    // Check if there are any products attached to this collection
    const productsCount = await prisma.product.count({
      where: { collectionId: id },
    });
    if (productsCount > 0) {
      throw new Error('Cannot delete collection because it has products associated with it.');
    }

    await prisma.collection.delete({
      where: { id },
    });
    revalidatePath('/');
    revalidatePath('/catalog');
    revalidatePath('/admin');
    return { success: true };
  } catch (error: unknown) {
    const err = error as { message?: string };
    throw new Error(err.message || 'Failed to delete collection.');
  }
}
