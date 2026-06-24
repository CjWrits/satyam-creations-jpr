'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function createCategory(name: string) {
  if (!name.trim()) throw new Error('Category name is required.');
  
  const slug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

  try {
    const category = await prisma.category.create({
      data: { name, slug },
    });
    revalidatePath('/');
    revalidatePath('/catalog');
    revalidatePath('/admin');
    return { success: true, category };
  } catch (error: unknown) {
    const err = error as { code?: string; message?: string };
    if (err.code === 'P2002') {
      throw new Error('Category name or slug already exists.');
    }
    throw new Error(err.message || 'Failed to create category.');
  }
}

export async function updateCategory(id: string, name: string) {
  if (!name.trim()) throw new Error('Category name is required.');
  
  const slug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

  try {
    const category = await prisma.category.update({
      where: { id },
      data: { name, slug },
    });
    revalidatePath('/');
    revalidatePath('/catalog');
    revalidatePath('/admin');
    return { success: true, category };
  } catch (error: unknown) {
    const err = error as { message?: string };
    throw new Error(err.message || 'Failed to update category.');
  }
}

export async function deleteCategory(id: string) {
  try {
    // Check if there are any products attached to this category
    const productsCount = await prisma.product.count({
      where: { categoryId: id },
    });
    if (productsCount > 0) {
      throw new Error('Cannot delete category because it has products associated with it.');
    }

    await prisma.category.delete({
      where: { id },
    });
    revalidatePath('/');
    revalidatePath('/catalog');
    revalidatePath('/admin');
    return { success: true };
  } catch (error: unknown) {
    const err = error as { message?: string };
    throw new Error(err.message || 'Failed to delete category.');
  }
}
